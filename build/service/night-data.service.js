"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightDataService = void 0;
const const_1 = require("../const");
const utility_1 = require("../utility");
const _1 = require(".");
class NightDataService {
    constructor(spreadsheetId, personCoreDataService) {
        this.waitingForNightCache = Promise.resolve([]);
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
        this.personCoreDataService = personCoreDataService;
        this.refreshCache();
    }
    createNight({ 
    // defaults to blank, because we should always get a day
    day = '', org = '', timeStart = '', timeEnd = '', hostList = [], pickupList = [] }) {
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
    limitRows = 1000) {
        return await this.opsTimelineSheetService.getAllRowsAsMaps({
            limitRows
        });
    }
    async getNightTimelineListByDate(date) {
        return (await this.getNightTimelineList()).filter((a) => new Date(a.stamp) === date);
    }
    async getNightDataByDay(
    // defaults to today
    day = (0, utility_1.GetChannelDayToday)()) {
        return (await this.waitingForNightCache).filter((a) => a.day === day);
    }
    async getDayTimeIdAndReadableByDayAsTupleList() {
        return this.waitingForNightCache.then((nightOps) => {
            const dayTimesMap = nightOps.reduce((a, b) => {
                if (b.day && b.timeStart && !a[b.day + b.timeStart]) {
                    a[b.day + b.timeStart] = [
                        `${b.day}|||${b.timeStart}`,
                        `${const_1.DAYS_OF_WEEK[b.day].name} ${_1.ParseContentService.getAmPmTimeFrom24Hour(b.timeStart)}`
                    ];
                }
                return a;
            }, {});
            return Object.values(dayTimesMap);
        });
    }
    async getOpsNotesByDay(day) {
        return (await this.opsNotesSheetService.getAllRowsAsMaps()).filter((a) => a.day === day);
    }
    async getPickupListByDay(day) {
        const nightList = await this.getNightDataByDay(day);
        const personList = await this.getNightPersonList(nightList);
        const noteList = await this.getOpsNotesByDay(day);
        // return a complete set of pickups, with personList and noteList
        const pickupList = Object.values(nightList
            .filter((a) => (a.role = 'night-pickup'))
            .reduce((a, op) => {
            const { day, org, timeStart } = op;
            if (day && org && timeStart && !a[day + org + timeStart]) {
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
                // get the single person in this op record
                const person = personList.find((a) => a.discordIdOrEmail === op.discordIdOrEmail);
                if (person) {
                    a[day + org + timeStart].personList.push({
                        ...op,
                        ...person
                    });
                }
            }
            return a;
        }, {}));
        return pickupList;
    }
    // nightcap and host
    async getHostListByDay(day) {
        const opList = await this.getNightDataByDay(day);
        const personList = await this.personCoreDataService.getPersonList();
        // return a complete set of pickups, with personList
        const pickupList = opList
            .filter((a) => (a.role = 'night-pickup'))
            .map((a) => {
            const person = personList.find((p) => p.discordIdOrEmail === a.discordIdOrEmail);
            return {
                ...a,
                ...person
            };
        });
        return pickupList;
    }
    async getNightByDay(day) {
        const night = (await this.getNightDataByDay(day)).reduce((a, b) => {
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
        }, this.createNight({}));
        const hostList = await this.getHostListByDay(day);
        const pickupList = await this.getPickupListByDay(day);
        return {
            ...night,
            hostList,
            pickupList
        };
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
    async addNightData(nightUpdateList) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const nightData = await this.waitingForNightCache;
        // add the new data
        nightData.push(
        // make sure we have no repeats
        ...nightUpdateList.filter((a) => {
            // ! if we do NOT find a record, then we update
            return !nightData.find(({ day, org, discordIdOrEmail, timeStart }) => {
                return (a.day === day &&
                    a.org === org &&
                    a.discordIdOrEmail === discordIdOrEmail &&
                    // todo: if there is no timeStart, what happens?
                    a.timeStart === timeStart);
            });
        }));
        await this.updateNightData(nightData);
    }
    async removeNightData(nightRemoveList) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const nightData = await this.waitingForNightCache;
        for (const a of nightRemoveList) {
            //! if we DO find a record, then we delete
            const index = nightData.findIndex(({ day, org, discordIdOrEmail, timeStart }) => {
                return (a.day === day &&
                    a.org === org &&
                    a.discordIdOrEmail === discordIdOrEmail &&
                    // todo: if there is no timeStart, what happens?
                    a.timeStart === timeStart);
            });
            nightData.splice(index, 1);
        }
        await this.updateNightData(nightData);
    }
    // this function replaces the entire night ops data sheet with a new one
    // used for both add and remove records
    async updateNightData(nightData) {
        const headerList = await this.nightSheetService.waitingForHeaderList;
        // in here we sort by day
        const nightRows = nightData
            .sort((a, b) => {
            return a.role < b.role ? -1 : a.role > b.role ? 1 : 0;
        })
            .sort((a, b) => const_1.DAYS_OF_WEEK_CODES.indexOf(a.day) -
            const_1.DAYS_OF_WEEK_CODES.indexOf(b.day))
            //in here we add blank lines
            //! NOT WORKING: we need to add a method to the sheet service
            .reduce((a, { day, role, org, discordIdOrEmail, period, timeStart, timeEnd }, i) => {
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
        }, [])
            // turn it into an array of data mapping to the headers
            .map((op) => {
            return op
                ? headerList.map((header) => op[header])
                : headerList.map(() => ' ');
        });
        await this.nightSheetService.replaceAllRowsIncludingHeader(nightRows);
        await this.refreshCache();
    }
    async refreshCache() {
        this.waitingForNightCache = this.nightSheetService.getAllRowsAsMaps();
    }
    async getNightPersonList(nightList) {
        const personIdList = nightList.map((a) => a.discordIdOrEmail);
        return await Promise.all(personIdList
            .filter((a, i) => personIdList.indexOf(a) === i)
            .filter((a) => a)
            .map(async (discordIdOrEmail) => {
            const p = await this.personCoreDataService.getPersonByEmailOrDiscordId(discordIdOrEmail);
            return _1.PersonDataService.createPersonWithQueryId(discordIdOrEmail, p || {});
        }));
    }
}
exports.NightDataService = NightDataService;
