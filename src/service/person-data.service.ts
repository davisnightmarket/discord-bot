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

export class NmPersonDataService {
    personSheetService: GoogleSheetService<PersonModel>;

    constructor(spreadsheetId: string) {
        this.personSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: `person`
        });
    }

    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.getAllRowsAsMaps();
    }

    // if any of the propties of the query match the person
    async getPersonListByMatchAnyProperties(query: Partial<PersonModel>) {
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

    async getPersonByEmailOrDiscordId(
        emailOrDiscordId: string
    ): Promise<PersonModel | null> {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id

        const a =
            emailOrDiscordId.split('@').length !== 2
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
            console.error(`We found multiple persons with that identifier!
            ${a.map((a) => `${a.name} ${a.email}`).join(', ')}
            `);
        }
        return a[0] || null;
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
    }
}
