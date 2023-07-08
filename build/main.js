"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("./events");
const discord_js_1 = require("discord.js");
const nm_secrets_utility_1 = require("./utility/nm-secrets.utility");
const utility_1 = require("./utility");
const nm_service_1 = require("./nm-service");
const GuildServiceMap = {};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.DirectMessages
            ],
            partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel]
        });
        client.once(discord_js_1.Events.ClientReady, (c) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Ready! Logged in as ${c.user.tag}`);
            // OK, here we loop through guilds and build a service instance for each
            const GuildIdList = client.guilds.cache.map((guild) => guild.id);
            for (const guildId of GuildIdList) {
                const instanceId = yield (0, utility_1.ConfigInstanceIdByGuildIdGet)(guildId);
                if (!instanceId) {
                    console.log(`No Instance ID found for guild ${guildId}`);
                }
                else {
                    const coreConfig = yield (0, utility_1.ConfigCoreGet)();
                    const instanceConfig = yield (0, utility_1.ConfigInstanceByGuildIdGet)(instanceId);
                    if (!instanceConfig) {
                        console.error(`No config for: ${instanceId} (${guildId})! Guild is not enabled.`);
                        // in this case we do not create a serviceMap for the guild
                        continue;
                    }
                    const orgCoreService = new nm_service_1.NmOrgService(coreConfig.GSPREAD_CORE_ORG_ID);
                    GuildServiceMap[guildId] = {
                        foodCountDataInstanceService: new nm_service_1.NmFoodCountDataService(instanceConfig.GSPREAD_FOODCOUNT_ID),
                        foodCountInputInstanceService: new nm_service_1.NmFoodCountInputService(orgCoreService),
                        orgCoreService,
                        personCoreService: new nm_service_1.NmPersonService(coreConfig.GSPREAD_CORE_PERSON_ID)
                    };
                }
            }
        }));
        // person meta data events
        client.on(discord_js_1.Events.MessageCreate, (0, events_1.PersonMetaEvent)(GuildServiceMap));
        // food count events
        client.on(discord_js_1.Events.MessageCreate, (0, events_1.FoodCountInputEvent)(GuildServiceMap));
        client.on(discord_js_1.Events.InteractionCreate, events_1.FoodCountResponseEvent);
        const { discordConfig: { appToken } } = yield (0, nm_secrets_utility_1.GetNmSecrets)();
        client.login(appToken);
    });
}
main();
