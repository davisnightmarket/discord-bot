import { type NmRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK } from '../nm-const';
import { GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    type NmPersonDataService,
    type PersonModel
} from './';

export type OpsDataModel = {
    day: NmDayNameType;
    role: NmRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
};

export type OpsDataTimelineModel = {
    day: NmDayNameType;
    role: NmRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
    stamp: string;
};

export type OpsDataOrgPickupModel = {
    day: string;
    org: string;
    timeStart: string;
    note: string;
};

type OpsPersonModel = PersonModel &
    Pick<OpsDataModel, 'role' | 'period' | 'discordIdOrEmail'>;

export type OpsModel = Pick<
    OpsDataModel,
    'day' | 'org' | 'timeStart' | 'timeEnd'
> & {
    personList: OpsPersonModel[];
    noteList: string[];
};

export class NmOpsDataService {
    private readonly opsSheetService: GoogleSheetService<OpsDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<OpsDataTimelineModel>;
    private readonly opsNotesSheetService: GoogleSheetService<OpsDataOrgPickupModel>;
    personCoreDataService: NmPersonDataService;

    opsCache: Promise<OpsModel[]> = Promise.resolve([]);
    constructor(
        spreadsheetId: string,
        personCoreDataService: NmPersonDataService
    ) {
        this.opsSheetService = new GoogleSheetService({
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

    updateOpsSheet() {}

    async getOpsTimelineList(
        // we don't need more than 1000 records to figure out the timeline
        limitRows = 1000
    ) {
        this.opsTimelineSheetService.getAllRowsAsMaps({ limitRows });
    }

    async getOpsDataByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<OpsDataModel[]> {
        const p = await this.opsSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }

    async getOpsByDay(
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<OpsModel[]> {
        const opsCache = await this.opsCache;
        return opsCache.filter((a) => a.day === day);
    }

    // send a new ops record to the sheet
    async updateOpsData(opToUpdate: OpsDataModel) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const opsCache = await this.opsCache;
        const headerList = await this.opsSheetService.waitingForHeaderList;
        const opsData = [...opsCache.map(this.fromOpToOpData)].flat();

        // add the new data
        opsData.push(opToUpdate);
        // in here we sort by day
        const opsRows = opsData
            .sort(
                (a, b) =>
                    DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
            )
            // in here we add blank lines
            .reduce<Array<OpsDataModel | null>>((a, b, i) => {
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

        await this.opsSheetService.replaceAllRowsExceptHeader(opsRows);
    }

    // turns an operation record into an ops sheet data record
    fromOpToOpData({
        day,
        org,
        timeStart,
        timeEnd,
        personList
    }: OpsModel): OpsDataModel[] {
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
        this.opsCache = this.getOpsCache();
    }

    async getOpsCache() {
        const notesList = await this.opsNotesSheetService.getAllRowsAsMaps();

        const opsList = await this.opsSheetService.getAllRowsAsMaps();

        // get unique persons and add role, period, and discordIdOrEmail
        const personList: OpsPersonModel[] = (
            await Promise.all(
                opsList.map(
                    async ({ role, discordIdOrEmail, period }) =>
                        await this.personCoreDataService
                            .getPersonByEmailOrDiscordId(discordIdOrEmail)
                            .then((b) => {
                                return b
                                    ? {
                                          ...b,
                                          discordIdOrEmail,
                                          period,
                                          role
                                      }
                                    : null;
                            })
                )
            )
        ).filter((a) => a) as OpsPersonModel[];

        // reduce ops to one per day+org+timeStart
        // which allows us to collect people and roles
        const opsUnique = opsList.reduce<{ [k in string]: OpsModel }>(
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
                    (p) => (p.discordIdOrEmail = discordIdOrEmail)
                );
                if (p) {
                    a[day + org + timeStart].personList.push(p);
                }

                return a;
            },
            {}
        );

        // we expect an array
        return Object.values(opsUnique);
    }
}
