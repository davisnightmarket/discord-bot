import { GoogleSheetService } from '.';
import { EnvConfig } from '../config';
import { type GuildServiceModel, ConfigModel, type EnvType } from '../model';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmOpsDataService,
    SpreadsheetDataModel
} from '../service';

const Env = process.env.NODE_ENV as EnvType;

if (!Env || !Object.keys(EnvConfig).includes(Env)) {
    throw new Error('');
}

interface ConfigItem extends SpreadsheetDataModel {
    marketId: string;
    code: keyof ConfigModel;
    value: string;
}

export class ConfigService {
    googleSheetService: GoogleSheetService<ConfigItem>;
    services = new Map<string, GuildServiceModel>();

    constructor() {
        this.googleSheetService = new GoogleSheetService<ConfigItem>({
            spreadsheetId: EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
            sheetName: 'config-instance'
        });
    }

    async getConfigForGuildId(guildId: string) {
        // get the market id
        const configRow = (
            await this.googleSheetService.getAllRowsAsMaps()
        ).filter(
            (row) => row.code === 'DISCORD_GUILD_ID' && row.value === guildId
        );
        if (!guildId) {
            throw new Error(`No config found for guild ${guildId}!`);
        }

        // build the config

        const config = { ...EnvConfig[Env] };
        for (const row of configRow) {
            config[row.code] = row.value;
        }

        // return
        return new ConfigModel(config);
    }

    async getServicesForGuildId(guildId: string) {
        if (!this.services.has(guildId)) {
            const config = await this.getConfigForGuildId(guildId);

            const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);

            this.services.set(guildId, {
                opsDataService: new NmOpsDataService(config.GSPREAD_OPS_ID),
                foodCountDataService: new NmFoodCountDataService(
                    config.GSPREAD_FOODCOUNT_ID
                ),
                foodCountInputService: new NmFoodCountInputService(
                    orgCoreService
                ),
                personCoreService: new NmPersonDataService(
                    config.GSPREAD_CORE_PERSON_ID
                ),
                orgCoreService
            });
        }

        // this can't be null since we just set it if it was
        return this.services.get(guildId) as GuildServiceModel;
    }
}
