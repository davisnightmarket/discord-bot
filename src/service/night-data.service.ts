import { type NmNightRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES } from '../const';
import { GetDebug, GetChannelDayToday } from '../utility';
import {
    type PersonSheetModel,
    type SpreadsheetDataModel,
    type PersonWithIdModel,
    GoogleSheetService,
    PersonSheetService,
    ParseContentService
} from '.';

// we need a simple way to know what is the status of a night
// this is not stored in teh data, it's added to the night based on
// what's in teh data
// so that crabapple knows what to do
type NightStatusType = 'OK' | 'NEEDED_DISTRO' | 'NEEDED_CAP' | 'NEEDED_PICKUP';

export const NightOpPickupStatus: {
    [k in NightStatusType]: {
        id: k;
        // todo: flesh out these periodStatuses
        // name: string;
        // description: string;
    };
} = {
    OK: { id: 'OK' },
    NEEDED_DISTRO: { id: 'NEEDED_DISTRO' },
    NEEDED_CAP: { id: 'NEEDED_CAP' },
    NEEDED_PICKUP: { id: 'NEEDED_PICKUP' }
};

// shadow type may be redundant if we have a shadow roles
// maybe one or the other
export type PeriodStatusType = 'ALWAYS' | 'ONCE' | 'QUIT' | 'SHADOW';
export const NightOpPeriodStatus: {
    [k in PeriodStatusType]: {
        id: k;
        // todo: flesh out these periodStatuses
        // name: string;
        // description: string;
    };
} = {
    ALWAYS: { id: 'ALWAYS' },
    ONCE: { id: 'ONCE' },
    QUIT: { id: 'QUIT' },
    SHADOW: { id: 'SHADOW' }
};

// models what's in the "ops" sheet
export interface NightOpsDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
    orgPickup: string;
    orgMarket: string;
    discordIdOrEmail: string;
    periodStatus: PeriodStatusType;
    timeStart: string;
    timeEnd: string;
}

const dbg = GetDebug('NightDataService');

// models what's in the "ops-timeline" sheet
export interface NightOpsTimelineDataModel extends SpreadsheetDataModel {
    day: NmDayNameType;
    role: NmNightRoleType;
    orgPickup: string;
    orgMarket: string;
    discordIdOrEmail: string;
    periodStatus: string;
    timeStart: string;
    timeEnd: string;
    stamp: string;
}

// models what's in the "ops-pickup-notes" sheet
export interface NightOpsPickupNotesDataModel extends SpreadsheetDataModel {
    day: string;
    orgPickup: string;
    orgMarket: string;
    contact: string;
    timeStart: string;
    note: string;
}

// person plus ops data, for pickups and hosting
export type NightPersonModel = PersonSheetModel &
    Pick<NightOpsDataModel, 'role' | 'periodStatus' | 'discordIdOrEmail'>;

// isolates just those ops that are pickups, adds person list
export type NightPickupModel = Pick<
    NightOpsDataModel,
    | 'day'
    | 'role'
    | 'orgMarket'
    | 'orgPickup'
    | 'periodStatus'
    | 'discordIdOrEmail'
    | 'timeStart'
    | 'timeEnd'
> & {
    personList: NightPersonModel[];
    noteList: string[];
};

// the model for a single night
// includes day, time, location, list of hosts, list of pickups
export type NightMapModel = Pick<NightOpsDataModel, 'day'> & {
    // distro and captain
    marketList: NightMarketModel[];
};

export type NightMarketModel = Pick<
    NightOpsDataModel,
    'day' | 'orgPickup' | 'orgMarket' | 'timeStart' | 'timeEnd'
> & {
    statusList: NightStatusType[];
    // distro and captain
    hostList: NightPersonModel[];
    // the model for pickups
    pickupList: NightPickupModel[];
};

// we cache ops data so we don't touch the db too much
export type NightDataList = NightOpsDataModel[];

export class NightDataService {
    private readonly nightSheetService: GoogleSheetService<NightOpsDataModel>;
    private readonly opsTimelineSheetService: GoogleSheetService<NightOpsTimelineDataModel>;
    private readonly opsNotesSheetService: GoogleSheetService<NightOpsPickupNotesDataModel>;

