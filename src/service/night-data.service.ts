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
    contact: string;
    timeStart: string;
    note: string;
}

type NightPersonModel = PersonModel &
    Pick<NightDataModel, 'role' | 'period' | 'discordIdOrEmail'>;

type NightPickupModel = Pick<
    NightDataModel,
    'org' | 'period' | 'discordIdOrEmail' | 'note'
> & {
    personList: NightPersonModel[];
};

// the model for the market itself
type Night = Pick<NightDataModel, 'day' | 'org' | 'timeStart' | 'timeEnd'> & {
    // all people
    personList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];
};

export type NightCacheModel = {
    [k in NmDayNameType]: Night;
};

export class NightCache implements NightCacheModel {
    monday: Night;
    tuesday: Night;
    wednesday: Night;
    thursday: Night;
    friday: Night;
    saturday: Night;
    sunday: Night;

    static fromData(opsList: NightDataModel[]): NightCache {
        return new NightCache(
            opsList.reduce((all, { day, org, timeStart, timeEnd }) => {
                if (!all[day]) {
                    all[day] = NightModel.create({
                        day,
                        // these should always be data about the market itself
                        org,
                        timeStart,
                        timeEnd,
                        personList: [],
                        pickupList: []
                    });
                }
                return all;
            }, {} as Partial<NightCacheModel>)
        );
    }

    constructor({
        monday = NightModel.create({}),
        tuesday = NightModel.create({}),
        wednesday = NightModel.create({}),
        thursday = NightModel.create({}),
        friday = NightModel.create({}),
        saturday = NightModel.create({}),
        sunday = NightModel.create({})
    }: Partial<NightCacheModel>) {
        this.monday = monday;
        this.tuesday = tuesday;
        this.wednesday = wednesday;
        this.thursday = thursday;
        this.friday = friday;
        this.saturday = saturday;
        this.sunday = sunday;
    }
}

export class NightModel implements Night {
    day: NmDayNameType;
    org: string;
    timeStart: string;
    timeEnd: string;
    personList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];

    static create({
        day = 'monday',
        org = '',
        timeStart = '',
        timeEnd = '',
        personList = [],
        pickupList = []
    }: Partial<Night>) {
        return new NightModel({
            day,
            org,
            timeStart,
            timeEnd,
            personList,
            pickupList
        });
    }
    constructor({
        day,
        org = '',
        timeStart = '',
        timeEnd = '',
        personList = [],
        pickupList = []
    }: Night) {
        if (!DAYS_OF_WEEK.includes(day)) {
            throw new Error('Night must have a day!');
        }
        this.day = day;
        this.org = org;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.personList = personList;
        this.pickupList = pickupList;
    }
}

export class NmNightDataService {
    private readonly nightSheetService: GoogleSheetService<NightDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<NightDataTimelineModel>;
    private readonly opsNotesSheetService: GoogleSheetService<NightDataOrgPickupModel>;
    personCoreDataService: NmPersonDataService;

    opsCache: Promise<NightCacheModel> = Promise.resolve(new NightCache({}));

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
    ): Promise<NightModel> {
        return (await this.opsCache)[day];
    }

    // send a new ops record to the sheet
    async updateNightData(opToUpdate: NightDataModel) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const ops = await this.opsCache;
        const headerList = await this.nightSheetService.waitingForHeaderList;
        const opsData = Object.values(ops).map(this.fromOpToOpData).flat();

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
        const nightCache = NightCache.fromData(opsList);

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

        for (const op of opsList) {
            const cached = nightCache[op.day];
            // stick all people on there
            cached.personList = personList.filter((a) => a.day === op.day);
        }

        // now get all the pickups
        const pickupsPerson = opsList.filter((a) => (a.role = 'night-pickup'));
        // now stick the orgs
        // TODO: finish this
        pickupsPerson.reduce<NightPickupModel[]>((all, op) => {
            return all;
        }, []);
        for (const { day } of pickupsPerson) {
            const cached = nightCache[day];
            // stick all people on there
            cached.pickupList.push({
                day,
                personList: []
            });
        }

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
    }
}
