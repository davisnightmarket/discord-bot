import { type NmRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK } from '../nm-const';
import { GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    type SpreadsheetDataModel,
    type NmPersonDataService,
    type PersonModel
} from '.';

export interface NightDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
}

export interface NightDataTimelineModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
    stamp: string;
}

export interface NightDataOrgPickupModel extends SpreadsheetDataModel {
    day: string;
    org: string;
    timeStart: string;
    note: string;
}

type NightPersonModel = PersonModel &
    Pick<NightDataModel, 'role' | 'period' | 'discordIdOrEmail'>;

export type NightModel = Pick<
    NightDataModel,
    'day' | 'org' | 'timeStart' | 'timeEnd'
> & {
    personList: NightPersonModel[];
    noteList: string[];
};

export interface NightCacheModel {
    pickupsList: NightModel[];
    nightCapList: NightModel[];
    hostList: NightModel[];
}

export class NmNightDataService {
    private readonly nightSheetService: GoogleSheetService<NightDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<NightDataTimelineModel>;
    private readonly opsNotesSheetService: GoogleSheetService<NightDataOrgPickupModel>;
    personCoreDataService: NmPersonDataService;

    opsCache: Promise<NightCacheModel> = Promise.resolve({
        pickupsList: [],
        nightCapList: [],
        hostList: []
    });

    constructor(
        spreadsheetId: string,
        personCoreDataService: NmPersonDataService
    ) {
        this.nightSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'ops'
        });

        this.opsTimelineSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'ops-timeline'
        });

        this.opsNotesSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'ops-pickup-notes'
        });

        this.personCoreDataService = personCoreDataService;

        this.refreshCache();
    }

    updateNightSheet() {}

    async getNightTimelineList(
        // we don't need more than 1000 records to figure out the timeline
        limitRows = 1000
    ) {
        this.opsTimelineSheetService.getAllRowsAsMaps({ limitRows });
    }

    async getNightDataByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<NightDataModel[]> {
        const p = await this.nightSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }

    async getNightByDay(
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<NightCacheModel> {
        const { pickupsList, nightCapList, hostList } = await this.opsCache;
        return {
            pickupsList: pickupsList.filter((a) => a.day === day),
            nightCapList: nightCapList.filter((a) => a.day === day),
            hostList: hostList.filter((a) => a.day === day)
        };
    }

    // send a new ops record to the sheet
    async updateNightData(opToUpdate: NightDataModel) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const { pickupsList, nightCapList, hostList } = await this.opsCache;
        const headerList = await this.nightSheetService.waitingForHeaderList;
        const opsData = [
            ...pickupsList.map(this.fromOpToOpData),
            ...nightCapList.map(this.fromOpToOpData),
            ...hostList.map(this.fromOpToOpData)
        ].flat();

        // add the new data
        opsData.push(opToUpdate);
        // in here we sort by day
        const opsRows = opsData
            .sort(
                (a, b) =>
                    DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
            )
            // in here we add blank lines
            .reduce<Array<NightDataModel | null>>((a, b, i) => {
                if (opsData[i + 1]?.day !== b.day) {
                    a?.push(null);
                }
                return a;
            }, [])
            // turn it into an array of data mapping to the headers
            .map((op) => {
                return op
                    ? headerList.map((header) => op[header])
                    : headerList.map(() => '');
            });

        await this.nightSheetService.replaceAllRowsExceptHeader(
            opsRows as string[][]
        );
    }

    // turns an operation record into an ops sheet data record
    fromOpToOpData({
        day,
        org,
        timeStart,
        timeEnd,
        personList
    }: NightModel): NightDataModel[] {
        return personList.map(({ role, discordIdOrEmail, period }) => ({
            role,
            discordIdOrEmail,
            period,
            day,
            org,
            timeStart,
            timeEnd
        }));
    }

    async refreshCache() {
        this.opsCache = this.getNightCache();
    }

    async getNightCache(): Promise<NightCacheModel> {
        const notesList = await this.opsNotesSheetService.getAllRowsAsMaps();

        const opsList = await this.nightSheetService.getAllRowsAsMaps();

        // get unique persons and add role, period, and discordIdOrEmail
        const personList: NightPersonModel[] = (
            await Promise.all(
                opsList.map(
                    async ({
                        timeStart,
                        timeEnd,
                        org,
                        role,
                        discordIdOrEmail,
                        period
                    }) => {
                        return await this.personCoreDataService
                            .getPersonByEmailOrDiscordId(discordIdOrEmail)
                            .then((b) => {
                                return b
                                    ? {
                                          ...b,
                                          timeStart,
                                          timeEnd,
                                          org,
                                          discordIdOrEmail,
                                          period,
                                          role
                                      }
                                    : null;
                            });
                    }
                )
            )
        ).filter((a) => a) as NightPersonModel[];

        // reduce ops to one per day+org+timeStart
        // which allows us to collect people and roles
        const pickupsList = opsList
            .filter((a) => a.role === 'night-pickup')
            .reduce<{ [k in string]: NightModel }>(
                (a, { day, org, timeStart, timeEnd, discordIdOrEmail }) => {
                    if (!a[day + org + timeStart]) {
                        a[day + org + timeStart] = {
                            day,
                            org,
                            timeStart,
                            timeEnd,
                            personList: [],
                            noteList: notesList
                                .filter(
                                    (note) =>
                                        note.day === day &&
                                        note.org === org &&
                                        // if there is a note timeStart, it means the
                                        // note is for a specific pickup time, not just that day and org
                                        (note.timeStart
                                            ? note.timeStart === timeStart
                                            : true)
                                )
                                .map((n) => n.note)
                        };
                    }
                    const p = personList.find(
                        (p) => p.discordIdOrEmail === discordIdOrEmail
                    );
                    if (p) {
                        a[day + org + timeStart].personList.push(p);
                    }

                    return a;
                },
                {}
            );

        // we expect an array
        return {
            pickupsList: Object.values(pickupsList),
            nightCapList: Object.values(pickupsList),
            hostList: Object.values(pickupsList)
        };
    }
}
