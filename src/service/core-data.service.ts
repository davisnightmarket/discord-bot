import { EnvConfig } from '../config';
import { ConfigModel, type EnvType } from '../model';
import {
    GoogleSheetService,
    SpreadsheetDataModel,
    GoogleDriveService
} from '.';

const Env = process.env.NODE_ENV as EnvType;

if (!Env || !Object.keys(EnvConfig).includes(Env)) {
    throw new Error('Must set an environment');
}

interface ConfigDataModel extends SpreadsheetDataModel {
    marketId: string;
    code: keyof ConfigModel;
    value: string;
}

interface TypeDataModel extends SpreadsheetDataModel {}

export class CoreDataService {
    configSheetService: GoogleSheetService<ConfigDataModel>;
    configMarketSheetService: GoogleSheetService<ConfigDataModel>;
    coreTypeSheetService: GoogleSheetService<TypeDataModel>;

    // todo: this is a stub
    driveConfigService: GoogleDriveService<'Config'>;
    // todo: we can replace the many records pointing to docs in config with a call to the drive service to get the folder

    // the constructor gets the core id which points to the core google spreadsheet by default
    // you can pass in a different id for testing purposes, but this should work in test and prod
    constructor(spreadsheetId: string = EnvConfig[Env].GSPREAD_CORE_ID) {
        this.driveConfigService = new GoogleDriveService(
            EnvConfig[Env].GSPREAD_CORE_ID
        );

        this.configSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'config'
        });

        this.configMarketSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'config-market'
        });

        this.coreTypeSheetService = new GoogleSheetService({
            spreadsheetId,
            // todo: we should store sheet names in const
            // todo: OR we should store them in a spreadsheet
            sheetName: 'type'
        });
    }

    async getConfigByGuildId(guildId: string): Promise<ConfigModel> {
        // get the market id
        const configRows =
            await this.configMarketSheetService.getAllRowsAsMaps();
        const marketId = configRows.find(
            (a) => a.code === 'DISCORD_GUILD_ID'
        )?.marketId;
        if (!marketId) {
            throw new Error(`No config found for guild ${guildId}!`);
        }
        const configRow = (
            await this.configMarketSheetService.getAllRowsAsMaps()
        ).filter((row) => row.marketId === marketId);

        // build the config

        const config = { ...EnvConfig[Env] };
        for (const row of configRow) {
            config[row.code] = row.value;
        }

        // return
        return new ConfigModel(config);
    }
    async getAllGuildIds(): Promise<string[]> {
        // get the market id
        const configRows =
            await this.configMarketSheetService.getAllRowsAsMaps();
        return configRows
            .filter((a) => a.code === 'DISCORD_GUILD_ID')
            .map((a) => a.value);
    }
}
