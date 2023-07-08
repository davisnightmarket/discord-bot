"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmPersonService = void 0;
const nm_const_1 = require("../nm-const");
const service_1 = require("../service");
// makes it easier to find and change where data is in sheet columns
const ColumnMap = {
    EMAIL: 'C',
    NAME: 'B',
    STATUS: 'A',
    DISCORD_ID: 'N',
    LAST_COLUMN: 'N'
};
// exclude the header when we want only data
const DATA_OFFSET = 2;
// the name of the core sheet where all people are
const CORE_PERSON_SHEET = 'person';
const PERSON_LIST_CACHE_EXPIRY = 1000 * 60 * 60; // one hour until cache refresh
// we use a cache so we do not have to go to Google spreadsheet everytime we want the people
let personListCache = [];
let personListCacheLastUpdate = Date.now();
class NmPersonService {
    getPersonList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (personListCache.length === 0 ||
                Date.now() - PERSON_LIST_CACHE_EXPIRY > personListCacheLastUpdate) {
                personListCacheLastUpdate = Date.now();
                // TODO: we probably only want the active people in the cache
                personListCache = (yield this.getAllDataWithoutHeader()).map(this.createFromData);
            }
            return personListCache;
        });
    }
    createFromData(a) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        // todo: make a better mapping, maybe map header to column, make it easier to edit spreadhseet without fuckup script?
        return {
            status: ((_b = a[0]) !== null && _b !== void 0 ? _b : '').trim(),
            name: ((_c = a[1]) !== null && _c !== void 0 ? _c : '').trim(),
            email: ((_d = a[2]) !== null && _d !== void 0 ? _d : '').trim(),
            phone: ((_e = a[3]) !== null && _e !== void 0 ? _e : '').trim(),
            location: ((_f = a[4]) !== null && _f !== void 0 ? _f : '').trim(),
            bike: ((_g = a[5]) !== null && _g !== void 0 ? _g : '').trim(),
            bikeCart: ((_h = a[6]) !== null && _h !== void 0 ? _h : '').trim(),
            bikeCartAtNight: ((_j = a[7]) !== null && _j !== void 0 ? _j : '').trim(),
            skills: ((_k = a[8]) !== null && _k !== void 0 ? _k : '').trim(),
            bio: ((_l = a[9]) !== null && _l !== void 0 ? _l : '').trim(),
            pronouns: ((_m = a[10]) !== null && _m !== void 0 ? _m : '').trim(),
            interest: ((_o = a[11]) !== null && _o !== void 0 ? _o : '').trim(),
            reference: ((_p = a[12]) !== null && _p !== void 0 ? _p : '').trim(),
            discordId: ((_q = a[13]) !== null && _q !== void 0 ? _q : '').trim()
        };
    }
    getCleanNameList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getNameList().then((a) => a.filter((b) => b.trim()));
        });
    }
    getCleanEmailList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getEmailList().then((a) => a.filter((a) => a.trim()));
        });
    }
    getNameList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.personSheetService
                .rangeGet(this.getColumnDataRangeName('NAME'))
                .then((a) => a[0]);
        });
    }
    getEmailList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.personSheetService
                .rangeGet(this.getColumnDataRangeName('EMAIL'))
                .then((a) => a.map((b) => b[0]));
        });
    }
    getAllDataWithoutHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.personSheetService.rangeGet(this.getFullPersonDataRangeName())).filter((_a, i) => !!i);
        });
    }
    getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.personSheetService.rangeGet(this.getFullPersonDataRangeName());
        });
    }
    getPersonRangeByDiscorIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const personRange = '';
            return personRange;
        });
    }
    getPersonByDiscorIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const [status, name, email, phone, location, bike, bikeCart, bikeCartAtNight, skills, bio, pronouns, interest, reference, discordId] = yield this.getRowByDiscordIdOrEmail(idOrEmail);
            return {
                status,
                name,
                email,
                phone,
                location,
                bike,
                bikeCart,
                bikeCartAtNight,
                skills,
                bio,
                pronouns,
                interest,
                reference,
                discordId
            };
        });
    }
    getEmailByDiscordId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [_status, _name, email] = yield this.getRowByDiscordIdOrEmail(id);
            return email;
        });
    }
    getRowByDiscordIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            idOrEmail = idOrEmail.toLowerCase().trim();
            const emailIndex = this.getColumnIndexByName('EMAIL');
            const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
            const a = yield this.personSheetService
                .rangeGet(this.getFullPersonDataRangeName())
                .then((a) => a.filter((a) => {
                return (idOrEmail === a[emailIndex] ||
                    idOrEmail === a[discordIdIndex]);
            }))
                .then((a) => a.pop());
            return a !== null && a !== void 0 ? a : [];
        });
    }
    getRowIndexByDiscordIdOrEmail(idOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            idOrEmail = idOrEmail.toLowerCase().trim();
            const emailIndex = this.getColumnIndexByName('EMAIL');
            const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
            return yield this.personSheetService
                .rangeGet(this.getFullPersonDataRangeName())
                .then((a) => a.findIndex((a) => {
                var _b, _c;
                return (idOrEmail === ((_b = a[emailIndex]) === null || _b === void 0 ? void 0 : _b.trim()) ||
                    idOrEmail === ((_c = a[discordIdIndex]) === null || _c === void 0 ? void 0 : _c.trim()));
            }) + 1);
        });
    }
    // toggle a person state to active
    setActiveState(email, activeState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.includes(activeState)) {
                throw new Error(`Must set active state to one of ${nm_const_1.GSPREAD_CORE_ACTIVE_STATE_LIST.join(', ')}`);
            }
            // get all the person rows
            const rowIndex = yield this.getRowIndexByDiscordIdOrEmail(email);
            if (!rowIndex) {
                throw new Error('person does not exists');
            }
            const range = this.getColumnRangeName('STATUS', rowIndex);
            // update cell for active at row and column index (add method to GSpreadService)
            yield this.personSheetService.rowsWrite([[activeState]], range);
            return range;
        });
    }
    // gets the row index number from named column
    getColumnIndexByName(columnName) {
        return this.personSheetService.columnIndexFromLetter(ColumnMap[columnName]);
    }
    // returns the full range for all the person data
    getFullPersonDataRangeName() {
        return `${CORE_PERSON_SHEET}!A:${ColumnMap.LAST_COLUMN}`;
    }
    // returns the full range for all the person data minus the header
    getFullPersonDataRangeNameWithoutHeader() {
        return `${CORE_PERSON_SHEET}!A${DATA_OFFSET}:${ColumnMap.LAST_COLUMN}`;
    }
    // returns a range for a data set minus the header
    getColumnDataRangeName(columnName) {
        return this.getColumnRangeName(columnName, DATA_OFFSET, ColumnMap[columnName]);
    }
    getColumnRangeName(columnName, 
    // defaults to full column
    index = 0, 
    // optionally, get columns that follow
    endCol) {
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index || ''}${endCol ? `:${endCol}` : ''}`;
    }
    getCellRangeName(columnName, 
    // defaults to full column
    index) {
        if (!index) {
            throw new Error('must have an index to get a row range name');
        }
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index || ''}`;
    }
    constructor(personSpreadsheetId) {
        this.personSheetService = new service_1.GoogleSpreadsheetsService(personSpreadsheetId);
    }
}
exports.NmPersonService = NmPersonService;
