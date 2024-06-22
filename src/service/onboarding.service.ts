import type {
    GoogleDriveService,
    PersonRdbService,
    PersonSheetService
} from '.';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { NMConfigInstanceModel } from '../model';
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

    async personExistsWithDiscordId(discordId: string) {
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
        return !!(spreadPerson ?? rdbPerson);
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
