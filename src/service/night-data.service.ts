import { type NmNightRoleType, type NmDayNameType } from '../model';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_CODES } from '../const';
import { DebugUtility, GetChannelDayToday } from '../utility';
import {
    GoogleSheetService,
    type SpreadsheetDataModel,
    PersonDataService,
    type PersonModel,
    PersonWithIdModel,
    ParseContentService
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

const dbg = DebugUtility('NightDataService');

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

    // used to make sure our night object is populated
    // todo: log errors if stuff is missing?
    createNight({
        // defaults to blank, because we should always get a day
        day = '' as unknown as NmDayNameType,
        org = '',
        timeStart = '',
        timeEnd = '',
        hostList = [],
        pickupList = []
    }: Partial<NightModel>): NightModel {
        if (!day) {
            dbg(`createNight  missing day ${day}`);
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
    async getNightDataByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<NightOpsDataModel[]> {
        return (await this.waitingForNightCache).filter((a) => a.day === day);
    }

    // this is because we need to get teh day/time as a unique identifier
    // and as a human readable string
    async getDayTimeIdAndReadableByDayAsTupleList(): Promise<
        [string, string][]
    > {
        return this.waitingForNightCache.then((nightOps) => {
            const dayTimesMap = nightOps.reduce<{
                [k in string]: [string, string];
            }>((a, b) => {
                if (b.day && b.timeStart && !a[b.day + b.timeStart]) {
                    a[b.day + b.timeStart] = [
                        `${b.day}|||${b.timeStart}`,
                        `${
                            DAYS_OF_WEEK[b.day].name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(
                            b.timeStart
                        )}`
                    ];
                }
                return a;
            }, {});
            return Object.values(dayTimesMap);
        });
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

    // this is so complicated because we are reducing a list of flat data
    // into a per day list of pickups and hosts and etc
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
                            (a) =>
                                a.discordId === op.discordIdOrEmail ||
                                a.email === op.discordIdOrEmail
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
    async getHostListByDay(day: NmDayNameType): Promise<NightPersonModel[]> {
        const opList = await this.getNightDataByDay(day);
        const personList = await this.personCoreDataService.getPersonList();
        // return a complete set of pickups, with personList
        const hostList = opList
            .filter(
                (a) => a.role === 'night-host' || a.role === 'night-captain'
            )
            .map((a) => {
                const person = personList.find(
                    (p) =>
                        a.discordIdOrEmail === p.discordId ||
                        a.discordIdOrEmail === p.email
                ) as PersonWithIdModel;

                return {
                    ...a,
                    ...person
                };
            });

        return hostList;
    }
    // // nightcap and host
    // async getHostListByDay(day: NmDayNameType): Promise<NightHostModel[]> {
    //     const opList = await this.getNightDataByDay(day);
    //     const personList = await this.personCoreDataService.getPersonList();
    //     // return a complete set of pickups, with personList
    //     const hostMap = opList
    //         .filter((a) => (a.role === 'night-host'||a.role==='night-captain'))
    //         .reduce<
    //             Partial<{
    //                 [k in NmDayNameType]: NightHostModel;
    //             }>
    //         >(
    //             (
    //                 a,
    //                 {
    //                     day,
    //                     org,
    //                     timeStart,
    //                     timeEnd,
    //                     discordIdOrEmail,
    //                     period,
    //                     role
    //                 }
    //             ) => {
    //                 if (!a[day]) {
    //                     a[day] = {
    //                         day,
    //                         org,
    //                         timeStart,
    //                         timeEnd,
    //                         personList: [],
    //                         noteList: []
    //                     };
    //                 }

    //                 (a[day] as NightHostModel).personList = personList
    //                     .filter((p) => p.discordIdOrEmail === discordIdOrEmail)
    //                     .map((a) => ({
    //                         day,
    //                         org,
    //                         timeStart,
    //                         timeEnd,
    //                         period,
    //                         role,
    //                         discordIdOrEmail,
    //                         ...a
    //                     }));

    //                 return a;
    //             },
    //             {}
    //         ) as {
    //         [k in NmDayNameType]: NightHostModel;
    //     };

    //     return Object.values(hostMap);
    // }

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
        org,
        role,
        timeStart,
        discordIdOrEmail
    }: NightOpsDataModel): string {
        return `${day}--${org}--${role}--${timeStart}--${discordIdOrEmail}`;
    }

    // this really attempts to turn person identifiers into discord ids
    async getNightOpListWithDiscordIdIfPossible(
        nightOps: NightOpsDataModel[]
    ): Promise<NightOpsDataModel[]> {
        return await Promise.all(
            nightOps.map(async (op) => {
                const person =
                    await this.personCoreDataService.getPersonByEmailOrDiscordId(
                        op.discordIdOrEmail
                    );

                return {
                    ...op,
                    discordIdOrEmail:
                        person?.discordId ||
                        person?.email ||
                        op.discordIdOrEmail
                };
            })
        );
    }

    // gets a night data list adding unique records
    async getNightDataAdding(
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

    // gets a night data list removing unique records

    async getNightDataRemoving(
        nightList: NightOpsDataModel[],
        removeList: NightOpsDataModel[]
    ) {
        const idNightList = nightList.map(this.getUniqueNightOpIdentifier);

        const idRemoveList = await removeList.map(
            this.getUniqueNightOpIdentifier
        );
        // if it is to be removed, filter it off
        return nightList.filter((_, i) => {
            return !idRemoveList.includes(idNightList[i]);
        });
    }
    // to prevent overwriting each others data
    updateQueue: Promise<any>[] = [];
    async setUpdateQueue(a: Promise<any>) {
        this.updateQueue.push(
            a.then(() => {
                this.updateQueue.splice(
                    this.updateQueue.findIndex((b) => b === a),
                    1
                );
            })
        );
        await a;
    }
    async updateNightOpsForPersonAndDayAndSave(
        day: NmDayNameType,
        discordId: string,
        addList: NightOpsDataModel[]
    ) {
        await Promise.all(this.updateQueue);
        await this.setUpdateQueue(
            this.updateNightOpsForPersonAndDayAndSaveQueue(
                day,
                discordId,
                addList
            )
        );
    }

    async updateNightOpsForPersonAndDayAndSaveQueue(
        day: NmDayNameType,
        discordId: string,
        addList: NightOpsDataModel[]
    ) {
        // get a fresh night list
        await this.refreshCache();
        // get the night ops in a list with discordId if there is one
        let nightList = await this.waitingForNightCache;
        // figure out what needs removing. To do this, we ...

        // filter our night ops so we have the unique set for person and day
        const personDayNightList = nightList.filter(
            (a) => a.discordIdOrEmail === discordId && a.day === day
        );

        // here are the unique identifiers so we can remove them from the set of data to be removed
        const addIdList = addList.map(this.getUniqueNightOpIdentifier);

        const removeList = personDayNightList.filter(
            // the person day record is NOT in the list we are adding
            (a) => !addIdList.includes(this.getUniqueNightOpIdentifier(a))
        );

        dbg(`Starting ${nightList.length}`);
        dbg(`Adding ${addList.length}`);

        nightList = await this.getNightDataAdding(nightList, addList);

        dbg(`Added ${nightList.length}`);
        dbg(`Removing ${removeList.length}`);

        nightList = await this.getNightDataRemoving(nightList, removeList);
        dbg(`Removed ${nightList.length}`);

        await this.updateNightData(nightList);
    }
    // async addNightData(addList: NightOpsDataModel[]) {
    //     await this.refreshCache();
    //     let nightList = await this.waitingForNightCache;
    //     nightList = await this.getNightDataAdding(nightList, addList);
    //     await this.updateNightData(nightList);
    // }

    async removeNightData(removeList: NightOpsDataModel[]) {
        await Promise.all(this.updateQueue);
        await this.setUpdateQueue(this.removeNightDataQueue(removeList));
    }

    async removeNightDataQueue(removeList: NightOpsDataModel[]) {
        await this.refreshCache();
        let nightList = await this.waitingForNightCache;
        nightList = await this.getNightDataRemoving(nightList, removeList);
        await this.updateNightData(nightList);
    }

    // this function replaces the entire night ops data sheet with a new one
    // used for both add and remove records

    async updateNightData(nightData: NightOpsDataModel[]) {
        const headerList = await this.nightSheetService.waitingForHeaderList;

        // attempt to save emails instead of discordIds
        nightData = await Promise.all(
            nightData.map(async (a) => {
                const person =
                    await this.personCoreDataService.getPersonByEmailOrDiscordId(
                        a.discordIdOrEmail
                    );
                return {
                    ...a,
                    discordIdOrEmail: person?.email || a.discordIdOrEmail
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
        await this.refreshCache();
    }

    async refreshCache() {
        this.waitingForNightCache = this.nightSheetService
            .getAllRowsAsMaps()
            .then((a) =>
                // every record must have a day
                a.filter((b) => b.day?.trim())
            )
            // make that we have a discordId on the discordIdOrEmail prop if possible
            .then((a) => this.getNightOpListWithDiscordIdIfPossible(a));
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
    getPickupListMd(pickupList: NightPickupModel[]) {
        return pickupList.length
            ? pickupList.reduce((a, { org, timeStart, personList }) => {
                  return (a += `- ${org} at ${ParseContentService.getAmPmTimeFrom24Hour(
                      timeStart
                  )} ${
                      personList.length
                          ? ' with ' + personList.map((b) => b.name).join(', ')
                          : ''
                  }\n`);
              }, '')
            : 'No Pick-ups';
    }

    getNightMd({ day, org, timeStart }: NightModel) {
        return `${day} ${org} ${timeStart}`;
    }
    getHostListMd(hostList: NightPersonModel[], discordId: string) {
        hostList = hostList.filter(
            (a) => a.role === 'night-host' || a.role === 'night-host-shadow'
        );
        console.log(hostList, 'host');
        return `Host${hostList.length ? 's' : ''}: ${hostList
            .map((b) =>
                b.discordId !== discordId ? b.name : `${b.name} (YOU!)`
            )
            .join(', ')}`;
    }

    getNightCapListMd(hostList: NightPersonModel[], discordId: string) {
        hostList = hostList.filter((a) => a.role === 'night-captain');
        console.log(hostList, 'cap');
        return `Night Captain${hostList.length ? 's' : ''}: ${hostList
            .map((b) =>
                b.discordId !== discordId ? b.name : `${b.name} (YOU!)`
            )
            .join(', ')}`;
    }

    // handle discord data from interactions
    getNightDataDiscordSelectValues(
        values: string[],
        {
            day,
            role,
            discordIdOrEmail,
            period
        }: Pick<
            NightOpsDataModel,
            'day' | 'role' | 'discordIdOrEmail' | 'period'
        >
    ): NightOpsDataModel[] {
        return values
            .map((a) => a.split('---'))
            .map((a) => ({
                org: a[0],
                timeStart: a[1],
                timeEnd: a[2],
                day,
                role,
                discordIdOrEmail,
                period
            }));
    }
}
