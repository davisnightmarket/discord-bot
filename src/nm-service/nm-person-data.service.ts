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
            range: `person!A:N`,
            cacheTime: 1000 * 60 * 60, // one hour until cache refresh
        });
    }

    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.get();
    }

    async getPersonByName(name: string) {
        const people = await this.getPersonList();
        return people.find((person) => person.name === name);
    }

    async getPersonByDiscorId(id: string): Promise<PersonModel | undefined> {
        const people = await this.getPersonList();
        return people.find((person) => person.discordId === id);
    }

    async getEmailByDiscordId(id: string): Promise<string | undefined> {
        return await this.getPersonByDiscorId(id).then(person => person?.email);
    }
}