    constructor(
        spreadsheetId: string,
        private readonly personSheetService: PersonSheetService
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

        this.getNightOps({ refreshCache: true });
    }

    waitingForNightData: Promise<NightDataList> = Promise.resolve([]);

    // because we might want to wait for the cache separately than actually calling to refresh it
    async getNightOps(
        { refreshCache = false }: { refreshCache?: boolean } = {
            refreshCache: false
        }
    ) {
        const nightData = await this.waitingForNightData;
        if (nightData.length === 0 || refreshCache) {
            const rows = await (this.waitingForNightData =
                this.nightSheetService.getAllRowsAsMaps());
            return await (this.waitingForNightData =
                this.getNightOpListWithDiscordIdIfPossible(
                    rows
                        .filter((a) => a.day?.trim())
                        .map(this.createNightOpsData)
                ));
        }
        return await this.waitingForNightData;
    }

    createNightOpsData({
        day = 'monday',
        role = 'night-captain',
        orgPickup = '',
        orgMarket = '',
        discordIdOrEmail = '',
        periodStatus = 'ALWAYS',
        timeStart = '',
        timeEnd = ''
    }: Partial<NightOpsDataModel>): NightOpsDataModel {
        return {
            day,
            role,
            orgPickup,
            orgMarket,
            discordIdOrEmail,
            periodStatus,
            timeStart,
            timeEnd
        };
    }

    // used to make sure our night object is populated
    // todo: log errors if stuff is missing?
    createNightMap({
        // defaults to blank, because we should always get a day
        day = '' as unknown as NmDayNameType,
        marketList = []
    }: Partial<NightMapModel>): NightMapModel {
        if (!day) {
            dbg(`createNight  missing day`);
        }

        marketList = marketList.map(
            ({
                orgPickup = '',
                orgMarket = '',
                timeStart = '',
                timeEnd = '',
                hostList = [],
                pickupList = []
            }) => {
                // if no org, grab it from the night cap

                if (!orgMarket) {
                    const nightCap = hostList.filter(
                        (a) => a.role === 'night-captain'
                    )[0];
                    if (nightCap) {
                        orgMarket = nightCap.orgMarket as string;
                        orgPickup = nightCap.orgPickup as string;
                        timeStart = nightCap.timeStart as string;
                        timeEnd = nightCap.timeEnd as string;
                    }
                }

                // orgPickup = '',
                // orgMarket = '',
                // timeStart = '',
                // timeEnd = '',
                // hostList = [],
                // pickupList = []
                const statusList: NightStatusType[] = [];
                // if there are no distro folks
                if (
                    this.getHostPersonLength(
                        hostList,
                        ['night-distro'],
                        ['QUIT', 'SHADOW']
                    ) === 0
                ) {
                    statusList.push('NEEDED_DISTRO');
                }
                // if there are no night caps
                if (
                    this.getHostPersonLength(
                        hostList,
                        ['night-captain'],
                        ['QUIT', 'SHADOW']
                    ) === 0
                ) {
                    statusList.push('NEEDED_CAP');
                }
                // if there are pickups with no folks
                if (
                    this.getPickupPersonStatusLength(pickupList, [
                        'QUIT',
                        'SHADOW'
                    ]) === 0
                ) {
                    statusList.push('NEEDED_PICKUP');
                }

                return {
                    day,
                    statusList,
                    orgPickup,
                    orgMarket,
                    timeStart,
                    timeEnd,
                    hostList,
                    pickupList
                };
            }
        );

        return {
            day,
            marketList
        };
    }

    // does a night have any pickup need?

    getPickupPersonStatusLength(
        pickupList: NightPickupModel[],
        excludePeriodStatusList: PeriodStatusType[] = []
    ): number {
        // if any of the pickups have need, we return true
        return pickupList.filter((pickup) => {
            // does this pickup have need?
            // true if it's person list length is zero
            // filtering out records that have no person or the person is quitting
            return (
                pickup.personList.filter(
                    // we get the person if they have an identifier and they are not in the exclude status list
                    (a) =>
                        a.discordIdOrEmail &&
                        !excludePeriodStatusList.includes(a.periodStatus)
                ).length === 0
            );
        }).length;
    }

