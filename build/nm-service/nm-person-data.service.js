"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmPersonDataService = void 0;
const service_1 = require("../service");
class NmPersonDataService {
    constructor(personSpreadsheetId) {
        this.personSheetService = new service_1.Sheet({
            sheetId: personSpreadsheetId,
            range: `person!A:N`
        });
    }
    async getPersonList() {
        return await this.personSheetService.get();
    }
    async getPerson(query) {
        return await this.personSheetService.search(query);
    }
    async getNameList() {
        const people = await this.getPersonList();
        return people
            .map((person) => person.name)
            .filter((name) => name.trim());
    }
    async getEmailList() {
        const people = await this.getPersonList();
        return people
            .map((person) => person.email)
            .filter((email) => email.trim());
    }
    async getPersonByEmailOrDiscord(emailOrDiscordId) {
        return await this.personSheetService.search({ email: emailOrDiscordId })
            ?? await this.personSheetService.search({ discordId: emailOrDiscordId });
    }
    async setActiveState(email, status) {
        await this.personSheetService.update({ email }, { status });
    }
}
exports.NmPersonDataService = NmPersonDataService;
