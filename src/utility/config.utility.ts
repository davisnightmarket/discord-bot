import { EnvConfig } from '../config';
import { ConfigModel, type EnvType } from '../model';
import { type SpreadsheetDataModel, GoogleSheetService } from '../service';

const Env = process.env.NODE_ENV as EnvType;

if (!Env || !Object.keys(EnvConfig).includes(Env)) {
    throw new Error('Must set an environment');
}

interface ConfigItem extends SpreadsheetDataModel {
    marketId: string;
    code: keyof ConfigModel;
    value: string;
}

const coreConfigSheetService = new GoogleSheetService<ConfigItem>({
    spreadsheetId: EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
    sheetName: 'config-instance'
});

export async function GetConfigByGuildId(
    guildId: string
): Promise<ConfigModel> {
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
export async function GetAllGuildIds(): Promise<string[]> {
    // get the market id
    const configRows = await coreConfigSheetService.getAllRowsAsMaps();
    return configRows
        .filter((a) => a.code === 'DISCORD_GUILD_ID')
        .map((a) => a.value);
}
