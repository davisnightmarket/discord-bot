"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmNightDataService = exports.NightModel = exports.DayNightCacheModel = void 0;
const const_1 = require("../const");
const utility_1 = require("../utility");
const _1 = require(".");
// each night operations organized by day
class DayNightCacheModel {
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
    constructor({ monday = NightModel.create({}), tuesday = NightModel.create({}), wednesday = NightModel.create({}), thursday = NightModel.create({}), friday = NightModel.create({}), saturday = NightModel.create({}), sunday = NightModel.create({}) }) {
        this.monday = monday;
        this.tuesday = tuesday;
        this.wednesday = wednesday;
        this.thursday = thursday;
        this.friday = friday;
        this.saturday = saturday;
        this.sunday = sunday;
    }
}
exports.DayNightCacheModel = DayNightCacheModel;
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
        this.nightCache = Promise.resolve(new DayNightCacheModel({}));
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
    updateNightSheet() { }
    async getNightTimelineList(
    // we don't need more than 1000 records to figure out the timeline
    limitRows = 1000) {
        this.opsTimelineSheetService.getAllRowsAsMaps({ limitRows });
    }
    async getNightDataByDay(
    // defaults to today
    day = (0, utility_1.GetChannelDayToday)()) {
        const p = await this.nightSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }
    async getNightByDay(day = (0, utility_1.GetChannelDayToday)()) {
        return (await this.nightCache)[day];
    }
    // send a new ops record to the sheet
    async updateNightData(nightToUpdate) {
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
    }
    // turns an operation record into an ops sheet data record
    toNightData({ day, hostList, pickupList }) {
        return pickupList
            .map(({ role, discordIdOrEmail, period, org, timeStart, timeEnd }) => ({
            role,
            discordIdOrEmail,
            period,
            day,
            org,
            timeStart,
            timeEnd
        }))
            .concat(hostList.map(({ role, discordIdOrEmail, period, org = '', timeStart = '', timeEnd = '' }) => ({
            role,
            discordIdOrEmail,
            period,
            day,
            org,
            timeStart,
            timeEnd
        })));
    }
    async refreshCache() {
        this.nightCache = this.getNightCache();
    }
    async getNightCache() {
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
        return new DayNightCacheModel(nightList.reduce((cache, op) => {
            const night = NightModel.create(op);
            if (!cache[op.day]) {
                cache[op.day] = night;
            }
            // here we make sure that we don't miss any data per day
            // because a field is left blank on any one record
            Object.keys(night).forEach((k) => {
                if (night[k] && !cache[op.day][k]) {
                    cache[op.day][k] = night[k];
                }
            });
            // here we get each unique pickup with a list of people associated
            // onto a map and turn it into an array
            cache[op.day].pickupList = Object.values(
            // todo: put this in a method
            nightList.reduce((a, p) => {
                const { day, org, timeStart } = p;
                if (day &&
                    org &&
                    timeStart &&
                    !a[day + org + timeStart]) {
                    a[day + org + timeStart] = {
                        ...p,
                        personList: [],
                        noteList: []
                    };
                    if (p.role === 'night-pickup') {
                        const person = personList.find((a) => a.discordIdOrEmail ===
                            p.discordIdOrEmail);
                        if (person) {
                            a[day + org + timeStart].personList.push({
                                ...p,
                                ...person
                            });
                        }
                    }
                }
                return a;
            }, {}));
            // here we simply want everyone associated with that night
            // as host or cap on a list
            cache[op.day].hostList = nightList
                .filter(({ role }) => role === 'night-captain' || role === 'night-host')
                .map(({ discordIdOrEmail, period, role }) => {
                const p = personList.find((a) => a.discordIdOrEmail === discordIdOrEmail);
                return {
                    ...p,
                    period,
                    role
                };
            })
                .filter((a) => a);
            return cache;
        }, {}));
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
