"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("./utility");
const commands_1 = __importDefault(require("./commands"));
const service_1 = require("./service");
const discord_js_1 = require("discord.js");
const coreDataService = new service_1.CoreDataService();
const dbg = (0, utility_1.Dbg)('Deploy');
(async () => {
    try {
        const { discordConfig: { clientId, appToken } } = await utility_1.NmSecrets;
        const rest = new discord_js_1.REST().setToken(appToken);
        dbg(`Started refreshing ${commands_1.default.length} application (/) commands.`);
        const body = commands_1.default.map((a) => a.toJSON());
        // The put method is used to fully refresh all commands in the guild with the current set
        const guildIdList = await coreDataService.getAllGuildIds();
        for (const guildId of guildIdList) {
            await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), {
                body
            });
            console.log(`Successfully reloaded ${body.length} application (/) commands.`);
        }
    }
    catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