    // does a night have host needs?
    getHostPersonLength(
        hostList: NightPersonModel[],
        includeRoleList: NmNightRoleType[],
        excludePeriodStatusList: PeriodStatusType[] = []
    ): number {
        const list = hostList.filter((a) => includeRoleList.includes(a.role));
        // we get the person if they have an identifier and they are not in the exclude status list
        return list.filter(
            (a) =>
                a.discordIdOrEmail &&
                !excludePeriodStatusList.includes(a.periodStatus)
        ).length;
    }

    createNightPerson(
        nightPerson: Partial<NightPersonModel>
    ): NightPersonModel {
        // todo: set status?
        let { periodStatus } = nightPerson;
        // if the night person record has no person, then we
        // assume that the role is a request to fill
        periodStatus = (
            nightPerson.discordIdOrEmail ? periodStatus : 'NEEDED'
        ) as PeriodStatusType;
        return {
            ...(nightPerson as NightPersonModel),
            periodStatus
        };
    }

    // this gets timeline data, limited to the last 1000 rows
    async getNightTimelineList(
        // we probably don't need more than 1000 records by default
        limitRows = 1000
    ) {
        return await this.opsTimelineSheetService.getAllRowsAsMaps({
            limitRows
        });
    }

    // this gets timeline sheet data, filtered by date
    async getNightTimelineListByDate(date: Date) {
        return (await this.getNightTimelineList()).filter(
            (a) => new Date(a.stamp) === date
        );
    }

    // this simply returns our cache but narrowed down by day
    async getNightOpsByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<NightOpsDataModel[]> {
        const a = await this.getNightOps();
        return a.filter((a) => a.day === day);
    }

    // this is because we need to get teh day/time as a unique identifier
    // and as a human readable string
    async getDayTimeIdAndReadableByDayAsTupleList({
        includeRoleList
    }: {
        includeRoleList: NmNightRoleType[];
    }): Promise<Array<[string, string]>> {
        const nightOps = await this.getNightOps({ refreshCache: true });
        return (
            nightOps
                .filter((a) => includeRoleList.includes(a.role))
                .map((a) => {
                    return `${a.day}|||${a.timeStart}`;
                })
                // make them unique
                .reduce<string[]>((a, b, i) => {
                    if (!a.includes(b)) {
                        a.push(b);
                    }
                    return a;
                }, [])
                // add the pretty name
                .map((a) => {
                    const [day, timeStart] = a.split('|||');
                    return [
                        a,
                        `${
                            DAYS_OF_WEEK[day as NmDayNameType].name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(
                            timeStart
                        )}`
                    ];
                })
        );
    }

    // this pulls notes per day
    // notes can have org and timeStart, to further refine their attachement
    // todo: implement this
    async getOpsNotesByDay(
        day: NmDayNameType
    ): Promise<NightOpsPickupNotesDataModel[]> {
        return (await this.opsNotesSheetService.getAllRowsAsMaps()).filter(
            (a) => a.day === day
        );
    }

