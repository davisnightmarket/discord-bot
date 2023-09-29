import { GoogleSheetService } from '../service';
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
const servicesByGuildId = new Map<
    string,
    GuildServiceModel & {
        // also return the config so we can test it
        config: ConfigModel;
    }
>();
const coreConfigSheetService = new GoogleSheetService<ConfigItem>({
    spreadsheetId: EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
    sheetName: 'config-instance'
});

async function getConfigByGuildId(guildId: string) {
    // get the market id
    const configRows = await coreConfigSheetService.getAllRowsAsMaps();
    const marketId = configRows.find(
        (a) => a.code === 'DISCORD_GUILD_ID'
    )?.marketId;
    if (!marketId) {
        throw new Error(`No config found for guild ${guildId}!`);
    }
    const configRow = (await coreConfigSheetService.getAllRowsAsMaps()).filter(
        (row) => row.marketId === marketId
    );

    // build the config

    const config = { ...EnvConfig[Env] };
    for (const row of configRow) {
        config[row.code] = row.value;
    }

    // return
    return new ConfigModel(config);
}

// because we need to build a set of services that are connected to data per guild
// as well as services that are "core", meaning the same data source for all guilds
export async function GetGuildServices(guildId: string) {
    if (!servicesByGuildId.has(guildId)) {
        const config = await getConfigByGuildId(guildId);

        const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);
        const personCoreService = new NmPersonDataService(
            config.GSPREAD_CORE_PERSON_ID
        );
        servicesByGuildId.set(guildId, {
            config,
            opsDataService: new NmOpsDataService(
                config.GSPREAD_OPS_ID,
                personCoreService
            ),
            foodCountDataService: new NmFoodCountDataService(
                config.GSPREAD_FOODCOUNT_ID
            ),
            foodCountInputService: new NmFoodCountInputService(orgCoreService),
            personCoreService,
            orgCoreService
        });
    }

    // this can't be null since we just set it if it was
    return servicesByGuildId.get(guildId) as GuildServiceModel;
}
