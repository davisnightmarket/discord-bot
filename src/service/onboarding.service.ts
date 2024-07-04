import type {
    GoogleDriveService,
    PersonRdbService,
    PersonSheetModel,
    PersonSheetService
} from '.';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { EntityModel, NMConfigInstanceModel } from '../model';
import { GetDebug } from '../utility';

const dbg = GetDebug('OnboardingService');

export class OnboardingService {
    defaultConstitutionMd: string = readFileSync(
        join(__dirname, '../..', 'md', 'nm-constitution.md'),
        'utf-8'
    );

    waitingForConstitutionMd: Promise<string>;

    constructor(
        private readonly config: NMConfigInstanceModel,
        private readonly personRdbService: PersonRdbService,
        private readonly personSheetService: PersonSheetService,
        private readonly googleDriveService: GoogleDriveService
    ) {
        this.waitingForConstitutionMd =
            this.googleDriveService.getNmConstitutionMarkdownFile();
    }

    async setStampLastContacted(discordId: string) {
        return await this.personSheetService.setStampLastContact(discordId);
    }

    async updateSheetPersonByEmail(
        person: Pick<PersonSheetModel, 'discordId' | 'email'>
    ) {
        return await this.personSheetService.updatePersonByEmail(person);
    }

    async findPersonsByEmailList(emailList: string[]) {
        return await this.getSheetPersonByEmailList(emailList);
    }

    async createFirstSheetPerson(discordId: string, name: string) {
        return await this.personSheetService.createFirstDiscordPerson({
            discordId,
            name
        });
    }

    async createOrUpdateRdbPersonByDiscordId(
        discordId: string,
        name: string
    ): Promise<[EntityModel<'type_person'>, string[]]> {
        const person =
            (await this.personRdbService.getPersonEntityByDiscordId(
                discordId
            )) ??
            (await this.personRdbService.createDiscordPersonEntity({
                discordId,
                name
            }));
        const emailList = await this.personRdbService.getPersonEmailList(
            person.id
        );
        return [person, emailList];
    }

    async activatePersonByDiscordId(discordId: string) {
        try {
            await this.personSheetService.setActiveStateByDiscordId(
                discordId,
                'active'
            );
            return true;
        } catch (e: any) {
            dbg(e.message);
            return false;
        }
    }

    // this function specifically looks for a persons in the sheet data with a matching email
    async getSheetPersonByEmailList(emailList: string[]) {
        return (
            await Promise.all(
                emailList.map(
                    async (a) =>
                        await this.personSheetService.getPersonByEmail(a)
                )
            )
        ).filter((a) => a);
    }

    async getStampLastContactedAndIsOnboardedByDiscordId(
        discordId: string
    ): Promise<[Date | null, boolean]> {
        const spreadPerson = await this.personSheetService.getPersonByDiscordId(
            discordId
        );
        return [
            spreadPerson
                ? new Date(spreadPerson?.stampCrabappbleLastContacted)
                : null,
            !!spreadPerson?.isOnboarded
        ];
    }

    async getPersonFromSpreadOrRdbByDiscordId(discordId: string) {
        const spreadPerson = await this.personSheetService.getPersonByDiscordId(
            discordId
        );
        let rdbPerson;
        if (!spreadPerson) {
            try {
                rdbPerson = await this.personRdbService.getByDiscordId(
                    discordId
                );
            } catch (e) {
                dbg(`No person found with discord ID ${discordId}`);
            }
        }
        return spreadPerson
            ? this.personRdbService.fromPersonSheetData(spreadPerson)
            : rdbPerson;
    }

    // async personExistsWithEmail(email: string) {
    //     return !!(
    //         (await this.personSheetService.getPersonByEmail(email)) ??
    //         (await this.personRdbService.getByEmail(email))
    //     );
    // }

    // async personExistsWithPhone(phone: string) {
    //     return !!(
    //         (await this.personRdbService.getByPhone(phone)) ||
    //         (await this.personSheetService.getPersonByPhone(phone))
    //     );
    // }

    async getConstitutionMd() {
        return (
            (await this.waitingForConstitutionMd) || this.defaultConstitutionMd
        );
    }

    async getConstitutionMdIntoOnboardingParts() {
        const a = await this.getConstitutionMd();
        return a
            .split('\n##')
            .map((a) => {
                const b = a.split('\n').filter((a) => a.trim());
                const header = '### ' + a[0].replace('##', '') + ' ###';
                return header + '\n' + b[1];
            })
            .join('\n\n');
    }
}
