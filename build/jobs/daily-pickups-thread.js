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
exports.DailyPickupsThread = void 0;
const discord_js_1 = require("discord.js");
const service_1 = require("../service");
const nm_const_1 = require("../nm-const");
function DailyPickupsThread(guild, services) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const thread = yield createTodaysPickupThread(guild);
        // ping everyone signed up to help with today
        const roleId = yield getRoleByName(guild, today()).then((role) => role.id);
        thread.send((0, discord_js_1.roleMention)(roleId));
        // list all the pick ups happening today
        const pickups = yield services.pickupsDataService.getPickupsFor(today());
        for (const pickup of pickups) {
            thread.send([
                `${(0, discord_js_1.bold)(pickup.org)} at ${pickup.time}. ${(_a = pickup.comments) !== null && _a !== void 0 ? _a : ''}`,
                ``
            ].join("\n"));
        }
    });
}
exports.DailyPickupsThread = DailyPickupsThread;
function createTodaysPickupThread(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = (0, service_1.getChannelByName)(guild, today());
        const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
        return yield channel.threads.create({ name });
    });
}
function getRoleByName(guild, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = guild.roles.cache.find((role) => role.name === name);
        if (!role)
            return yield guild.roles.create({ name });
        return role;
    });
}
function today() {
    return nm_const_1.DAYS_OF_WEEK[new Date().getDay()];
}