    // this is the main hook that turns data into market model
    async getMarketListByDay(day: NmDayNameType): Promise<NightMarketModel[]> {
        // assemble all our resources including ops ...
        const opsList = await this.getNightOpsByDay(day);
        // people ...
        const personList = await this.getNightPersonList(opsList);
        /// and notes
        const noteList = await this.getOpsNotesByDay(day);

        const orgMarketDefault =
            opsList.find((a) => a.orgMarket)?.orgMarket ?? '';
        if (!orgMarketDefault) {
            console.error(`No Market found for this ${day}!`);
            return [];
        }

        // turn the records into map of unique array per market
        const getMarketDataList = opsList.reduce<
            Record<string, NightOpsDataModel[]>
        >(
            (all, record) => {
                if (record.orgMarket.trim() && !all[record.orgMarket]) {
                    all[record.orgMarket] = [];
                }
                if (record.orgMarket) {
                    all[record.orgMarket].push(record);
                } else {
                    all[orgMarketDefault].push(record);
                }

                return all;
            },
            { [orgMarketDefault]: [] }
        );
        const marketList: NightMarketModel[] = Object.keys(
            getMarketDataList
        ).map((orgMarket) => {
            // here we assume that orgPickup,timeStart,timeEnd are unique per market
            // and only exist on night-cap records
            const nightCapOps = getMarketDataList[orgMarket].filter(
                (a) => a.role === 'night-captain' && a.orgMarket === orgMarket
            );
            const orgPickup =
                nightCapOps.find((a) => a.orgPickup)?.orgPickup ?? '';
            const timeStart =
                nightCapOps.find((a) => a.timeStart)?.timeStart ?? '';
            const timeEnd = nightCapOps.find((a) => a.timeEnd)?.timeEnd ?? '';

            const hostList = this.getHostListFromData(
                getMarketDataList[orgMarket],
                personList,
                noteList
            );
            const pickupList = this.getPickupListFromData(
                getMarketDataList[orgMarket],
                personList,
                noteList,
                timeStart
            );

            const statusList: NightStatusType[] = [];

            return {
                day,
                orgMarket,
                orgPickup,
                timeStart,
                timeEnd,
                statusList,
                hostList,
                pickupList
            };
        });

        return marketList;
    }

