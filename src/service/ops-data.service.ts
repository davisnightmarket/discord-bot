import { NmRoleType, NmDayNameType, GuildServiceModel } from '../model';
import { GetChannelDayToday } from '../utility';
import { GoogleSheetService, NmPersonDataService } from './';
import { type PersonModel } from './';

export type OpsModel = {
    day: NmDayNameType;
    role: NmRoleType;
    time: string;
    org: string;
    volunteer1: string;
    volunteer2: string;
    volunteer3: string;
    comments: string;
    contact: string;
};

export type OpsWithPersonListModel = OpsModel & {
    personList: PersonModel[];
};

type OpsByDayWithPersonListModel = {
    [k in NmDayNameType]: OpsWithPersonListModel[];
};

export class NmOpsDataService {
    private readonly opsSheetService: GoogleSheetService<OpsModel>;
    personCoreDataService: NmPersonDataService;

    opsWithPersonCache: Partial<OpsByDayWithPersonListModel> = {};

    constructor(
        spreadsheetId: string,
        personCoreDataService: NmPersonDataService
    ) {
        this.opsSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'ops'
        });
        this.personCoreDataService = personCoreDataService;

        this.refreshCache();
    }

    async getOpsByDay(
        // defaults to today
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<OpsModel[]> {
        const p = await this.opsSheetService.getAllRowsAsMaps();
        return p.filter((pickup) => pickup.day === day);
    }

    async getOpsWithPersonListByDay(
        day: NmDayNameType = GetChannelDayToday()
    ): Promise<OpsWithPersonListModel[]> {
        if (!this.opsWithPersonCache[day]) {
            await this.refreshCache();
        }
        if (!this.opsWithPersonCache[day]) {
            // todo:logger
            console.log('We are missing ops for day ' + day);
        }
        return this.opsWithPersonCache[day] || [];
    }

    async refreshCache() {
        const a = (await this.getOpsByDay())
            .filter((a) => a.role === 'night-pickup')
            .reduce((a, b) => {
                if (!a[b.day as NmDayNameType]) {
                    a[b.day as NmDayNameType] = [];
                }

                a[b.day as NmDayNameType].push({
                    ...b,
                    personList: [] as PersonModel[]
                });

                return a;
            }, {} as OpsByDayWithPersonListModel);

        for (const b of Object.values(a)) {
            for (const c in b) {
                b[c].personList = [
                    // todo: lets make these individual rows in the sheet
                    await this.personCoreDataService.getPersonByEmailOrDiscordId(
                        b[c].volunteer1
                    ),
                    await this.personCoreDataService.getPersonByEmailOrDiscordId(
                        b[c].volunteer1
                    ),
                    await this.personCoreDataService.getPersonByEmailOrDiscordId(
                        b[c].volunteer1
                    )
                ].filter((a) => a) as PersonModel[];
            }
        }
    }
}
