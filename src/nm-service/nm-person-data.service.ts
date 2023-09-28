import { type ActiveStateType } from '../model';
import { Sheet } from '../service';

export interface PersonModel {
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
    personSheetService: Sheet<PersonModel>;

    constructor(personSpreadsheetId: string) {
        this.personSheetService = new Sheet({
            sheetId: personSpreadsheetId,
            range: `person!A:N`
        });
    }

    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.get();
    }

    async getPerson(query: Partial<PersonModel>) {
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

    async getPersonByEmailOrDiscord(emailOrDiscordId: string) {
        // ok, so we find out if there is an @, and if not we assume it is a discord id
        // otherwise we assume it is an email, and if that fails, then we assume it is a discord id
        return emailOrDiscordId.split('@').length !== 2
            ? await this.personSheetService.search({
                  discordId: emailOrDiscordId
              })
            : (await this.personSheetService.search({
                  email: emailOrDiscordId
              })) ??
                  (await this.personSheetService.search({
                      discordId: emailOrDiscordId
                  }));
    }

    async setActiveState(email: string, status: ActiveStateType) {
        await this.personSheetService.update({ email }, { status });
    }

    async updateCache() {
        await this.personSheetService.updateCache();
    }
}
