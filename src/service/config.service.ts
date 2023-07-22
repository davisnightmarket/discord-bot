import { Sheet } from '.';
import { EnvConfig } from '../config';
import {
    type GuildServiceModel,
    type ConfigModel,
    type EnvType
} from '../model';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmOrgService,
    NmPersonDataService,
    NmPickupsDataService
} from '../nm-service';

const Env = process.env.NODE_ENV as EnvType;

if (!Env || !Object.keys(EnvConfig).includes(Env)) {
    throw new Error('');
}

interface ConfigItem {
    marketId: string;
    code: keyof ConfigModel;
    value: string;
}

export class ConfigSerive {
    sheet: Sheet<ConfigItem>;
    services = new Map<string, GuildServiceModel>();

    constructor() {
        this.sheet = new Sheet<ConfigItem>({
            sheetId: EnvConfig[Env].GSPREAD_CORE_CONFIG_ID,
            range: 'config-instance!A1:C'
        });
    }

    async getConfigForGuildId(guildId: string) {
        // get the market id
        const marketIdItem = await this.sheet.search({
            code: 'DISCORD_GUILD_ID',
            value: guildId
        });
        if (!marketIdItem) {
            throw new Error(`No config found for guild ${guildId}!`);
        }
        const marketId = marketIdItem.marketId;

        // build the config
        const items = await this.sheet.filter({ marketId });
        const config = { ...EnvConfig[Env] };
        for (const item of items) {
            config[item.code] = item.value;
        }

        // return
        return config;
    }

    getSericesFotTest() {
        const config = EnvConfig.test;

        const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);

        return {
            pickupsDataService: new NmPickupsDataService(config),
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
        }
    }

    async getServicesForGuildId(guildId: string) {
        if (!this.services.has(guildId)) {
            const config = await this.getConfigForGuildId(guildId);

            const orgCoreService = new NmOrgService(config.GSPREAD_CORE_ORG_ID);

            this.services.set(guildId, {
                pickupsDataService: new NmPickupsDataService(config),
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
