"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonDataService = void 0;
const const_1 = require("../const");
const service_1 = require("../service");
class PersonDataService {
    constructor(spreadsheetId) {
        this.personSheetService = new service_1.GoogleSheetService({
            spreadsheetId,
            sheetName: `person`
        });
        this.waitingForPersonListCache = this.getPersonList().then((a) => a.map(this.createPerson));
        // reset the cache ever 2 hour
        setInterval(() => {
            this.refreshPersonListCache();
        }, 1000 * 60 * 60 * 2);
    }
    static createPersonWithQueryId(discordIdOrEmail = '', person) {
        return {
            ...PersonDataService.createPerson(person),
            discordIdOrEmail
        };
    }
    createPerson(person = {}) {
        return PersonDataService.createPerson(person);
    }
    static createPerson({ status = '', name = '', email = '', phone = '', location = '', bike = '', bikeCart = '', bikeCartAtNight = '', skills = '', bio = '', pronouns = '', interest = '', reference = '', discordId = '', availabilityHost = '', availabilityPickup = '', teamInterest = '', permissionList = '', stampCreate = '' } = {}) {
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
            discordId,
            availabilityHost,
            availabilityPickup,
            teamInterest,
            permissionList,
            stampCreate
        };
    }
    async getFreshDiscordAndEmailByDiscordIdOrEmail(discordIdOrEmailList) {
        await this.refreshPersonListCache();
        const personList = await this.waitingForPersonListCache;
        return discordIdOrEmailList
            .map((a) => personList.find((b) => b.email === a || b.discordId === a))
            .map((a) => (a ? [a?.discordId || '', a?.email || ''] : null));
    }
    async updatePersonByDiscordId(person) {
        const { discordId } = person;
        await this.refreshPersonListCache();
        const personIdList = await this.personSheetService.getRowNumberListByMatchAnyProperties({
            discordId
        });
        if (!personIdList.length) {
            throw new Error('We should only have one person record per discordID. Updating all.');
        }
        if (personIdList.length > 1) {
            console.error('We should only have one person record per discordID. Updating all.');
        }
        for (const id of personIdList) {
            await this.personSheetService.updateRowWithMapByRowNumber(id, person);
        }
        await this.refreshPersonListCache();
    }
    async getPersonList() {
        return await this.personSheetService.getAllRowsAsMaps();
    }
    refreshPersonListCache() {
        return (this.waitingForPersonListCache = this.getPersonList());
    }
    async getPersonListCache() {
        return await this.waitingForPersonListCache;
    }
    // if any of the propties of the query match the person
    async getPersonListByMatchAnyProperties(query) {
        // if we can find them on the cache ...
        const list = (await this.waitingForPersonListCache).filter((map) => {
            return Object.keys(map).some(
            // note that we turn everything into strings
            (k) => query[k] && '' + query[k] === '' + map[k]);
        });
        return list;
        // .length
        //     ? list
        //     : (await this.getPersonList()).filter((map) => {
        //           return Object.keys(map).some(
        //               (k) => query[k] && '' + query[k] === '' + map[k]
        //           );
        //       });
    }
    async getNameList() {
        const people = await this.waitingForPersonListCache;
        return people
            .map((person) => person.name)
            .filter((name) => name.trim());
    }
    async getEmailList() {
        const people = await this.waitingForPersonListCache;
        return people
            .map((person) => person.email)
            .filter((email) => email.trim());
    }
    async getPersonByDiscordId(discordId) {
        const a = await this.getPersonListByMatchAnyProperties({
            discordId
        });
        if (a.length > 1) {
            console.error(`We found multiple persons with that identidiscordId!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0];
    }
    async getPersonByEmail(email) {
        const a = await this.getPersonListByMatchAnyProperties({
            email
        });
        if (a.length > 1) {
            console.error(`We found multiple persons with that email!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0] || null;
    }
    async getPersonByEmailOrDiscordId(emailOrDiscordId) {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id
        return emailOrDiscordId.split('@').length !== 2
            ? await this.getPersonByDiscordId(emailOrDiscordId)
            : (await this.getPersonByEmail(emailOrDiscordId)) ??
                (await this.getPersonByDiscordId(emailOrDiscordId));
    }
    async setActiveState(email, status) {
        // todo: move this to a more generic get person index by email or id
        const indexList = await this.personSheetService.getRowNumberListByMatchAnyProperties({
            email
        });
        if (!indexList.length) {
            throw new Error('No person with that email!');
        }
        if (indexList.length > 1) {
            throw new Error('We found multiple persons with that email!');
        }
        await this.personSheetService.updateRowByRowNumber(indexList[0], [
            status
        ]);
        this.refreshPersonListCache();
    }
    // methods return markdown person info
    getPermissionListMd(person) {
        return (person?.permissionList
            ?.split(',')
            .filter((a) => a)
            .map((a) => `  - ${const_1.PERMISSION_MAP[a].name}`)
            .join('\n') || '  - NO PERMISSIONS GRANTED');
    }
}
exports.PersonDataService = PersonDataService;
