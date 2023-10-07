import { type NmNightRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK } from '../const';
import { GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    type SpreadsheetDataModel,
    NmPersonDataService,
    type PersonModel,
    PersonWithIdModel
} from '.';

export interface NightDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
}

export interface NightDataTimelineModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
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

export type NightPersonModel = PersonModel &
    Pick<NightDataModel, 'role' | 'period' | 'discordIdOrEmail'>;

export type NightPickupModel = Pick<
    NightDataModel,
    | 'day'
    | 'role'
    | 'org'
    | 'period'
    | 'discordIdOrEmail'
    | 'timeStart'
    | 'timeEnd'
> & {
    personList: NightPersonModel[];
    noteList: string[];
};

// the model for the market itself
type Night = Pick<NightDataModel, 'day' | 'org' | 'timeStart' | 'timeEnd'> & {
    // distro and captain
    hostList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];
};

export type DayNightCache = {
    [k in NmDayNameType]: Night;
};
// each night operations organized by day
export class DayNightCacheModel implements DayNightCache {
    monday: Night;
    tuesday: Night;
    wednesday: Night;
    thursday: Night;
    friday: Night;
    saturday: Night;
    sunday: Night;

    // static fromData(nightList: NightDataModel[]): DayNightCache {
    //     return new DayNightCacheModel(
    //         nightList.reduce((all, { day, org, timeStart, timeEnd }) => {
    //             if (!all[day]) {
    //                 all[day] = NightModel.create({
    //                     day,
    //                     // these should always be data about the market itself
    //                     org,
    //                     timeStart,
    //                     timeEnd,
    //                     hostList: [],
    //                     pickupList: []
    //                 });
    //             }
    //             return all;
    //         }, {} as Partial<DayNightCacheModel>)
    //     );
    // }

    constructor({
        monday = NightModel.create({}),
        tuesday = NightModel.create({}),
        wednesday = NightModel.create({}),
        thursday = NightModel.create({}),
        friday = NightModel.create({}),
        saturday = NightModel.create({}),
        sunday = NightModel.create({})
    }: Partial<DayNightCacheModel>) {
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
    hostList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];

    static create({
        day = 'monday',
        org = '',
        timeStart = '',
        timeEnd = '',
        hostList = [],
        pickupList = []
    }: Partial<Night>) {
        return new NightModel({
            day,
            org,
            timeStart,
            timeEnd,
            hostList,
            pickupList
        });
    }
    constructor({
        day,
        org = '',
        timeStart = '',
        timeEnd = '',
        hostList = [],
        pickupList = []
    }: Night) {
        if (!DAYS_OF_WEEK.includes(day)) {
            throw new Error('Night must have a day!');
        }
        this.day = day;
        this.org = org;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.hostList = hostList;
        this.pickupList = pickupList;
    }
}

export class NmNightDataService {
    private readonly nightSheetService: GoogleSheetService<NightDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<NightDataTimelineModel>;
    private readonly opsNotesSheetService: GoogleSheetService<NightDataOrgPickupModel>;
    personCoreDataService: NmPersonDataService;

