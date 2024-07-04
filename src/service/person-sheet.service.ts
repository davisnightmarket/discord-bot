import { PERMISSION_MAP } from '../const';
import { type NmStatusType } from '../model';
import { GoogleSheetService, type SpreadsheetDataModel } from '.';
import type {
    PersonAttrPermissionType,
    PersonAttrAvailabilityType,
    PersonAttrAdminRoleInterestType,
    PersonAttrBikeType,
    PersonAttrRoleInterestType,
    PersonAttrSkillType,
    PersonAttrTeamInterestType
} from '../model/person.model';
import { GetDebug } from '../utility';

const dbg = GetDebug('PersonSheetService');

type PersonAttrType =
    | PersonAttrPermissionType
    | PersonAttrAvailabilityType
    | PersonAttrAdminRoleInterestType
    | PersonAttrBikeType
    | PersonAttrRoleInterestType
    | PersonAttrSkillType
    | PersonAttrTeamInterestType;

const PersonAvailabilityHostMap: { [k in PersonAttrAvailabilityType]: string } =
    {
        AVAILABLE_MONDAY: 'Available to host/distro Monday?',
        AVAILABLE_TUESDAY: 'Available to host/distro Tuesday?',
        AVAILABLE_WEDNESDAY: 'Available to host/distro Wednesday?',
        AVAILABLE_THURSDAY: 'Available to host/distro Thursday?',
        AVAILABLE_FRIDAY: 'Available to host/distro Friday?',
        AVAILABLE_SATURDAY: 'Available to host/distro Saturday?',
        AVAILABLE_SUNDAY: 'Available to host/distro Sunday?'
    };

const PersonAvailabilityPickupMap: {
    [k in PersonAttrAvailabilityType]: string;
} = {
    AVAILABLE_MONDAY: 'Available to pickup Monday?',
    AVAILABLE_TUESDAY: 'Available to pickup Tuesday?',
    AVAILABLE_WEDNESDAY: 'Available to pickup Wednesday?',
    AVAILABLE_THURSDAY: 'Available to pickup Thursday?',
    AVAILABLE_FRIDAY: 'Available to pickup Friday?',
    AVAILABLE_SATURDAY: 'Available to pickup Saturday?',
    AVAILABLE_SUNDAY: 'Available to pickup Sunday?'
};

const PersonPermissionMap: { [k in PersonAttrPermissionType]: string } = {
    PERMISSION_CONTACT_EMAIL_ON_AVAILABILITY: 'Email about availability?',
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER:
        'Text reminder about pickup?',
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER:
        'Text reminder about hosting?',
    PERMISSION_CONTACT_TEXT_ON_AVAILABILITY_REQUEST: 'Text about availability?',
    PERMISSION_SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR:
        'Share Email with Community Coordinators?',
    PERMISSION_SHARE_PHONE_WITH_COMMUNITY_COORDINATOR:
        'Share Phone with Community Coordinators?',
    PERMISSION_SHARE_PHONE_WITH_NIGHT_CAP: 'Share Phone with Night Cap?'
};

const PersonTeamInterestMap: { [k in PersonAttrTeamInterestType]: string } = {
    'INTEREST_TEAM-BUILD': 'Build Team?',
    'INTEREST_TEAM-ONBOARDING': 'Onboarding Team?',
    'INTEREST_TEAM-OUTREACH': 'Outreach Team?',
    'INTEREST_TEAM-SOCIAL-MEDIA': 'Social Media Team?',
    INTEREST_OTHER: 'Other Team?'
};

const PersonBikeMap: { [k in PersonAttrBikeType]: string } = {
    BIKE_OWNER: 'Have a bike?',
    BIKE_CART_OWNER: 'Have a bike cart?',
    BIKE_OPERATE_AT_NIGHT: 'Bike at night?',
    BIKE_CART_OPERATE_AT_NIGHT: 'Operate a bike cart at night?'
};

const PersonSkillMap: { [k in PersonAttrSkillType]: string } = {
    SKILL_WOODWORKING: 'Woodworking Skills?',
    SKILL_ELECTRONICS: 'Electronics Skills?',
    SKILL_SOCIAl_MEDIA: 'Social Media Skills?',
    SKILL_LEADERSHIP: 'Leadership Skills?'
};

