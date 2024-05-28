import {
    type NMConfigModel,
    type EnvType,
    NMConfigInstanceModel
} from '../model';
import {
    GoogleSheetService,
    type SpreadsheetDataModel,
    GoogleDriveService
} from '.';

const Env = process.env.NODE_ENV as EnvType;

interface TypeDataModel extends SpreadsheetDataModel {}

export class CoreDataService {
    marketConfig: NMConfigModel;
    configSheetService: GoogleSheetService<NMConfigInstanceModel>;
    coreTypeSheetService: GoogleSheetService<TypeDataModel>;

    // todo: this is a stub: this is prep for using a single folder for spreadsheets by name ...
    // todo: and one for markdown by name
    driveCoreDataService: GoogleDriveService<'Config'>;
    // todo: we can replace the many records pointing to docs in config with a call to the drive service to get the folder

    // the constructor gets the core id which points to the core google spreadsheet by default
    // you can pass in a different id for testing purposes, but this should work in test and prod
    constructor(marketConfig: NMConfigModel) {
        this.marketConfig = marketConfig;
        const spreadsheetId = marketConfig.GSPREAD_CORE_ID;
        this.driveCoreDataService = new GoogleDriveService(spreadsheetId);

        this.configSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'config'
        });

        this.coreTypeSheetService = new GoogleSheetService({
            spreadsheetId,
            sheetName: 'type'
        });
    }

    async getMarketConfigByGuildId(guildId: string): Promise<NMConfigModel> {
        // get the market id
        const configRows = await this.configSheetService.getAllRowsAsMaps();
        const marketInstanceConfig = configRows.find(
            (a) => a.DISCORD_GUILD_ID === guildId
        );

        if (!marketInstanceConfig) {
            throw new Error(`No config found for guild ${guildId}!`);
        }

        // return
        return this.getValidMarketConfig({
            ...marketInstanceConfig,
            ...this.marketConfig
        });
    }

    getValidMarketConfig({
        GSPREAD_CORE_ID,
        NM_ID,
        NM_TIMEZONE,
        NM_TITLE,
        DISCORD_GUILD_ID,
        GSPREAD_MARKET_ID
    }: Partial<NMConfigModel>): NMConfigModel {
        if (!GSPREAD_CORE_ID) {
            throw new Error('Missing GSPREAD_CORE_ID');
        }

        if (!NM_ID) {
            throw new Error('Missing NM_ID');
        }

        if (!NM_TIMEZONE) {
            // default to pacific time?
            NM_TIMEZONE = 'America/Los_Angeles';
        }

        if (!NM_TITLE) {
            NM_TITLE = 'Night Market';
        }

        if (!DISCORD_GUILD_ID) {
            throw new Error('Missing DISCORD_GUILD_ID');
        }

        if (!GSPREAD_MARKET_ID) {
            throw new Error('Missing GSPREAD_CORE_PERSON_ID');
        }

        return {
            GSPREAD_CORE_ID,
            NM_ID,
            NM_TIMEZONE,
            NM_TITLE,
            DISCORD_GUILD_ID,
            GSPREAD_MARKET_ID
        };
    }

    async getAllInstanceConfig(): Promise<NMConfigInstanceModel[]> {
        return await this.configSheetService.getAllRowsAsMaps();
    }

    async getAllGuildIds(): Promise<string[]> {
        const configRows = await this.configSheetService.getAllRowsAsMaps();
        return configRows.map((a) => a.DISCORD_GUILD_ID);
    }
}

// export class NMConfigModel implements AllNMConfigModel {
//     // the spreadsheet id for where configuration is kept for all market instances
//     GSPREAD_CORE_ID: string;
//     // the spreadsheet id for where types are kept for all market instances
//     // GSPREAD_CORE_TYPE_ID: string;
//     // the spreadsheet id for the core data model where people and orgs are kept
//     // GSPREAD_CORE_PERSON_ID: string;
//     // // the spreadsheet id for where organizations are kept
//     // GSPREAD_CORE_ORG_ID: string;

//     // the id of the instance
//     NM_ID: string;
//     // the guild id
//     DISCORD_GUILD_ID: string;
//     // all the data are here
//     GSPREAD_MARKET_ID: string;
//     constructor({
//         PG_CONFIG,
//         GSPREAD_CORE_ID,
//         NM_ID,
//         DISCORD_GUILD_ID,
//         GSPREAD_MARKET_ID
//     }: Partial<AllNMConfigModel>) {
//         if (!GSPREAD_CORE_ID) {
//             throw new Error('Missing GSPREAD_CORE_ID');
//         }

//         this.GSPREAD_CORE_ID = GSPREAD_CORE_ID;

//         if (!NM_ID) {
//             throw new Error('Missing NM_ID');
//         }
//         if (!DISCORD_GUILD_ID) {
//             throw new Error('Missing DISCORD_GUILD_ID');
//         }

//         if (!GSPREAD_MARKET_ID) {
//             throw new Error('Missing GSPREAD_CORE_PERSON_ID');
//         }
//         if (!PG_CONFIG) {
//             throw new Error('Missing PG_CONFIG');
//         }

//         this.NM_ID = NM_ID;
//         // adding strings to this because it is an integer id
//         this.DISCORD_GUILD_ID = DISCORD_GUILD_ID + '';
//         this.GSPREAD_MARKET_ID = GSPREAD_MARKET_ID;
//     }
// }
