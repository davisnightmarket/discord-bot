"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NmPersonDataService = void 0;
const service_1 = require("../service");
class NmPersonDataService {
    constructor(spreadsheetId) {
        this.personSheetService = new service_1.GoogleSheetService({
            spreadsheetId,
            sheetName: `person`
        });
    }
    async getPersonList() {
        return await this.personSheetService.getAllRowsAsMaps();
    }
    // if any of the propties of the query match the person
    async getPersonListByMatchAnyProperties(query) {
        return await this.personSheetService.getMapsByMatchAnyProperties(query);
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
    async getPersonByEmailOrDiscordId(emailOrDiscordId) {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id
        const a = (await emailOrDiscordId.split('@').length) !== 2
            ? await this.getPersonListByMatchAnyProperties({
                discordId: emailOrDiscordId
            })
            : (await this.getPersonListByMatchAnyProperties({
                email: emailOrDiscordId
            })) ??
                (await this.getPersonListByMatchAnyProperties({
                    discordId: emailOrDiscordId
                }));
        if (a.length > 1) {
            throw new Error('We found multiple persons with that identifier!');
        }
        return a[0] || null;
    }
    async setActiveState(email, status) {
        // todo: move this to a more generic get person index by email or id
        const indexList = await this.personSheetService.getIndexListByMatchAnyProperties({
            email
        });
        if (!indexList.length) {
            throw new Error('No person with that email!');
        }
        if (indexList.length > 1) {
            throw new Error('We found multiple persons with that email!');
        }
        await this.personSheetService.updateRowByIndex(indexList[0], status);
    }
}
exports.NmPersonDataService = NmPersonDataService;
