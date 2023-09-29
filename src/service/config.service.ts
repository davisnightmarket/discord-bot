import { GoogleSheetService } from '.';
import { EnvConfig } from '../config';
import { type GuildServiceModel, ConfigModel, type EnvType } from '../model';
import { SpreadsheetDataModel } from '../service';

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
}
