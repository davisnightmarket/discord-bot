"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonSheetService = void 0;
const const_1 = require("../const");
const _1 = require(".");
const PersonAvailabilityHostMap = {
    AVAILABLE_MONDAY: 'Available to host/distro Monday?',
    AVAILABLE_TUESDAY: 'Available to host/distro Tuesday?',
    AVAILABLE_WEDNESDAY: 'Available to host/distro Wednesday?',
    AVAILABLE_THURSDAY: 'Available to host/distro Thursday?',
    AVAILABLE_FRIDAY: 'Available to host/distro Friday?',
    AVAILABLE_SATURDAY: 'Available to host/distro Saturday?',
    AVAILABLE_SUNDAY: 'Available to host/distro Sunday?'
};
const PersonAvailabilityPickupMap = {
    AVAILABLE_MONDAY: 'Available to pickup Monday?',
    AVAILABLE_TUESDAY: 'Available to pickup Tuesday?',
    AVAILABLE_WEDNESDAY: 'Available to pickup Wednesday?',
    AVAILABLE_THURSDAY: 'Available to pickup Thursday?',
    AVAILABLE_FRIDAY: 'Available to pickup Friday?',
    AVAILABLE_SATURDAY: 'Available to pickup Saturday?',
    AVAILABLE_SUNDAY: 'Available to pickup Sunday?'
};
const PersonPermissionMap = {
    PERMISSION_CONTACT_EMAIL_ON_AVAILABILITY: 'Email about availability?',
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER: 'Text reminder about pickup?',
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER: 'Text reminder about hosting?',
    PERMISSION_CONTACT_TEXT_ON_AVAILABILITY_REQUEST: 'Text about availability?',
    PERMISSION_SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR: 'Share Email with Community Coordinators?',
    PERMISSION_SHARE_PHONE_WITH_COMMUNITY_COORDINATOR: 'Share Phone with Community Coordinators?',
    PERMISSION_SHARE_PHONE_WITH_NIGHT_CAP: 'Share Phone with Night Cap?'
};
const PersonTeamInterestMap = {
    'INTEREST_TEAM-BUILD': 'Build Team?',
    'INTEREST_TEAM-ONBOARDING': 'Onboarding Team?',
    'INTEREST_TEAM-OUTREACH': 'Outreach Team?',
    'INTEREST_TEAM-SOCIAL-MEDIA': 'Social Media Team?',
    INTEREST_OTHER: 'Other Team?'
};
const PersonBikeMap = {
    BIKE_OWNER: 'Have a bike?',
    BIKE_CART_OWNER: 'Have a bike cart?',
    BIKE_OPERATE_AT_NIGHT: 'Bike at night?',
    BIKE_CART_OPERATE_AT_NIGHT: 'Operate a bike cart at night?'
};
const PersonSkillMap = {
    SKILL_WOODWORKING: 'Woodworking Skills?',
    SKILL_ELECTRONICS: 'Electronics Skills?',
    SKILL_SOCIAl_MEDIA: 'Social Media Skills?',
    SKILL_LEADERSHIP: 'Leadership Skills?'
};
const PersonRoleInterestMap = {
    'INTEREST_NIGHT-CAPTAIN': 'Night Captain?',
    'INTEREST_NIGHT-DISTRO': 'Distribution & Hosting?',
    'INTEREST_NIGHT-PICKUP': 'Food Pick-up?'
};
const PersonAdminRoleInterestMap = {
    'INTEREST_COMMUNITY-COORDINATOR': 'Community Coordinator?',
    'INTEREST_FOOD-SAFETY': 'Food Safety Officer',
    INTEREST_DIRECTOR: 'Director?',
    INTEREST_TREASURER: 'Treasurer?'
};
const AttributeKeyList = [
    ...Object.keys(PersonPermissionMap),
    ...Object.keys(PersonAvailabilityHostMap),
    ...Object.keys(PersonAvailabilityPickupMap),
    ...Object.keys(PersonBikeMap),
    ...Object.keys(PersonTeamInterestMap),
    ...Object.keys(PersonRoleInterestMap),
    ...Object.keys(PersonSkillMap),
    ...Object.keys(PersonAdminRoleInterestMap)
];
const headersList = [
    'status',
    'name',
    'email',
    'phone',
    'location',
    'bike',
    'skills',
    'bio',
    'pronouns',
    'reference',
    'discordId'
];
class PersonSheetService {
    constructor(spreadsheetId) {
        this.personSheetService = new _1.GoogleSheetService({
            spreadsheetId,
            sheetName: `person`,
            headersList: this.getHeaders()
        });
        this.waitingForPersonListCache = this.getPersonList().then((a) => a.map(this.createPerson));
        // reset the cache ever 2 hour
        setInterval(() => {
            this.refreshPersonListCache();
        }, 1000 * 60 * 60 * 2);
    }
    getHeaders() {
        return headersList;
    }
    static createPersonWithQueryId(discordIdOrEmail = '', person) {
        return {
            ...PersonSheetService.createPerson(person),
            discordIdOrEmail
        };
    }
    createPerson(person = {}) {
        return PersonSheetService.createPerson(person);
    }
    toAttrSheetData(person) {
        return PersonSheetService.createAttributeMap(person);
    }
    static createAttributeMap(personAttributeMap) {
        for (const k of Object.keys(personAttributeMap)) {
            if (!AttributeKeyList.includes(k)) {
                continue;
            }
            const a = (personAttributeMap[k] || '')
                .trim()
                .toLowerCase();
            if (!a || a === 'no' || a === 'n') {
                personAttributeMap[k] = 'no';
            }
            else {
                personAttributeMap[k] =
                    'yes';
            }
        }
        return {
            ...personAttributeMap
        };
    }
    getAttrPermissionList(a) {
        return this.getAttr(a, Object.keys(PersonPermissionMap));
    }
    getAttrAvailabilityHostList(a) {
        return this.getAttr(a, Object.keys(PersonAvailabilityHostMap));
    }
    getAttrAvailabilityPickupList(a) {
        return this.getAttr(a, Object.keys(PersonAvailabilityPickupMap));
    }
    getAttrRoleInterestList(a) {
        return this.getAttr(a, Object.keys(PersonRoleInterestMap));
    }
    getAttrBikeList(a) {
        return this.getAttr(a, Object.keys(PersonBikeMap));
    }
    getAttrSkillList(a) {
        return this.getAttr(a, Object.keys(PersonSkillMap));
    }
    getAttrAdminRoleInterestList(a) {
        return this.getAttr(a, Object.keys(PersonSkillMap));
    }
    getAttr(a, k) {
        return Object.keys(a).filter((b) => k.includes(b) && a[b] === 'yes');
    }
    static createPerson(person = {}) {
        const { status = '', name = '', email = '', phone = '', location = '', bio = '', pronouns = '', interest = '', reference = '', discordId = '' } = person;
        return {
            status,
            name,
            email,
            phone,
            location,
            bio,
            pronouns,
            interest,
            reference,
            discordId,
            ...this.createAttributeMap(person)
        };
    }
    async getFreshDiscordAndEmailByDiscordIdOrEmail(discordIdOrEmailList) {
        await this.refreshPersonListCache();
        const personList = await this.waitingForPersonListCache;
        return discordIdOrEmailList
            .map((a) => personList.find((b) => b.email === a || b.discordId === a))
            .map((a) => (a ? [a?.discordId || '', a?.email || ''] : null));
    }
    async createOrUpdatePersonByDiscordId(person) {
        const { discordId } = person;
        await this.refreshPersonListCache();
        const personIdList = await this.personSheetService.getRowNumberListByMatchAnyProperties({
            discordId
        });
        if (personIdList.length > 1) {
            console.error('We should only have one person record per discordID. Updating all.');
        }
        if (!personIdList.length) {
            await this.personSheetService.createRowWithMap(person);
        }
        for (const id of personIdList) {
            await this.personSheetService.updateRowWithMapByRowNumber(id, person);
        }
        await this.refreshPersonListCache();
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
    async refreshPersonListCache() {
        return await (this.waitingForPersonListCache = this.getPersonList());
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
            (k) => query[k] &&
                '' + query[k] === '' + map[k]);
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
        if (!emailOrDiscordId?.trim()) {
            return;
        }
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
        return (this.getAttrPermissionList(this.toAttrSheetData(person))
            .map((a) => `  - ${const_1.PERMISSION_MAP[a].name}`)
            .join('\n') || '  - NO PERMISSIONS GRANTED');
    }
}
exports.PersonSheetService = PersonSheetService;
