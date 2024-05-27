"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingForConfig = exports.ConfigLocal = exports.GetConfig = void 0;
const _1 = require(".");
const config_1 = require("../config");
const waitingForAwsSecrets = (0, _1.GetAwsSecretsConfig)();
const GetConfig = async (env = (0, _1.GetEnv)(), envConfig) => {
    // get our local environment config
    const config = envConfig[env];
    const secretConfig = await waitingForAwsSecrets;
    // combined with our config from secrets
    return { ...config, ...secretConfig };
};
exports.GetConfig = GetConfig;
exports.ConfigLocal = config_1.EnvConfig[(0, _1.GetEnv)()];
// we call GetConfig once and then import the promise anywhere we need config
exports.WaitingForConfig = (0, exports.GetConfig)((0, _1.GetEnv)(), config_1.EnvConfig);
