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
exports.GetInstanceServicesByGuildId = exports.GetConfigInstanceByGuildId = exports.GetInstanceConfigMap = void 0;
const model_1 = require("../model");
const config_1 = require("../config");
const nm_service_1 = require("../nm-service");
const google_spreadsheets_service_1 = require("../service/google-spreadsheets.service");
const Env = process.env.NODE_ENV;
if (!Env || !Object.keys(config_1.EnvConfig).includes(Env)) {
    throw new Error('');
}
const GetInstanceConfigMap = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield google_spreadsheets_service_1.GoogleSpreadsheetsService.create(config_1.EnvConfig[Env].GSPREAD_CORE_CONFIG_ID)
        .rangeGet('config-instance!A2:C')
        .then((configList) => configList.reduce((a, b) => {
        // here we are using config from a range that looks like:
        // nm_id, key, value
        if (!a[b[0]]) {
            a[b[0]] = {
                NM_ID: b[0]
            };
        }
        a[b[0]][b[1]] = b[2];
        return a;
    }, {}));
});
exports.GetInstanceConfigMap = GetInstanceConfigMap;
const GetConfigInstanceByGuildId = (guildId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const instanceConfigList = Object.values(yield (0, exports.GetInstanceConfigMap)());
    const a = (_a = instanceConfigList.find((a) => a.DISCORD_GUILD_ID === guildId)) !== null && _a !== void 0 ? _a : {};
    return new model_1.ConfigModel(Object.assign(Object.assign({}, config_1.EnvConfig[Env]), a));
});
exports.GetConfigInstanceByGuildId = GetConfigInstanceByGuildId;
function GetInstanceServicesByGuildId(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield (0, exports.GetConfigInstanceByGuildId)(guildId);
        const orgCoreService = new nm_service_1.NmOrgService(config.GSPREAD_CORE_ORG_ID);
        return {
            foodCountDataService: new nm_service_1.NmFoodCountDataService(config.GSPREAD_FOODCOUNT_ID),
            foodCountInputService: new nm_service_1.NmFoodCountInputService(orgCoreService),
            personCoreService: new nm_service_1.NmPersonDataService(config.GSPREAD_CORE_PERSON_ID),
            orgCoreService
        };
    });
}
exports.GetInstanceServicesByGuildId = GetInstanceServicesByGuildId;
