"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightDataService = exports.NightOpPeriodStatus = exports.NightOpPickupStatus = void 0;
const const_1 = require("../const");
const utility_1 = require("../utility");
const _1 = require(".");
exports.NightOpPickupStatus = {
    OK: { id: 'OK' },
    NEEDED_DISTRO: { id: 'NEEDED_DISTRO' },
    NEEDED_CAP: { id: 'NEEDED_CAP' },
    NEEDED_PICKUP: { id: 'NEEDED_PICKUP' }
};
exports.NightOpPeriodStatus = {
    ALWAYS: { id: 'ALWAYS' },
    ONCE: { id: 'ONCE' },
    QUIT: { id: 'QUIT' },
    SHADOW: { id: 'SHADOW' }
};
const dbg = (0, utility_1.DebugUtility)('NightDataService');
class NightDataService {
    constructor(spreadsheetId, personDataService) {
        this.personDataService = personDataService;
        this.waitingForNightCache = Promise.resolve([]);
        // to prevent overwriting each others data
        // this won't work if we have multiple instances
        this.updateQueue = [];
        this.nightSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'ops'
        });
        this.opsTimelineSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'ops-timeline'
        });
        this.opsNotesSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: 'ops-pickup-notes'
        });
        this.refreshCache();
    }
    createNightOpsData({ day = 'monday', role = 'night-captain', org = '', discordIdOrEmail = '', periodStatus = 'ALWAYS', timeStart = '', timeEnd = '' }) {
        return {
            day,
            role,
            org,
            discordIdOrEmail,
            periodStatus,
            timeStart,
            timeEnd
        };
    }
    // used to make sure our night object is populated
    // todo: log errors if stuff is missing?
    createNight({ 
    // defaults to blank, because we should always get a day
    day = '', org = '', timeStart = '', timeEnd = '', hostList = [], pickupList = [] }) {
        if (!day) {
            dbg(`createNight  missing day`);
        }
        // if no org, grab it from the night cap
        if (!org) {
            const nightCap = hostList.filter((a) => a.role === 'night-captain')[0];
            if (nightCap) {
                org = nightCap.org;
            }
        }
        if (!org) {
            const nightCap = hostList.filter((a) => a.role === 'night-captain')[0];
            if (nightCap) {
                org = nightCap.org;
                timeStart = nightCap.timeStart;
                timeEnd = nightCap.timeEnd;
            }
        }
        const statusList = [];
        // if there are no distro folks
        if (this.getHostPersonLength(hostList, ['night-distro'], ['QUIT', 'SHADOW']) === 0) {
            statusList.push('NEEDED_DISTRO');
        }
        // if there are no night caps
        if (this.getHostPersonLength(hostList, ['night-captain'], ['QUIT', 'SHADOW']) === 0) {
            statusList.push('NEEDED_CAP');
        }
        // if there are pickups with no folks
        if (this.getPickupPersonStatusLength(pickupList, ['QUIT', 'SHADOW']) ===
            0) {
            statusList.push('NEEDED_PICKUP');
        }
        return {
            day,
            org,
            statusList,
            timeStart,
            timeEnd,
            hostList,
            pickupList
        };
    }
    // does a night have any pickup need?
    getPickupPersonStatusLength(pickupList, excludePeriodStatusList = []) {
        // if any of the pickups have need, we return true
        return pickupList.filter((pickup) => {
            // does this pickup have need?
            // true if it's person list length is zero
            // filtering out records that have no person or the person is quitting
            return (pickup.personList.filter(
            // we get the person if they have an identifier and they are not in the exclude status list
            (a) => a.discordIdOrEmail &&
                !excludePeriodStatusList.includes(a.periodStatus)).length === 0);
        }).length;
    }
    // does a night have host needs?
    getHostPersonLength(hostList, includeRoleList, excludePeriodStatusList = []) {
        const list = hostList.filter((a) => includeRoleList.includes(a.role));
        // we get the person if they have an identifier and they are not in the exclude status list
        return list.filter((a) => a.discordIdOrEmail &&
            !excludePeriodStatusList.includes(a.periodStatus)).length;
    }
    createNightPerson(nightPerson) {
        // todo: set status?
        let { periodStatus } = nightPerson;
        // if the night person record has no person, then we
        // assume that the role is a request to fill
        periodStatus = (nightPerson.discordIdOrEmail ? periodStatus : 'NEEDED');
        return {
            ...nightPerson,
            periodStatus
        };
    }
    // this gets timeline data, limited to the last 1000 rows
    async getNightTimelineList(
    // we probably don't need more than 1000 records by default
    limitRows = 1000) {
        return await this.opsTimelineSheetService.getAllRowsAsMaps({
            limitRows
        });
    }
    // this gets timeline sheet data, filtered by date
    async getNightTimelineListByDate(date) {
        return (await this.getNightTimelineList()).filter((a) => new Date(a.stamp) === date);
    }
    // this simply returns our cache but narrowed down by day
    async getNightDataByDay(
    // defaults to today
    day = (0, utility_1.GetChannelDayToday)()) {
        const a = await this.waitingForNightCache;
        if (!a.length) {
            await this.refreshCache();
        }
        return a.filter((a) => a.day === day);
    }
    // this is because we need to get teh day/time as a unique identifier
    // and as a human readable string
    async getDayTimeIdAndReadableByDayAsTupleList({ includeRoleList }) {
        await this.refreshCache();
        return await this.waitingForNightCache.then((nightOps) => {
            console.log(nightOps.filter((a) => includeRoleList.includes(a.role)));
            return (nightOps
                .filter((a) => includeRoleList.includes(a.role))
                .map((a) => {
                return `${a.day}|||${a.timeStart}`;
            })
                // make them unique
                .reduce((a, b, i) => {
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
                    `${const_1.DAYS_OF_WEEK[day].name} ${_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)}`
                ];
            }));
        });
    }
    // this pulls notes per day
    // notes can have org and timeStart, to further refine their attachement
    // todo: implement this
    async getOpsNotesByDay(day) {
        return (await this.opsNotesSheetService.getAllRowsAsMaps()).filter((a) => a.day === day);
    }
    // this is so complicated because we are reducing a list of flat data
    // into a per day list of pickups and hosts and etc
    async getPickupListByDay(day) {
        const nightList = await this.getNightDataByDay(day);
        const personList = await this.getNightPersonList(nightList);
        const noteList = await this.getOpsNotesByDay(day);
        // return a complete set of pickups, with personList and noteList
        const pickupList = Object.values(nightList
            .filter((a) => (a.role = 'night-pickup'))
            // todo: simplify
            .reduce((a, op) => {
            const { day, org, timeStart, discordIdOrEmail } = op;
            if (!timeStart || !org) {
                return a;
            }
            if (!a[day + org + timeStart]) {
                a[day + org + timeStart] = {
                    ...op,
                    // this needs to happen for each op since that's where the discordIdOrEmail is
                    personList: [],
                    // this can happen once
                    noteList: noteList
                        .filter(({ org, timeStart }) => org === op.org &&
                        (!timeStart ||
                            timeStart === op.timeStart))
                        .map((a) => a.note)
                };
            }
            // get the single person in this op record
            const person = personList.find((a) => a.discordId === discordIdOrEmail ||
                a.email === discordIdOrEmail);
            if (person) {
                a[day + org + timeStart].personList.push(this.createNightPerson({
                    ...op,
                    ...person
                }));
            }
            return a;
        }, {}));
        return pickupList;
    }
    async getHostListByDay(day) {
        const opList = await this.getNightDataByDay(day);
        const personList = await this.personDataService.getPersonList();
        // return a complete set of pickups, with personList
        const hostList = opList
            .filter((a) => a.role === 'night-distro' || a.role === 'night-captain')
            .map((a) => {
            const person = personList.find((p) => a.discordIdOrEmail === p.discordId ||
                a.discordIdOrEmail === p.email);
            return this.createNightPerson({
                ...a,
                ...person
            });
        });
        return hostList;
    }
    async getNightByDay(day, { refreshCache } = {}) {
        if (refreshCache) {
            await this.refreshCache();
        }
        const hostList = await this.getHostListByDay(day);
        const pickupList = await this.getPickupListByDay(day);
        console.log(pickupList);
        return this.createNight({
            day,
            hostList,
            pickupList
        });
    }
    // add a record to the top of the sheet
    async addNightTimelineRecordList(nightTimeline) {
        const headerList = await this.opsTimelineSheetService
            .waitingForHeaderList;
        for (const n of nightTimeline) {
            await this.opsTimelineSheetService.prependOneRowAfterHeader(headerList.map((header) => n[header]));
        }
        // todo: move the mapping of object to headers to sheetService
    }
    // this returns a set of strings that are unique per day, org, role, timeStart, and the id of the
    // person
    getUniqueNightOpIdentifier({ day, org, role, timeStart, discordIdOrEmail }) {
        return `${day}--${org}--${role}--${'' + timeStart}--${'' + discordIdOrEmail}`;
    }
    // this really attempts to turn person identifiers into discord ids
    async getNightOpListWithDiscordIdIfPossible(nightOps) {
        return await Promise.all(nightOps.map(async (op) => {
            const person = await this.personDataService.getPersonByEmailOrDiscordId(op.discordIdOrEmail);
            return {
                ...op,
                discordIdOrEmail: person?.discordId ??
                    person?.email ??
                    op.discordIdOrEmail
            };
        }));
    }
    // // gets a night data list adding unique records
    async getNightDataAdding(nightList, addList) {
        const idNightList = nightList.map(this.getUniqueNightOpIdentifier);
        const idAddList = addList.map(this.getUniqueNightOpIdentifier);
        return nightList.concat(...addList.filter((a, i) => {
            return !idNightList.includes(idAddList[i]);
        }));
    }
    // // gets a night data list removing unique records
    async getNightDataRemoving(nightList, removeList) {
        const idNightList = nightList.map(this.getUniqueNightOpIdentifier);
        const idRemoveList = removeList.map(this.getUniqueNightOpIdentifier);
        // if it is to be removed, filter it off
        return nightList.filter((_, i) => {
            return !idRemoveList.includes(idNightList[i]);
        });
    }
    setUpdateQueue(a) {
        this.updateQueue.push(a.then(() => {
            const i = this.updateQueue.findIndex((b) => b === a);
            if (i > 0) {
                this.updateQueue.splice(i, 1);
            }
        }));
    }
    // update pickup ops sheet for one day for one person
    // note: this is a repace op: we delete and replace
    // all pickups for that day and person and replace them
    async replacePickupsForOnePersonAndDay(day, discordId, addList) {
        this.setUpdateQueue(this.replacePickupsForOnePersonAndDayQueue(day, discordId, addList));
        await Promise.all(this.updateQueue);
    }
    async replacePickupsForOnePersonAndDayQueue(day, discordId, addList) {
        // get a fresh night list
        await this.refreshCache();
        // get the night ops in a list with discordId if there is one
        let nightList = await this.waitingForNightCache;
        // figure out what needs removing. To do this, we ...
        // filter remove all pickup role for this day and person
        nightList = nightList.filter((a) => !(a.discordIdOrEmail === discordId &&
            a.day === day &&
            a.role === 'night-pickup'));
        // here are the unique identifiers so we can remove them from the set of data to be removed
        nightList.push(...addList);
        // nightList = personDayNightList.filter(
        //     // the person day record is NOT in the list we are adding
        //     (a) => !removeIdList.includes(this.getUniqueNightOpIdentifier(a))
        // );
        // dbg(`Starting ${nightList.length}`);
        // dbg(`Adding ${addList.length}`);
        // dbg(addList);
        // nightList = await this.getNightDataAdding(nightList, addList);
        // dbg(`Added ${nightList.length}`);
        // dbg(`Removing ${removeList.length}`);
        // dbg(removeList);
        // nightList = await this.getNightDataRemoving(nightList, removeList);
        // dbg(`Removed ${nightList.length}`);
        await this.updateNightData(nightList);
    }
    async addHostForOnePersonAndDay(day, discordId, addList) {
        this.setUpdateQueue(this.addHostForOnePersonAndDayQueue(day, discordId, addList));
        await Promise.all(this.updateQueue);
    }
    async addHostForOnePersonAndDayQueue(day, discordId, addList) {
        await Promise.all(this.updateQueue);
        // get a fresh night list
        await this.refreshCache();
        // get the night ops in a list with discordId if there is one
        let nightList = await this.waitingForNightCache;
        // figure out what needs removing. To do this, we ...
        // filter our night ops so we have the unique set for person and day
        const personDayNightList = nightList.filter((a) => a.discordIdOrEmail === discordId && a.day === day);
        dbg(`Starting ${nightList.length}`);
        dbg(`Adding ${addList.length}`);
        dbg(addList);
        nightList = await this.getNightDataAdding(nightList, addList);
        dbg(`Added ${nightList.length}`);
        await this.updateNightData(nightList);
    }
    async removeNightData(removeList) {
        this.setUpdateQueue(this.removeNightDataQueue(removeList));
        await Promise.all(this.updateQueue);
    }
    async removeNightDataQueue(removeList) {
        await this.refreshCache();
        let nightList = await this.waitingForNightCache;
        nightList = await this.getNightDataRemoving(nightList, removeList);
        await this.updateNightData(nightList);
    }
    // this function replaces the entire night ops data sheet with a new one
    // used for both add and remove records
    async updateNightData(nightData) {
        const headerList = await this.nightSheetService.waitingForHeaderList;
        // attempt to save emails instead of discordIds
        nightData = await Promise.all(nightData.map(async (a) => {
            const person = await this.personDataService.getPersonByEmailOrDiscordId(a.discordIdOrEmail);
            return {
                ...a,
                discordIdOrEmail: person?.email ?? a.discordIdOrEmail
            };
        }));
        const nightRows = nightData
            // sort by role
            .sort((a, b) => {
            return a.role < b.role ? -1 : a.role > b.role ? 1 : 0;
        })
            // sort by day
            .sort((a, b) => const_1.DAYS_OF_WEEK_CODES.indexOf(a.day) -
            const_1.DAYS_OF_WEEK_CODES.indexOf(b.day))
            .map((op) => {
            return headerList.map((header) => op[header]);
        });
        await this.nightSheetService.replaceAllRowsIncludingHeader(nightRows);
        await this.refreshCache();
    }
    async refreshCache() {
        this.waitingForNightCache = this.nightSheetService
            .getAllRowsAsMaps()
            .then((a) => 
        // every record must have a day
        a.filter((b) => b.day?.trim()))
            .then((a) => a.map(this.createNightOpsData))
            // make that we have a discordId on the discordIdOrEmail prop if possible
            .then(async (a) => await this.getNightOpListWithDiscordIdIfPossible(a));
    }
    async getNightPersonList(nightList) {
        const personIdList = nightList.map((a) => a.discordIdOrEmail);
        return await Promise.all(personIdList
            .filter((a, i) => personIdList.indexOf(a) === i)
            .filter((a) => a)
            .map(async (discordIdOrEmail) => {
            const p = await this.personDataService.getPersonByEmailOrDiscordId(discordIdOrEmail);
            return _1.PersonDataService.createPersonWithQueryId(discordIdOrEmail, p ?? {});
        }));
    }
    // todo: move to markdown service
    getPickupListMd(pickupList) {
        return pickupList.length
            ? pickupList.reduce((a, { org, timeStart, personList }) => {
                return (a += `- ${org} at ${_1.ParseContentService.getAmPmTimeFrom24Hour(timeStart)} ${personList.length
                    ? ' with ' + personList.map((b) => b.name).join(', ')
                    : ''}\n`);
            }, '')
            : 'No Pick-ups';
    }
    getNightMd({ day, org, timeStart }) {
        return `${day} ${org} ${timeStart}`;
    }
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
    getNightDataDiscordSelectValues(values, { day, role, discordIdOrEmail, periodStatus }) {
        return values
            .map((a) => a.split('---'))
            .map((a) => ({
            org: a[0],
            timeStart: a[1],
            timeEnd: a[2],
            day,
            role,
            discordIdOrEmail,
            periodStatus
        }));
    }
}
exports.NightDataService = NightDataService;
