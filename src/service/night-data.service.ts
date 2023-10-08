import { type NmNightRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK } from '../const';
import { GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    type SpreadsheetDataModel,
    PersonDataService,
    type PersonModel,
    PersonWithIdModel
} from '.';

// models what's in the "ops" sheet
export interface NightOpsDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
}

// models what's in the "ops-timeline" sheet
export interface NightOpsTimelineDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
    org: string;
    discordIdOrEmail: string;
    period: string;
    timeStart: string;
    timeEnd: string;
    stamp: string;
}

// models what's in the "ops-pickup-notes" sheet
export interface NightOpsPickupNotesDataModel extends SpreadsheetDataModel {
    day: string;
    org: string;
    contact: string;
    timeStart: string;
    note: string;
}

export type NightPersonModel = PersonModel &
    Pick<NightOpsDataModel, 'role' | 'period' | 'discordIdOrEmail'>;

export type NightPickupModel = Pick<
    NightOpsDataModel,
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
export type NightModel = Pick<
    NightOpsDataModel,
    'day' | 'org' | 'timeStart' | 'timeEnd'
> & {
    // distro and captain
    hostList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];
};

export type NightDataCache = NightOpsDataModel[];

export class NightDataService {
    private readonly nightSheetService: GoogleSheetService<NightOpsDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<NightOpsTimelineDataModel>;
    private readonly opsNotesSheetService: GoogleSheetService<NightOpsPickupNotesDataModel>;
    private readonly personCoreDataService: PersonDataService;

    waitingForNightCache: Promise<NightDataCache> = Promise.resolve([]);

    constructor(
        spreadsheetId: string,
        personCoreDataService: PersonDataService
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

    createNight({
        // defaults to blank, because we should always get a day
        day = '' as unknown as NmDayNameType,
        org = '',
        timeStart = '',
        timeEnd = '',
        hostList = [],
        pickupList = []
    }: Partial<NightModel>): NightModel {
        if (!DAYS_OF_WEEK.includes(day)) {
            throw new Error('Night must have a day!');
        }
        return {
            day,
            org,
            timeStart,
            timeEnd,
            hostList,
            pickupList
        };
    }
    async getNightTimelineList(
        // we probably don't need more than 1000 records by default
        limitRows = 1000
    ) {
        return await this.opsTimelineSheetService.getAllRowsAsMaps({
            limitRows
        });
    }

    async getNightDataByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<NightOpsDataModel[]> {
        return (await this.waitingForNightCache).filter((a) => a.day === day);
    }

    async getOpsNotesByDay(
        day: NmDayNameType
    ): Promise<NightOpsPickupNotesDataModel[]> {
        return (await this.opsNotesSheetService.getAllRowsAsMaps()).filter(
            (a) => a.day === day
        );
    }

    async getPickupListByDay(day: NmDayNameType): Promise<NightPickupModel[]> {
        const nightList = await this.getNightDataByDay(day);
        const personList = await this.getNightPersonList(nightList);
        const noteList = await this.getOpsNotesByDay(day);
        // return a complete set of pickups, with personList and noteList
        const pickupList = Object.values(
            nightList
                .filter((a) => (a.role = 'night-pickup'))
                .reduce<{ [k in string]: NightPickupModel }>((a, op) => {
                    const { day, org, timeStart } = op;
                    if (day && org && timeStart && !a[day + org + timeStart]) {
                        a[day + org + timeStart] = {
                            ...op,
                            // this needs to happen for each op since that's where the discordIdOrEmail is
                            personList: [],
                            // this can happen once
                            noteList: noteList
                                .filter(
                                    ({ org, timeStart }) =>
                                        org === op.org &&
                                        (!timeStart ||
                                            timeStart === op.timeStart)
                                )
                                .map((a) => a.note)
                        };
                        // get the single person in this op record
                        const person = personList.find(
                            (a) => a.discordIdOrEmail === op.discordIdOrEmail
                        ) as PersonWithIdModel;
                        if (person) {
                            a[day + org + timeStart].personList.push({
                                ...op,
                                ...person
                            });
                        }
                    }
                    return a;
                }, {})
        );

        return pickupList;
    }

    // nightcap and host
    async getHostListByDay(day: NmDayNameType): Promise<NightPersonModel[]> {
        const opList = await this.getNightDataByDay(day);
        const personList = await this.personCoreDataService.getPersonList();
        // return a complete set of pickups, with personList
        const pickupList = opList
            .filter((a) => (a.role = 'night-pickup'))
            .map((a) => {
                const person = personList.find(
                    (p) => p.discordIdOrEmail === a.discordIdOrEmail
                ) as PersonWithIdModel;

                return {
                    ...a,
                    ...person
                };
            });

        return pickupList;
    }

    async getNightByDay(day: NmDayNameType): Promise<NightModel> {
        const night = (await this.getNightDataByDay(day)).reduce<NightModel>(
            (a, b) => {
                b.day = day;
                // basically we want all the values with an actual value

                if (b.org) {
                    a.org = b.org;
                }
                if (b.timeStart) {
                    a.timeStart = b.timeStart;
                }
                if (b.timeEnd) {
                    a.timeEnd = b.timeEnd;
                }

                return a;
            },
            this.createNight({})
        ) as NightModel;

        const hostList = await this.getHostListByDay(day);
        const pickupList = await this.getPickupListByDay(day);

        return {
            ...night,
            hostList,
            pickupList
        };
    }

    // add a record to the top of the sheet

    async addNightTimelineRecord(nightTimeline: NightOpsTimelineDataModel) {
        const headerList = await this.opsTimelineSheetService
            .waitingForHeaderList;
        // todo: move the mapping of object to headers to sheetService
        this.opsTimelineSheetService.prependOneRowAfterHeader(
            headerList.map((header) => nightTimeline[header as string])
        );
    }
    // send a new ops record to the sheet
    // TODO: so, folks can update the sheet at the same time which will cause a mess
    // we need to queue updates
    updateNightDataQueue: Promise<void>[] = [];
    async updateNightData(nightToUpdate: NightOpsDataModel) {
        for (const p of this.updateNightDataQueue) {
            await p;
            this.updateNightDataQueue.splice(
                this.updateNightDataQueue.indexOf(p),
                1
            );
        }
        this.updateNightDataQueue.push(this.pushNightData(nightToUpdate));
    }

    async pushNightData(nightToUpdate: NightOpsDataModel) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const nightData = await this.waitingForNightCache;
        const headerList = await this.nightSheetService.waitingForHeaderList;

        // add the new data
        nightData.push(nightToUpdate);

        // in here we sort by day
        const nightRows = nightData
            .sort((a, b) => {
                return a.role < b.role ? -1 : a.role > b.role ? 1 : 0;
            })
            .sort(
                (a, b) =>
                    DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
            )

            // in here we add blank lines
            .reduce<Array<NightOpsDataModel | null>>(
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
                    : headerList.map(() => ' ');
            });

        await this.nightSheetService.replaceAllRowsIncludingHeader(
            nightRows as string[][]
        );
        await this.refreshCache();
    }
    async refreshCache() {
        this.waitingForNightCache = this.nightSheetService.getAllRowsAsMaps();
    }

    async getNightPersonList(
        nightList: NightOpsDataModel[]
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
                    return PersonDataService.createPersonWithQueryId(
                        discordIdOrEmail,
                        p || {}
                    );
                })
        );
    }
}
