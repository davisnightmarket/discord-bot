"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmOpsDataService = void 0;
const nm_const_1 = require("../nm-const");
const utility_1 = require("../utility");
const _1 = require("./");
class NmOpsDataService {
    constructor(spreadsheetId, personCoreDataService) {
        this.opsCache = [];
        this.opsSheetService = new _1.GoogleSheetService({
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
    updateOpsSheet({}) { }
    async getOpsTimelineList(
    // we don't need more than 1000 records to figure out the timeline
    limitRows = 1000) {
        this.opsTimelineSheetService.getAllRowsAsMaps({ limitRows });
    }
    async getOpsDataByDay(
    // defaults to today
    day = (0, utility_1.GetChannelDayToday)()) {
        const p = await this.opsSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }
    async getOpsByDay(day = (0, utility_1.GetChannelDayToday)()) {
        return this.opsCache.filter((a) => a.day === day);
    }
    // send a new ops record to the sheet
    async updateOpsData(opToUpdate) {
        // updating data, always get fresh data
        // because we use the cache to update
        await this.refreshCache();
        const headerList = await this.opsSheetService.waitingForHeaderList;
        const opsData = [...this.opsCache.map(this.fromOpToOpData)].flat();
        // add the new data
        opsData.push(opToUpdate);
        // in here we sort by day
        const opsRows = opsData
            .sort((a, b) => nm_const_1.DAYS_OF_WEEK.indexOf(a.day) - nm_const_1.DAYS_OF_WEEK.indexOf(b.day))
            // in here we add blank lines
            .reduce((a, b, i) => {
            if (opsData[i + 1]?.day !== b.day) {
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
        await this.opsSheetService.replaceAllRowsExceptHeader(opsRows);
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
        const notesList = await this.opsNotesSheetService.getAllRowsAsMaps();
        const opsList = await this.opsSheetService.getAllRowsAsMaps();
        // get unique persons and add role, period, and discordIdOrEmail
        const personList = (await Promise.all(opsList.map(async ({ role, discordIdOrEmail, period }) => this.personCoreDataService
            .getPersonByEmailOrDiscordId(discordIdOrEmail)
            .then((b) => {
            return b
                ? {
                    ...b,
                    discordIdOrEmail,
                    period,
                    role
                }
                : null;
        })))).filter((a) => a);
        // reduce ops to one per day+org+timeStart
        // which allows us to collect people and roles
        const opsUnique = opsList.reduce((a, b) => {
            if (!a[b.day + b.org + b.timeStart]) {
                a[b.day + b.org + b.timeStart] = {
                    ...b,
                    personList: [],
                    noteList: notesList
                        .filter((note) => note.day === b.day &&
                        note.org === b.org &&
                        // if there is a note timeStart, it means the
                        // note is for a specific pickup time, not just that day and org
                        (note.timeStart
                            ? note.timeStart === b.timeStart
                            : true))
                        .map((n) => n.note)
                };
            }
            const p = personList.find((p) => (p.discordIdOrEmail = b.discordIdOrEmail));
            if (p) {
                a[b.day + b.org + b.timeStart].personList.push(p);
            }
            return a;
        }, {});
        // we expect an array
        this.opsCache = Object.values(opsUnique);
    }
}
exports.NmOpsDataService = NmOpsDataService;
