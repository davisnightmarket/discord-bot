import { PERMISSION_MAP, type PermissionType } from '../const';
import { type NmActiveStateType } from '../model';
import {
    GoogleSheetService,
    type PgService,
    type SpreadsheetDataModel
} from '../service';

export interface PersonModel extends SpreadsheetDataModel {
    status: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    bike: string;
    bikeCart: string;
    bikeCartAtNight: string;
    skills: string;
    bio: string;
    pronouns: string;
    interest: string;
    reference: string;
    discordId: string;
    availabilityHostList: string;
    availabilityPickupList: string;
    teamInterestList: string;
    permissionList: string;
    stampCreate: string;
}

export type PersonWithIdModel = PersonModel & { discordIdOrEmail: string };

export class PersonDataService {
    personSheetService: GoogleSheetService<PersonModel>;
    waitingForPersonListCache: Promise<PersonModel[]>;
    constructor(spreadsheetId: string, private readonly pgService: PgService) {
        console.log(this.pgService.query('select 1 from dual'));

        this.personSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person`
        });
        this.waitingForPersonListCache = this.getPersonList().then((a) =>
            a.map(this.createPerson)
        );
        // reset the cache ever 2 hour
        setInterval(() => {
            this.refreshPersonListCache();
        }, 1000 * 60 * 60 * 2);
    }

    static createPersonWithQueryId(
        discordIdOrEmail: string = '',
        person: Partial<PersonModel>
    ): PersonWithIdModel {
        return {
            ...PersonDataService.createPerson(person),
            discordIdOrEmail
        };
    }

    createPerson(person: Partial<PersonModel> = {}): PersonModel {
        return PersonDataService.createPerson(person);
    }

    static createPerson({
        status = '',
        name = '',
        email = '',
        phone = '',
        location = '',
        bike = '',
        bikeCart = '',
        bikeCartAtNight = '',
        skills = '',
        bio = '',
        pronouns = '',
        interest = '',
        reference = '',
        discordId = '',
        availabilityHostList = '',
        availabilityPickupList = '',
        teamInterestList = '',
        permissionList = '',
        stampCreate = ''
    }: Partial<PersonModel> = {}): PersonModel {
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
            availabilityHostList,
            availabilityPickupList,
            teamInterestList,
            permissionList,
            stampCreate
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

    async createOrUpdatePersonByDiscordId(person: PersonModel) {
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

    async updatePersonByDiscordId(person: PersonModel) {
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

    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.getAllRowsAsMaps();
    }

    async refreshPersonListCache() {
        return await (this.waitingForPersonListCache = this.getPersonList());
    }

    async getPersonListCache(): Promise<PersonModel[]> {
        return await this.waitingForPersonListCache;
    }

    // if any of the propties of the query match the person
    async getPersonListByMatchAnyProperties(query: Partial<PersonModel>) {
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

    async getPersonByDiscordId(
        discordId: string
    ): Promise<PersonModel | undefined> {
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

    async getPersonByEmail(email: string): Promise<PersonModel | null> {
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

    async getPersonByEmailOrDiscordId(
        emailOrDiscordId?: string
    ): Promise<PersonModel | undefined> {
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

    async setActiveState(email: string, status: NmActiveStateType) {
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
    getPermissionListMd(person: PersonModel) {
        return (
            person?.permissionList
                ?.split(',')
                .filter((a) => a)
                .map((a) => `  - ${PERMISSION_MAP[a as PermissionType].name}`)
                .join('\n') || '  - NO PERMISSIONS GRANTED'
        );
    }
}
