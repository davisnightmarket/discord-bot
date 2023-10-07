"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmNightDataService = exports.NightModel = void 0;
const const_1 = require("../const");
const utility_1 = require("../utility");
const _1 = require(".");
// each night operations organized by day
// export class DayNightCacheModel implements DayNightCache {
//     monday: Night;
//     tuesday: Night;
//     wednesday: Night;
//     thursday: Night;
//     friday: Night;
//     saturday: Night;
//     sunday: Night;
//     // static fromData(nightList: NightDataModel[]): DayNightCache {
//     //     return new DayNightCacheModel(
//     //         nightList.reduce((all, { day, org, timeStart, timeEnd }) => {
//     //             if (!all[day]) {
//     //                 all[day] = NightModel.create({
//     //                     day,
//     //                     // these should always be data about the market itself
//     //                     org,
//     //                     timeStart,
//     //                     timeEnd,
//     //                     hostList: [],
//     //                     pickupList: []
//     //                 });
//     //             }
//     //             return all;
//     //         }, {} as Partial<DayNightCacheModel>)
//     //     );
//     // }
//     constructor({
//         monday = NightModel.create({}),
//         tuesday = NightModel.create({}),
//         wednesday = NightModel.create({}),
//         thursday = NightModel.create({}),
//         friday = NightModel.create({}),
//         saturday = NightModel.create({}),
//         sunday = NightModel.create({})
//     }: Partial<DayNightCacheModel>) {
//         this.monday = monday;
//         this.tuesday = tuesday;
//         this.wednesday = wednesday;
//         this.thursday = thursday;
//         this.friday = friday;
//         this.saturday = saturday;
//         this.sunday = sunday;
//     }
// }
class NightModel {
    static create({ day = 'monday', org = '', timeStart = '', timeEnd = '', hostList = [], pickupList = [] }) {
        return new NightModel({
            day,
            org,
            timeStart,
            timeEnd,
            hostList,
            pickupList
        });
    }
    constructor({ day, org = '', timeStart = '', timeEnd = '', hostList = [], pickupList = [] }) {
        if (!const_1.DAYS_OF_WEEK.includes(day)) {
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
exports.NightModel = NightModel;
class NmNightDataService {
    constructor(spreadsheetId, personCoreDataService) {
        this.waitingForNightCache = Promise.resolve([]);
        // send a new ops record to the sheet
        // TODO: so, folks can update the sheet at the same time which will cause a mess
        // we need to queue updates
        this.updateNightDataQueue = [];
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
    async getNightTimelineList(
    // we don't need more than 1000 records to figure out the timeline
    limitRows = 1000) {
        this.opsTimelineSheetService.getAllRowsAsMaps({ limitRows });
    }
    async getNightDataByDay(
    // defaults to today
    day = (0, utility_1.GetChannelDayToday)()) {
        return (await this.waitingForNightCache).filter((a) => a.day === day);
    }
    async getPickupListByDay(day) {
        const nightList = await this.getNightDataByDay(day);
        const personList = await this.getNightPersonList(nightList);
        // return a complete set of pickups, with personList
        const pickupList = Object.values(nightList
            .filter((a) => (a.role = 'night-pickup'))
            .reduce((a, op) => {
            const { day, org, timeStart } = op;
            if (day && org && timeStart && !a[day + org + timeStart]) {
                a[day + org + timeStart] = {
                    ...op,
                    personList: [],
                    noteList: []
                };
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
        }, NightModel.create({}));
        const hostList = await this.getHostListByDay(day);
        const pickupList = await this.getPickupListByDay(day);
        return {
            ...night,
            hostList,
            pickupList
        };
    }
    async updateNightData(nightToUpdate) {
        for (const p of this.updateNightDataQueue) {
            await p;
        }
        this.updateNightDataQueue = [this.pushNightData(nightToUpdate)];
    }
    async pushNightData(nightToUpdate) {
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
            .sort((a, b) => const_1.DAYS_OF_WEEK.indexOf(a.day) - const_1.DAYS_OF_WEEK.indexOf(b.day))
            // in here we add blank lines
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
                : headerList.map(() => '');
        });
        console.log(nightRows);
        await this.nightSheetService.replaceAllRowsIncludingHeader(nightRows);
        await this.refreshCache();
    }
    async refreshCache() {
        this.waitingForNightCache = this.getNightCache();
    }
    async getNightCache() {
        return await this.nightSheetService.getAllRowsAsMaps();
    }
    async getNightPersonList(nightList) {
        const personIdList = nightList.map((a) => a.discordIdOrEmail);
        return await Promise.all(personIdList
            .filter((a, i) => personIdList.indexOf(a) === i)
            .filter((a) => a)
            .map(async (discordIdOrEmail) => {
            const p = await this.personCoreDataService.getPersonByEmailOrDiscordId(discordIdOrEmail);
            return _1.NmPersonDataService.createPersonWithQueryId(discordIdOrEmail, p || {});
        }));
    }
}
exports.NmNightDataService = NmNightDataService;
