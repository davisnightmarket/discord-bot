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

// Attr Value Maps
type PersonAttrAvailabilitySheetModel = {
    [k in PersonAttrAvailabilityType]: 'yes' | 'no';
};

type PersonAttrPermissionSheetModel = {
    [k in PersonAttrPermissionType]: 'yes' | 'no';
};

type PersonAttrTeamInterestSheetModel = {
    [k in PersonAttrTeamInterestType]: 'yes' | 'no';
};

type PersonAttrBikeSheetModel = {
    [k in PersonAttrBikeType]: 'yes' | 'no';
};

type PersonAttrSkillSheetModel = {
    [k in PersonAttrSkillType]: 'yes' | 'no';
};

type PersonAttrRoleInterestSheetModel = {
    [k in PersonAttrRoleInterestType]: 'yes' | 'no';
};

type PersonAttrAdminRoleInterestSheetModel = {
    [k in PersonAttrAdminRoleInterestType]: 'yes' | 'no';
};

export type PersonSheetAttributeModel = PersonAttrAvailabilitySheetModel &
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
    interest: string;
    reference: string;
    discordId: string;
}

const headersList: Array<
    keyof PersonSheetModel | keyof PersonSheetAttributeModel
> = [
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

export type PersonWithIdModel = PersonSheetModel & { discordIdOrEmail: string };

export class PersonSheetService {
    personSheetService: GoogleSheetService<PersonSheetModel>;
    waitingForPersonListCache: Promise<PersonSheetModel[]>;
    constructor(spreadsheetId: string) {
        this.personSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person`,
            headersList: this.getHeaders()
        });
        this.waitingForPersonListCache = this.getPersonList().then((a) =>
            a.map(this.createPerson)
        );
        // reset the cache ever 2 hour
        setInterval(() => {
            this.refreshPersonListCache();
        }, 1000 * 60 * 60 * 2);
    }

    getHeaders() {
        return headersList as string[];
    }

    static createPersonWithQueryId(
        discordIdOrEmail: string = '',
        person: Partial<PersonSheetModel>
    ): PersonWithIdModel {
        return {
            ...PersonSheetService.createPerson(person),
            discordIdOrEmail
        };
    }

    createPerson(person: Partial<PersonSheetModel> = {}): PersonSheetModel {
        return PersonSheetService.createPerson(person);
    }

    toAttrSheetData(person: PersonSheetModel): PersonSheetAttributeModel {
        return PersonSheetService.createAttributeMap(
            person as unknown as PersonSheetAttributeModel
        );
    }

    static createAttributeMap(
        personAttributeMap: PersonSheetAttributeModel
    ): PersonSheetAttributeModel {
        for (const k of Object.keys(personAttributeMap)) {
            if (!AttributeKeyList.includes(k)) {
                continue;
            }
            const a = (
                personAttributeMap[k as keyof PersonSheetAttributeModel] || ''
            )
                .trim()
                .toLowerCase();
            if (!a || a === 'no' || a === 'n') {
                personAttributeMap[k as keyof PersonSheetAttributeModel] = 'no';
            } else {
                personAttributeMap[k as keyof PersonSheetAttributeModel] =
                    'yes';
            }
        }
        return {
            ...personAttributeMap
        };
    }

    getAttrPermissionList(
        a: PersonSheetAttributeModel
    ): PersonAttrPermissionType[] {
        return this.getAttr<PersonAttrPermissionType>(
            a,
            Object.keys(PersonPermissionMap) as PersonAttrPermissionType[]
        );
    }

    getAttrAvailabilityHostList(
        a: PersonSheetAttributeModel
    ): PersonAttrAvailabilityType[] {
        return this.getAttr<PersonAttrAvailabilityType>(
            a,
            Object.keys(
                PersonAvailabilityHostMap
            ) as PersonAttrAvailabilityType[]
        );
    }

    getAttrAvailabilityPickupList(
        a: PersonSheetAttributeModel
    ): PersonAttrAvailabilityType[] {
        return this.getAttr<PersonAttrAvailabilityType>(
            a,
            Object.keys(
                PersonAvailabilityPickupMap
            ) as PersonAttrAvailabilityType[]
        );
    }

    getAttrRoleInterestList(
        a: PersonSheetAttributeModel
    ): PersonAttrRoleInterestType[] {
        return this.getAttr<PersonAttrRoleInterestType>(
            a,
            Object.keys(PersonRoleInterestMap) as PersonAttrRoleInterestType[]
        );
    }

    getAttrBikeList(a: PersonSheetAttributeModel): PersonAttrBikeType[] {
        return this.getAttr<PersonAttrBikeType>(
            a,
            Object.keys(PersonBikeMap) as PersonAttrBikeType[]
        );
    }

    getAttrSkillList(a: PersonSheetAttributeModel): PersonAttrSkillType[] {
        return this.getAttr<PersonAttrSkillType>(
            a,
            Object.keys(PersonSkillMap) as PersonAttrSkillType[]
        );
    }

    getAttrAdminRoleInterestList(
        a: PersonSheetAttributeModel
    ): PersonAttrAdminRoleInterestType[] {
        return this.getAttr<PersonAttrAdminRoleInterestType>(
            a,
            Object.keys(PersonSkillMap) as PersonAttrAdminRoleInterestType[]
        );
    }

    getAttr<U extends PersonAttrType>(
        a: PersonSheetAttributeModel,
        k: U[]
    ): U[] {
        return Object.keys(a).filter(
            (b) => k.includes(b as U) && a[b as U] === 'yes'
        ) as U[];
    }

    static createPerson(
        person: Partial<PersonSheetModel> = {}
    ): PersonSheetModel {
        const {
            status = '',
            name = '',
            email = '',
            phone = '',
            location = '',
            bio = '',
            pronouns = '',
            interest = '',
            reference = '',
            discordId = ''
        } = person;
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

            ...this.createAttributeMap(person as PersonSheetAttributeModel)
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
        await this.refreshPersonListCache();
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
    async getPersonListByMatchAnyProperties(query: Partial<PersonSheetModel>) {
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
        discordId: string
    ): Promise<PersonSheetModel | undefined> {
        const a = await this.getPersonListByMatchAnyProperties({
            discordId
        });
        if (a.length > 1) {
            console.error(`We found multiple persons with that discordId!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0];
    }

    async getPersonByEmail(email: string): Promise<PersonSheetModel | null> {
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
        emailOrDiscordId?: string
    ): Promise<PersonSheetModel | undefined> {
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

    async setActiveState(email: string, status: NmStatusType) {
        // todo: move this to a more generic get person index by email or id
        const indexList =
            await this.personSheetService.getRowNumberListByMatchAnyProperties({
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
    getPermissionListMd(person: PersonSheetModel) {
        return (
            this.getAttrPermissionList(this.toAttrSheetData(person))
                .map((a) => `  - ${PERMISSION_MAP[a].name}`)
                .join('\n') || '  - NO PERMISSIONS GRANTED'
        );
    }
}
