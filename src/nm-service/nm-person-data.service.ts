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
            range: `person!A:N`,
        });
    }

    async getPersonList(): Promise<PersonModel[]> {
        return await this.personSheetService.get();
    }

    async getPerson(query: Partial<PersonModel>) {
        return await this.personSheetService.search(query);
    }

    async setActiveState(email: string, status: ActiveStateType) {
        this.personSheetService.update({ email }, { status })
    }
}
