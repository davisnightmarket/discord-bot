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
exports.NmPersonDataService = void 0;
const service_1 = require("../service");
class NmPersonDataService {
    constructor(personSpreadsheetId) {
        this.personSheetService = new service_1.Sheet({
            sheetId: personSpreadsheetId,
            range: `person!A:N`,
            cacheTime: 1000 * 60 * 60, // one hour until cache refresh
        });
    }
    getPersonList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.personSheetService.get();
        });
    }
    getPersonByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const people = yield this.getPersonList();
            return people.find((person) => person.name === name);
        });
    }
    getPersonByDiscorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const people = yield this.getPersonList();
            return people.find((person) => person.discordId === id);
        });
    }
    getEmailByDiscordId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getPersonByDiscorId(id).then(person => person === null || person === void 0 ? void 0 : person.email);
        });
    }
}
exports.NmPersonDataService = NmPersonDataService;