const PersonRoleInterestMap: { [k in PersonAttrRoleInterestType]: string } = {
    'INTEREST_NIGHT-CAPTAIN': 'Night Captain?',
    'INTEREST_NIGHT-DISTRO': 'Distribution & Hosting?',
    'INTEREST_NIGHT-PICKUP': 'Food Pick-up?'
};

const PersonAdminRoleInterestMap: {
    [k in PersonAttrAdminRoleInterestType]: string;
} = {
    'INTEREST_COMMUNITY-COORDINATOR': 'Community Coordinator?',
    'INTEREST_FOOD-SAFETY': 'Food Safety Officer',
    INTEREST_DIRECTOR: 'Director?',
    INTEREST_TREASURER: 'Treasurer?'
};

// Attr Value Maps
type PersonAttrAvailabilitySheetModel = {
    [k in PersonAttrAvailabilityType]: 'yes' | 'no' | 'string';
};

type PersonAttrPermissionSheetModel = {
    [k in PersonAttrPermissionType]: 'yes' | 'no' | 'string';
};

type PersonAttrTeamInterestSheetModel = {
    [k in PersonAttrTeamInterestType]: 'yes' | 'no' | 'string';
};

type PersonAttrBikeSheetModel = {
    [k in PersonAttrBikeType]: 'yes' | 'no' | 'string';
};

type PersonAttrSkillSheetModel = {
    [k in PersonAttrSkillType]: 'yes' | 'no' | 'string';
};

type PersonAttrRoleInterestSheetModel = {
    [k in PersonAttrRoleInterestType]: 'yes' | 'no' | 'string';
};

type PersonAttrAdminRoleInterestSheetModel = {
    [k in PersonAttrAdminRoleInterestType]: 'yes' | 'no' | 'string';
};

export type PersonAttributeModel = PersonAttrAvailabilitySheetModel &
    PersonAttrPermissionSheetModel &
    PersonAttrTeamInterestSheetModel &
    PersonAttrBikeSheetModel &
    PersonAttrSkillSheetModel &
    PersonAttrRoleInterestSheetModel &
    PersonAttrAdminRoleInterestSheetModel;

export interface PersonSheetModel extends SpreadsheetDataModel {
    status: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    pronouns: string;
    reference: string;
    discordId: string;
    stampCrabappbleLastContacted: string;
}

interface PersonSheetOpt {
    refreshCache?: boolean;
}

const personHeadersList: Array<keyof PersonSheetModel> = [
    'status',
    'name',
    'email',
    'phone',
    'location',
    'bike',
    'skills',
    'bio',
    'pronouns',
    'discordId',
    'stampCrabAppleLastContacted'
];

const personAttributeCodeList = [
    ...Object.keys(PersonPermissionMap),
    ...Object.keys(PersonAvailabilityHostMap),
    ...Object.keys(PersonAvailabilityPickupMap),
    ...Object.keys(PersonBikeMap),
    ...Object.keys(PersonTeamInterestMap),
    ...Object.keys(PersonRoleInterestMap),
    ...Object.keys(PersonSkillMap),
    ...Object.keys(PersonAdminRoleInterestMap)
];

interface PersonAttributeSheetModel extends SpreadsheetDataModel {
    emailOrDiscordId: string;
    attributeCode: keyof PersonAttributeModel;
    attributeValue: 'yes' | 'no' | 'string';
}

const personAttributeHeadersList = [
    'emailOrDiscordId',
    'attributeCode',
    'attributeValue'
];

export type PersonWithIdModel = PersonSheetModel & { discordIdOrEmail: string };

