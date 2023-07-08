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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigInstanceByGuildIdGet = exports.ConfigInstanceIdByGuildIdGet = exports.ConfigInstanceValueGet = exports.ConfigCoreValueGet = exports.ConfigCoreGet = exports.ConfigGet = exports.Env = void 0;
const config_1 = require("../config");
// TODO: move this to google spread so we can add new discord servers in via spreadsheet?
exports.Env = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'test';
if (!['dev', 'test', 'prod'].includes(exports.Env)) {
    exports.Env = 'test';
    console.log('No Environment set, using "test"');
}
const ConfigGet = (
// allow a string to be passed for night market instance
inst, 
// allow env to be passed so we can test config in any env
env = exports.Env) => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        coreConfig: config_1.EnvConfig[env].coreConfig,
        instanceConfig: config_1.EnvConfig[env][inst]
    });
});
exports.ConfigGet = ConfigGet;
const ConfigCoreGet = (
// allow env to be passed so we can test config in any env
env = exports.Env) => __awaiter(void 0, void 0, void 0, function* () { return config_1.EnvConfig[env].coreConfig; });
exports.ConfigCoreGet = ConfigCoreGet;
const ConfigCoreValueGet = (
// allow a string to be passed for night market instance
inst, 
// get a string value
a, 
// allow env to be passed so we can test config in any env
env = exports.Env) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield (0, exports.ConfigGet)(inst, env);
    return config.coreConfig[a];
});
exports.ConfigCoreValueGet = ConfigCoreValueGet;
const ConfigInstanceValueGet = (
// allow a string to be passed for night market instance
inst, 
// get a string value
a, 
// allow env to be passed so we can test config in any env
env = exports.Env) => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield (0, exports.ConfigGet)(inst, env);
    return config.instanceConfig[a];
});
exports.ConfigInstanceValueGet = ConfigInstanceValueGet;
const ConfigInstanceIdByGuildIdGet = (guildId) => __awaiter(void 0, void 0, void 0, function* () {
    return Object.keys(config_1.EnvConfig)
        .filter((a) => config_1.EnvConfig[exports.Env][a].DISCORD_GUILD_ID === guildId)
        .pop();
});
exports.ConfigInstanceIdByGuildIdGet = ConfigInstanceIdByGuildIdGet;
const ConfigInstanceByGuildIdGet = (guildId) => __awaiter(void 0, void 0, void 0, function* () {
    return Object.keys(config_1.EnvConfig)
        .filter((a) => config_1.EnvConfig[exports.Env][a].DISCORD_GUILD_ID === guildId)
        .map((a) => config_1.EnvConfig[exports.Env][a])
        .pop();
});
exports.ConfigInstanceByGuildIdGet = ConfigInstanceByGuildIdGet;
