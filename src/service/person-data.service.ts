import { type NmActiveStateType } from '../model';
import { GoogleSheetService, type SpreadsheetDataModel } from '../service';

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
}

export type PersonWithIdModel = PersonModel & { discordIdOrEmail: string };

export class PersonDataService {
    personSheetService: GoogleSheetService<PersonModel>;

    waitingForPersonListCache: Promise<PersonModel[]>;
    constructor(spreadsheetId: string) {
        this.personSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person`
        });
        this.waitingForPersonListCache = this.getPersonList();
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
        discordId = ''
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
            discordId
        };
    }
    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.getAllRowsAsMaps();
    }

    refreshPersonListCache() {
        this.waitingForPersonListCache = this.getPersonList();
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
                (k) => query[k] && '' + query[k] === '' + map[k]
            );
        });

        // otherwise get direct from data
        return list.length
            ? list
            : (await this.getPersonList()).filter((map) => {
                  return Object.keys(map).some(
                      (k) => query[k] && '' + query[k] === '' + map[k]
                  );
              });
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
        emailOrDiscordId: string
    ): Promise<PersonModel | undefined> {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id

        return emailOrDiscordId.split('@').length !== 2
            ? await this.getPersonByDiscordId(emailOrDiscordId)
            : (await this.getPersonByEmail(emailOrDiscordId)) ??
                  (await this.getPersonByDiscordId(emailOrDiscordId));
    }

    async setActiveState(email: string, status: NmActiveStateType) {
        // todo: move this to a more generic get person index by email or id
        const indexList =
            await this.personSheetService.getIndexListByMatchAnyProperties({
                email
            });

        if (!indexList.length) {
            throw new Error('No person with that email!');
        }
        if (indexList.length > 1) {
            throw new Error('We found multiple persons with that email!');
        }

        await this.personSheetService.updateRowByIndex(indexList[0], status);
        this.refreshPersonListCache();
    }
}
