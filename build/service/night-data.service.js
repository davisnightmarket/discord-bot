"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmNightDataService = void 0;
const nm_const_1 = require("../nm-const");
const utility_1 = require("../utility");
const _1 = require(".");
class NmNightDataService {
    constructor(spreadsheetId, personCoreDataService) {
        this.opsCache = Promise.resolve({
            pickupsList: [],
            nightCapList: [],
            hostList: []
        });
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
        const { pickupsList, nightCapList, hostList } = await this.opsCache;
        return {
            pickupsList: pickupsList.filter((a) => a.day === day),
            nightCapList: nightCapList.filter((a) => a.day === day),
            hostList: hostList.filter((a) => a.day === day)
        };
    }
    // send a new ops record to the sheet
    async updateNightData(opToUpdate) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const { pickupsList, nightCapList, hostList } = await this.opsCache;
        const headerList = await this.nightSheetService.waitingForHeaderList;
        const opsData = [
            ...pickupsList.map(this.fromOpToOpData),
            ...nightCapList.map(this.fromOpToOpData),
            ...hostList.map(this.fromOpToOpData)
        ].flat();
        // add the new data
        opsData.push(opToUpdate);
        // in here we sort by day
        const opsRows = opsData
            .sort((a, b) => nm_const_1.DAYS_OF_WEEK.indexOf(a.day) - nm_const_1.DAYS_OF_WEEK.indexOf(b.day))
            // in here we add blank lines
            .reduce((a, b, i) => {
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
        await this.nightSheetService.replaceAllRowsExceptHeader(opsRows);
    }
    // turns an operation record into an ops sheet data record
    fromOpToOpData({ day, org, timeStart, timeEnd, personList }) {
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
    async getNightCache() {
        const notesList = await this.opsNotesSheetService.getAllRowsAsMaps();
        const opsList = await this.nightSheetService.getAllRowsAsMaps();
        // get unique persons and add role, period, and discordIdOrEmail
        const personList = (await Promise.all(opsList.map(async ({ timeStart, timeEnd, org, role, discordIdOrEmail, period }) => {
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
        }))).filter((a) => a);
        // reduce ops to one per day+org+timeStart
        // which allows us to collect people and roles
        const pickupsList = opsList
            .filter((a) => a.role === 'night-pickup')
            .reduce((a, { day, org, timeStart, timeEnd, discordIdOrEmail }) => {
            if (!a[day + org + timeStart]) {
                a[day + org + timeStart] = {
                    day,
                    org,
                    timeStart,
                    timeEnd,
                    personList: [],
                    noteList: notesList
                        .filter((note) => note.day === day &&
                        note.org === org &&
                        // if there is a note timeStart, it means the
                        // note is for a specific pickup time, not just that day and org
                        (note.timeStart
                            ? note.timeStart === timeStart
                            : true))
                        .map((n) => n.note)
                };
            }
            const p = personList.find((p) => p.discordIdOrEmail === discordIdOrEmail);
            if (p) {
                a[day + org + timeStart].personList.push(p);
            }
            return a;
        }, {});
        // we expect an array
        return {
            pickupsList: Object.values(pickupsList),
            nightCapList: Object.values(pickupsList),
            hostList: Object.values(pickupsList)
        };
    }
}
exports.NmNightDataService = NmNightDataService;
