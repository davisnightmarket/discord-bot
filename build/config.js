"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const config_utility_1 = require("./utility/config.utility");
// ok, this is now just a wrapper for GetConfig/WaitingForConfig from utility
// todo: delete it and just use the utility
exports.Config = config_utility_1.WaitingForConfig;