    nightCache: Promise<DayNightCache> = Promise.resolve(
        new DayNightCacheModel({})
    );

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
        return (await this.nightCache)[day];
    }

    // send a new ops record to the sheet
    async updateNightData(nightToUpdate: NightDataModel) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const ops = await this.nightCache;
        const headerList = await this.nightSheetService.waitingForHeaderList;
        const nightData = Object.values(ops).map(this.toNightData).flat();

        // add the new data
        nightData.push(nightToUpdate);
        console.log(nightData);

        // in here we sort by day
        const nightRows = nightData
            .sort(
                (a, b) =>
                    DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
            )
            // in here we add blank lines
            .reduce<Array<NightDataModel | null>>(
                (
                    a,
                    {
                        day,
                        role,
                        org,
                        discordIdOrEmail,
                        period,
                        timeStart,
                        timeEnd
                    },
                    i
                ) => {
                    a.push({
                        day,
                        role,
                        org,
                        discordIdOrEmail,
                        period,
                        timeStart,
                        timeEnd
                    });
                    if (nightData[i + 1]?.day !== day) {
                        a.push(null);
                    }
                    return a;
                },
                []
            )
            // turn it into an array of data mapping to the headers
            .map((op) => {
                return op
                    ? headerList.map((header) => op[header])
                    : headerList.map(() => '');
            });

        console.log(nightRows);

        await this.nightSheetService.replaceAllRowsIncludingHeader(
            nightRows as string[][]
        );
    }

    // turns an operation record into an ops sheet data record
    toNightData({ day, hostList, pickupList }: NightModel): NightDataModel[] {
        return pickupList
            .map(
                ({
                    role,
                    discordIdOrEmail,
                    period,
                    org,
                    timeStart,
                    timeEnd
                }) => ({
                    role,
                    discordIdOrEmail,
                    period,
                    day,
                    org,
                    timeStart,
                    timeEnd
                })
            )
            .concat(
                hostList.map(
                    ({
                        role,
                        discordIdOrEmail,
                        period,
                        org = '',
                        timeStart = '',
                        timeEnd = ''
                    }) =>
                        ({
                            role,
                            discordIdOrEmail,
                            period,
                            day,
                            org,
                            timeStart,
                            timeEnd
                        } as NightDataModel)
                )
            );
    }

    async refreshCache() {
        this.nightCache = this.getNightCache();
    }

    async getNightCache(): Promise<DayNightCacheModel> {
        const notesList = await this.opsNotesSheetService.getAllRowsAsMaps();

        const nightList = await this.nightSheetService.getAllRowsAsMaps();
        //const nightCache = DayNightCacheModel.fromData(nightList);
        // add persons to record
        const personList = await this.getNightPersonList(nightList);

        // nightList.map(
        //     ({ timeStart, timeEnd, org, role, discordIdOrEmail, period }) => ({
        //         ...(personList.find(
        //             (a) => a?.discordIdOrEmail
        //         ) as PersonWithIdModel),
        //         timeStart,
        //         timeEnd,
        //         org,
        //         period,
        //         role
        //     })
        // );

        return new DayNightCacheModel(
            nightList.reduce<Partial<DayNightCacheModel>>((cache, op) => {
                const night = NightModel.create(op);
                if (!cache[op.day]) {
                    cache[op.day] = night;
                }

                // here we make sure that we don't miss any data per day
                // because a field is left blank on any one record
                Object.keys(night).forEach((k) => {
                    if ((night as any)[k] && !(cache[op.day] as any)[k]) {
                        (cache[op.day] as any)[k] = (night as any)[k];
                    }
                });

                // here we get each unique pickup with a list of people associated
                // onto a map and turn it into an array
                (cache[op.day] as NightModel).pickupList = Object.values(
                    // todo: put this in a method
                    nightList.reduce<{
                        [k in string]: NightPickupModel;
                    }>((a, p) => {
                        const { day, org, timeStart } = p;
                        if (
                            day &&
                            org &&
                            timeStart &&
                            !a[day + org + timeStart]
                        ) {
                            a[day + org + timeStart] = {
                                ...p,
                                personList: [],
                                noteList: []
                            };
                            if (p.role === 'night-pickup') {
                                const person = personList.find(
                                    (a) =>
                                        a.discordIdOrEmail ===
                                        p.discordIdOrEmail
                                ) as PersonWithIdModel;
                                if (person) {
                                    a[day + org + timeStart].personList.push({
                                        ...p,
                                        ...person
                                    });
                                }
                            }
                        }

                        return a;
                    }, {})
                );
                // here we simply want everyone associated with that night
                // as host or cap on a list
                (cache[op.day] as NightModel).hostList = nightList
                    .filter(
                        ({ role }) =>
                            role === 'night-captain' || role === 'night-host'
                    )
                    .map(({ discordIdOrEmail, period, role }) => {
                        const p = personList.find(
                            (a) => a.discordIdOrEmail === discordIdOrEmail
                        ) as PersonWithIdModel;
                        return {
                            ...p,
                            period,
                            role
                        };
                    })
                    .filter((a) => a);
                return cache;
            }, {})
        );
    }

    async getNightPersonList(
        nightList: NightDataModel[]
    ): Promise<PersonWithIdModel[]> {
        const personIdList = nightList.map((a) => a.discordIdOrEmail);
        return await Promise.all(
            personIdList
                .filter((a, i) => personIdList.indexOf(a) === i)
                .filter((a) => a)
                .map(async (discordIdOrEmail) => {
                    const p =
                        await this.personCoreDataService.getPersonByEmailOrDiscordId(
                            discordIdOrEmail
                        );
                    return NmPersonDataService.createPersonWithQueryId(
                        discordIdOrEmail,
                        p || {}
                    );
                })
        );
    }
}
