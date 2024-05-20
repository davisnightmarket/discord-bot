"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConfig = void 0;
const _1 = require(".");
const waitingForAwsSecrets = (0, _1.GetAwsSecretsConfig)();
const GetConfig = async (env, envConfig) => {
    // get our local environment config
    const config = envConfig[env];
    const secretConfig = await waitingForAwsSecrets;
    // combined with our config from secrets
    return { ...config, ...secretConfig };
};
exports.GetConfig = GetConfig;