    // this is so complicated because we are reducing a list of flat data
    // into a per day list of pickups and hosts and etc
    getPickupListFromData(
        opList: NightOpsDataModel[],
        personList: PersonWithIdModel[],
        noteList: NightOpsPickupNotesDataModel[],
        timeStartDefault: string
    ): NightPickupModel[] {
        // return a complete set of pickups, with personList and noteList
        const pickupList = Object.values(
            opList
                .filter((a) => (a.role = 'night-pickup'))
                // todo: simplify
                .reduce<{ [k in string]: NightPickupModel }>((a, op) => {
                    const { day, orgPickup, discordIdOrEmail } = op;
                    let { timeStart } = op;
                    timeStart = timeStart || timeStartDefault;

                    if (!orgPickup) {
                        return a;
                    }

                    if (!a[day + orgPickup + timeStart]) {
                        a[day + orgPickup + timeStart] = {
                            ...op,
                            timeStart,
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
                    }
                    // get the single person in this op record
                    const person = personList.find(
                        (a) =>
                            a.discordId === discordIdOrEmail ||
                            a.email === discordIdOrEmail
                    ) as PersonWithIdModel;
                    if (person) {
                        a[day + orgPickup + timeStart].personList.push(
                            this.createNightPerson({
                                ...op,
                                timeStart,
                                ...person
                            })
                        );
                    }
                    return a;
                }, {})
        );

        return pickupList;
    }

    getHostListFromData(
        opList: NightOpsDataModel[],
        personList: PersonWithIdModel[],
        noteList: NightOpsPickupNotesDataModel[]
    ): NightPersonModel[] {
        // return a complete set of pickups, with personList
        const hostList = opList
            .filter(
                (a) => a.role === 'night-distro' || a.role === 'night-captain'
            )
            .map((a) => {
                const person = personList.find(
                    (p) =>
                        a.discordIdOrEmail === p.discordId ||
                        a.discordIdOrEmail === p.email
                ) as PersonWithIdModel;

                return this.createNightPerson({
                    ...a,
                    ...person
                });
            });

        return hostList;
    }

    async getNightMapByDay(
        day: NmDayNameType,
        { refreshCache }: { refreshCache?: boolean } = {}
    ): Promise<NightMapModel> {
        await this.getNightOps({ refreshCache });
        const marketList = await this.getMarketListByDay(day);

        return this.createNightMap({
            day,
            marketList
        });
    }

    // add a record to the top of the sheet

    async addNightTimelineRecordList(
        nightTimeline: NightOpsTimelineDataModel[]
    ) {
        const headerList = await this.opsTimelineSheetService
            .waitingForHeaderList;
        for (const n of nightTimeline) {
            await this.opsTimelineSheetService.prependOneRowAfterHeader(
                headerList.map((header) => n[header as string])
            );
        }
        // todo: move the mapping of object to headers to sheetService
    }

    // this returns a set of strings that are unique per day, org, role, timeStart, and the id of the
    // person
    getUniqueNightOpIdentifier({
        day,
        orgPickup,
        role,
        timeStart,
        discordIdOrEmail
    }: NightOpsDataModel): string {
        return `${day}--${orgPickup}--${role}--${'' + timeStart}--${
            '' + discordIdOrEmail
        }`;
    }

    // this really attempts to turn person identifiers into discord ids
    async getNightOpListWithDiscordIdIfPossible(
        nightOps: NightOpsDataModel[]
    ): Promise<NightOpsDataModel[]> {
        return await Promise.all(
            nightOps.map(async (op) => {
                const person =
                    await this.personSheetService.getPersonByEmailOrDiscordId(
                        op.discordIdOrEmail
                    );

                return {
                    ...op,
                    discordIdOrEmail:
                        // nullish won't work on empty strings
                        person?.discordId ??
                        person?.email ??
                        op.discordIdOrEmail
                };
            })
        );
    }

    // // gets a night data list adding unique records
    async getNightOpsAdding(
        nightList: NightOpsDataModel[],
        addList: NightOpsDataModel[]
    ) {
        const idNightList = nightList.map(this.getUniqueNightOpIdentifier);

        const idAddList = addList.map(this.getUniqueNightOpIdentifier);

        return nightList.concat(
            ...addList.filter((a, i) => {
                return !idNightList.includes(idAddList[i]);
            })
        );
    }

    // // gets a night data list removing unique records

    async getNightOpsRemoving(
        nightList: NightOpsDataModel[],
        removeList: NightOpsDataModel[]
    ) {
        const idNightList = nightList.map(this.getUniqueNightOpIdentifier);

        const idRemoveList = removeList.map(this.getUniqueNightOpIdentifier);
        // if it is to be removed, filter it off
        return nightList.filter((_, i) => {
            return !idRemoveList.includes(idNightList[i]);
        });
    }

    // to prevent overwriting each others data
    // this won't work if we have multiple instances
    waitingForOp: Promise<any> = Promise.resolve();

    // update pickup ops sheet for one day for one person
    // note: this is a repace op: we delete and replace
    // all pickups for that day and person and replace them

    async replacePickupsForOnePersonAndDay(
        day: NmDayNameType,
        discordId: string,
        addList: NightOpsDataModel[]
    ) {
        await this.waitingForOp;

        // get a fresh night list
        let nightOps = await this.getNightOps({ refreshCache: true });
        // get the night ops in a list with discordId if there is one

        // figure out what needs removing. To do this, we ...

        // filter remove all pickup role for this day and person
        nightOps = nightOps.filter(
            (a) =>
                !(
                    a.discordIdOrEmail === discordId &&
                    a.day === day &&
                    a.role === 'night-pickup'
                )
        );

        // here are the unique identifiers so we can remove them from the set of data to be removed
        nightOps.push(...addList);

        // nightList = personDayNightList.filter(
        //     // the person day record is NOT in the list we are adding
        //     (a) => !removeIdList.includes(this.getUniqueNightOpIdentifier(a))
        // );

        // dbg(`Starting ${nightList.length}`);
        // dbg(`Adding ${addList.length}`);

        // dbg(addList);

        // nightList = await this.getNightOpsAdding(nightList, addList);

        // dbg(`Added ${nightList.length}`);
        // dbg(`Removing ${removeList.length}`);

        // dbg(removeList);

        // nightList = await this.getNightOpsRemoving(nightList, removeList);
        // dbg(`Removed ${nightList.length}`);

        await (this.waitingForOp = this.updateNightData(nightOps));
    }

    async addHostForOnePersonAndDay(
        day: NmDayNameType,
        discordId: string,
        addList: NightOpsDataModel[]
    ) {
        // get the night ops in a list with discordId if there is one
        let nightOps = await this.getNightOps({ refreshCache: true });
        // figure out what needs removing. To do this, we ...

        // filter our night ops so we have the unique set for person and day
        const personDayNightList = nightOps.filter(
            (a) => a.discordIdOrEmail === discordId && a.day === day
        );

        dbg(`Starting ${nightOps.length}`);
        dbg(`Adding ${addList.length}`);

        dbg(addList);

        nightOps = await this.getNightOpsAdding(nightOps, addList);

        dbg(`Added ${nightOps.length}`);

        await this.updateNightData(nightOps);
    }

    async removeNightData(removeList: NightOpsDataModel[]) {
        let nightOps = await this.getNightOps({ refreshCache: true });
        nightOps = await this.getNightOpsRemoving(nightOps, removeList);
        await this.updateNightData(nightOps);
    }

    // this function replaces the entire night ops data sheet with a new one
    // used for both add and remove records

    async updateNightData(nightData: NightOpsDataModel[]) {
        const headerList = await this.nightSheetService.waitingForHeaderList;

        // attempt to save emails instead of discordIds
        nightData = await Promise.all(
            nightData.map(async (a) => {
                const person =
                    await this.personSheetService.getPersonByEmailOrDiscordId(
                        a.discordIdOrEmail
                    );
                return {
                    ...a,
                    discordIdOrEmail: person?.email ?? a.discordIdOrEmail
                };
            })
        );
        const nightRows = nightData
            // sort by role
            .sort((a, b) => {
                return a.role < b.role ? -1 : a.role > b.role ? 1 : 0;
            })
            // sort by day
            .sort(
                (a, b) =>
                    DAYS_OF_WEEK_CODES.indexOf(a.day) -
                    DAYS_OF_WEEK_CODES.indexOf(b.day)
            )

            .map((op) => {
                return headerList.map((header) => op[header]);
            });

        await this.nightSheetService.replaceAllRowsIncludingHeader(
            nightRows as string[][]
        );
        await this.getNightOps({ refreshCache: true });
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
                        await this.personSheetService.getPersonByEmailOrDiscordId(
                            discordIdOrEmail
                        );
                    return PersonSheetService.createPersonWithQueryId(
                        discordIdOrEmail,
                        p ?? {}
                    );
                })
        );
    }

    // todo: move to markdown service
    getPickupListMd(pickupList: NightPickupModel[]) {
        return pickupList.length
            ? pickupList.reduce((a, { orgPickup, timeStart, personList }) => {
                  return (a += `- ${orgPickup} at ${ParseContentService.getAmPmTimeFrom24Hour(
                      timeStart
                  )} ${
                      personList.length
                          ? ' with ' + personList.map((b) => b.name).join(', ')
                          : ''
                  }\n`);
              }, '')
            : 'No Pick-ups';
    }

    // getNightMarketMd({ day, orgPickup, timeStart }: NightMarketModel) {
    //     return `${day} ${orgPickup} ${timeStart}`;
    // }
    // getHostListMd(hostList: NightPersonModel[], discordId: string) {
    //     hostList = hostList.filter(
    //         (a) => a.role === 'night-distro' || a.role === 'night-distro-shadow'
    //     );

    //     return `Host${hostList.length ? 's' : ''}: ${hostList
    //         .map((b) =>
    //             b.discordId !== discordId ? b.name : `${b.name} (YOU!)`
    //         )
    //         .join(', ')}`;
    // }

    // getNightCapListMd(hostList: NightPersonModel[], discordId: string) {
    //     hostList = hostList.filter((a) => a.role === 'night-captain');

    //     return `Night Captain${hostList.length ? 's' : ''}: ${hostList
    //         .map((b) =>
    //             b.discordId !== discordId ? b.name : `${b.name} (YOU!)`
    //         )
    //         .join(', ')}`;
    // }

    // handle discord data from select interaction
    getNightOpsDiscordSelectValues(
        values: string[],
        {
            day,
            role,
            discordIdOrEmail,
            periodStatus
        }: Pick<
            NightOpsDataModel,
            'day' | 'role' | 'discordIdOrEmail' | 'periodStatus'
        >
    ): NightOpsDataModel[] {
        return values
            .map((a) => a.split('---'))
            .map((a) => ({
                orgPickup: a[0],
                orgMarket: a[3] || '',
                timeStart: a[1],
                timeEnd: a[2],
                day,
                role,
                discordIdOrEmail,
                periodStatus
            }));
    }
}