export class PersonSheetService {
    personSheetService: GoogleSheetService<PersonSheetModel>;
    personAttributeSheetService: GoogleSheetService<PersonAttributeSheetModel>;
    waitingForPersonListCache: Promise<PersonSheetModel[]>;
    constructor(spreadsheetId: string) {
        this.personSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person`,
            headersList: this.getPersonHeaders()
        });
        this.personAttributeSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person-attribute`,
            headersList: this.getPersonAttributeHeaders()
        });
        this.waitingForPersonListCache = this.getPersonList().then((a) =>
            a.map(this.createPersonModel)
        );
        // reset the cache ever 2 hour
        setInterval(() => {
            this.refreshPersonListCache();
        }, 1000 * 60 * 60 * 2);
    }

    getPersonHeaders() {
        return personHeadersList as string[];
    }

    getPersonAttributeHeaders() {
        return personAttributeHeadersList;
    }

    static createPersonWithQueryId(
        discordIdOrEmail: string = '',
        person: Partial<PersonSheetModel>
    ): PersonWithIdModel {
        return {
            ...PersonSheetService.createPersonModel(person),
            discordIdOrEmail
        };
    }

    createPersonModel(
        person: Partial<PersonSheetModel> = {}
    ): PersonSheetModel {
        return PersonSheetService.createPersonModel(person);
    }

    // this takes the attribute map and turns it back into a list of unique attribute values that can go in the spreadsheet
    toAttrSheetData(
        discordIdOrEmail: string,
        attributeMap: PersonAttributeSheetModel
    ): Array<[string, string, string]> {
        return Object.keys(attributeMap).map((k) => [
            discordIdOrEmail,
            k,
            attributeMap[k as keyof PersonAttributeSheetModel] as string
        ]);
    }

    // takes a list of attribute values from the spread and turns it into a map
    createAttributeMap(
        sheetAttributeList: PersonAttributeSheetModel[]
    ): PersonAttributeModel {
        return sheetAttributeList.reduce<any>((a, b) => {
            a[b.attributeCode] = b.attributeValue;
            return a;
        }, {}) as PersonAttributeModel;
    }

    getAttrPermissionList(
        a: PersonAttributeSheetModel
    ): PersonAttrPermissionType[] {
        return this.getAttr<PersonAttrPermissionType>(
            a,
            Object.keys(PersonPermissionMap) as PersonAttrPermissionType[]
        );
    }

    getAttrAvailabilityHostList(
        a: PersonAttributeSheetModel
    ): PersonAttrAvailabilityType[] {
        return this.getAttr<PersonAttrAvailabilityType>(
            a,
            Object.keys(
                PersonAvailabilityHostMap
            ) as PersonAttrAvailabilityType[]
        );
    }

    getAttrAvailabilityPickupList(
        a: PersonAttributeSheetModel
    ): PersonAttrAvailabilityType[] {
        return this.getAttr<PersonAttrAvailabilityType>(
            a,
            Object.keys(
                PersonAvailabilityPickupMap
            ) as PersonAttrAvailabilityType[]
        );
    }

    getAttrRoleInterestList(
        a: PersonAttributeSheetModel
    ): PersonAttrRoleInterestType[] {
        return this.getAttr<PersonAttrRoleInterestType>(
            a,
            Object.keys(PersonRoleInterestMap) as PersonAttrRoleInterestType[]
        );
    }

    getAttrBikeList(a: PersonAttributeSheetModel): PersonAttrBikeType[] {
        return this.getAttr<PersonAttrBikeType>(
            a,
            Object.keys(PersonBikeMap) as PersonAttrBikeType[]
        );
    }

    getAttrSkillList(a: PersonAttributeSheetModel): PersonAttrSkillType[] {
        return this.getAttr<PersonAttrSkillType>(
            a,
            Object.keys(PersonSkillMap) as PersonAttrSkillType[]
        );
    }

    getAttrAdminRoleInterestList(
        a: PersonAttributeSheetModel
    ): PersonAttrAdminRoleInterestType[] {
        return this.getAttr<PersonAttrAdminRoleInterestType>(
            a,
            Object.keys(PersonSkillMap) as PersonAttrAdminRoleInterestType[]
        );
    }

    getAttr<U extends PersonAttrType>(
        a: PersonAttributeSheetModel,
        k: U[]
    ): U[] {
        return Object.keys(a).filter(
            (b) => k.includes(b as U) && a[b as U] === 'yes'
        ) as U[];
    }

    async getAttributeListByDiscordIdOrEmail(discordIdOrEmail: string) {
        const person = await this.getPersonByEmailOrDiscordId(discordIdOrEmail);
        if (!person) {
            throw new Error(
                `getAttributeListByDiscordIdOrEmail: ${discordIdOrEmail} not found`
            );
        }
        return await this.personAttributeSheetService
            .getAllRowsAsMaps()
            .then(this.createAttributeMap);
    }

    static createPersonModel({
        status = 'active',
        name = '',
        email = '',
        phone = '',
        location = '',
        bio = '',
        pronouns = '',
        reference = '',
        discordId = '',
        stampCrabappbleLastContacted = ''
    }: Partial<PersonSheetModel> = {}): PersonSheetModel {
        return {
            status,
            name,
            email,
            phone,
            location,
            bio,
            pronouns,
            reference,
            discordId,
            stampCrabappbleLastContacted
            // ...this.createPersonModelAttributes(
            //     attributeList as PersonAttributeSheetModel
            // )
        };
    }

    async getFreshDiscordAndEmailByDiscordIdOrEmail(
        discordIdOrEmailList: string[]
    ): Promise<Array<[string, string] | null>> {
        await this.refreshPersonListCache();
        const personList = await this.waitingForPersonListCache;
        return discordIdOrEmailList
            .map((a) =>
                personList.find((b) => b.email === a || b.discordId === a)
            )
            .map((a) => (a ? [a?.discordId || '', a?.email || ''] : null));
    }

    async createFirstDiscordPerson({
        name,
        discordId
    }: {
        name: string;
        discordId: string;
    }) {
        const person = this.createPersonModel({ name, discordId });
        await this.refreshPersonListCache();

        const personIdList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                discordId
            });

        if (personIdList.length > 1) {
            console.error(
                'We should only have one person record per discordID. Updating all.'
            );
            for (const id of personIdList) {
                await this.personSheetService.updateRowWithMapByRowNumber(
                    id,
                    person
                );
            }
        }

        if (!personIdList.length) {
            await this.personSheetService.createRowWithMap(person);
        }
        this.refreshPersonListCache();
        return true;
    }

    async createOrUpdatePersonByDiscordId(person: PersonSheetModel) {
        const { discordId } = person;
        await this.refreshPersonListCache();

        const personIdList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                discordId
            });

        if (personIdList.length > 1) {
            console.error(
                'We should only have one person record per discordID. Updating all.'
            );
        }
        if (!personIdList.length) {
            await this.personSheetService.createRowWithMap(person);
        }
        for (const id of personIdList) {
            await this.personSheetService.updateRowWithMapByRowNumber(
                id,
                person
            );
        }
        await this.refreshPersonListCache();
    }

    async updatePersonByDiscordId(person: PersonSheetModel) {
        const { discordId } = person;
        await this.refreshPersonListCache();

        const personIdList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                discordId
            });
        if (!personIdList.length) {
            throw new Error(
                'We should only have one person record per discordID. Updating all.'
            );
        }
        if (personIdList.length > 1) {
            console.error(
                'We should only have one person record per discordID. Updating all.'
            );
        }
        for (const id of personIdList) {
            await this.personSheetService.updateRowWithMapByRowNumber(
                id,
                person
            );
        }
        this.refreshPersonListCache();
        return true;
    }

    async updatePersonByEmail(
        person: Pick<PersonSheetModel, 'email'> & Partial<PersonSheetModel>
    ) {
        const { email } = person;
        await this.refreshPersonListCache();

        const personIdList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                email
            });
        if (!personIdList.length) {
            throw new Error(
                'We should only have one person record per discordID. Updating all.'
            );
        }
        if (personIdList.length > 1) {
            console.error(
                'We should only have one person record per discordID. Updating all.'
            );
        }
        for (const id of personIdList) {
            await this.personSheetService.updateRowWithMapByRowNumber(
                id,
                this.createPersonModel(person)
            );
        }
        this.refreshPersonListCache();
        return true;
    }

    async getPersonList(): Promise<PersonSheetModel[]> {
        return await this.personSheetService.getAllRowsAsMaps();
    }

    async refreshPersonListCache() {
        return await (this.waitingForPersonListCache = this.getPersonList());
    }

    async getPersonListCache(): Promise<PersonSheetModel[]> {
        return await this.waitingForPersonListCache;
    }

    // if any of the propties of the query match the person
    async getPersonListByMatchAnyProperties(
        query: Partial<PersonSheetModel>,
        opt?: { refreshCache?: boolean }
    ): Promise<PersonSheetModel[]> {
        if (opt?.refreshCache) {
            this.refreshPersonListCache();
        }
        // if we can find them on the cache ...
        const list = (await this.waitingForPersonListCache).filter((map) => {
            return Object.keys(map).some(
                // note that we turn everything into strings
                (k) =>
                    query[k] &&
                    '' + (query[k] as string) === '' + (map[k] as string)
            );
        });

        return list;
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

    async getPersonByDiscordId(
        discordId: string,
        opt?: PersonSheetOpt
    ): Promise<PersonSheetModel | undefined> {
        const a = await this.getPersonListByMatchAnyProperties(
            {
                discordId
            },
            opt
        );
        if (a.length > 1) {
            console.error(`We found multiple persons with that discordId!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0];
    }

    async getPersonByEmail(
        email: string,
        opt?: PersonSheetOpt
    ): Promise<PersonSheetModel | null> {
        const a = await this.getPersonListByMatchAnyProperties(
            {
                email
            },
            opt
        );
        if (a.length > 1) {
            console.error(`We found multiple persons with that email!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0] || null;
    }

    async getPersonByPhone(phone: string): Promise<PersonSheetModel | null> {
        const a = await this.getPersonListByMatchAnyProperties({
            phone
        });
        if (a.length > 1) {
            console.error(`We found multiple persons with that email!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0] || null;
    }

    async getPersonByEmailOrDiscordId(
        emailOrDiscordId?: string,
        opt?: PersonSheetOpt
    ): Promise<PersonSheetModel | undefined> {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id
        if (!emailOrDiscordId?.trim()) {
            return;
        }
        return emailOrDiscordId.split('@').length !== 2
            ? await this.getPersonByDiscordId(emailOrDiscordId, opt)
            : (await this.getPersonByEmail(emailOrDiscordId, opt)) ??
                  (await this.getPersonByDiscordId(emailOrDiscordId, opt));
    }

    async setStampLastContact(discordId: string) {
        // todo: move this to a more generic get person index by email or id
        const indexList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                discordId
            });

        if (!indexList.length) {
            dbg(`setActiveState could not activate person`);
            return false;
            // throw new Error('No person with that email!');
        }
        if (indexList.length > 1) {
            dbg(`We found multiple persons with that email!`);
            return false;
            // throw new Error('We found multiple persons with that email!');
        }

        await this.personSheetService.updateRowByRowNumber(indexList[0], [
            new Date().toISOString()
        ]);

        await this.setActiveStateByDiscordId(discordId, 'active');

        return true;
    }

    async setActiveStateByDiscordId(
        discordId: string,
        status: NmStatusType
    ): Promise<boolean> {
        // todo: move this to a more generic get person index by email or id
        const indexList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
                discordId
            });

        if (!indexList.length) {
            dbg(`setActiveState could not activate person`);
            return false;
            // throw new Error('No person with that email!');
        }
        if (indexList.length > 1) {
            dbg(`We found multiple persons with that email!`);
            return false;
            // throw new Error('We found multiple persons with that email!');
        }

        await this.personSheetService.updateRowByRowNumber(indexList[0], [
            status
        ]);
        this.refreshPersonListCache();
        return true;
    }

    // methods return markdown person info
    // getPermissionListMd(person: PersonSheetModel) {
    //     return (
    //         this.getAttrPermissionList(this.toAttrSheetData(person))
    //             .map((a) => `  - ${PERMISSION_MAP[a].name}`)
    //             .join('\n') || '  - NO PERMISSIONS GRANTED'
    //     );
    // }
}
