"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigInstanceByGuildIdGet = void 0;
const config_1 = require("../config");
const ConfigInstanceByGuildIdGet = (id) => {
    return config_1.EnvConfig.find((config) => config.DISCORD_GUILD_ID === id);
};
exports.ConfigInstanceByGuildIdGet = ConfigInstanceByGuildIdGet;
