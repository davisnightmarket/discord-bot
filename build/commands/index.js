"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const volunteer_command_1 = __importDefault(require("./volunteer.command"));
const identity_command_1 = __importDefault(require("./identity.command"));
const nm_command_1 = __importDefault(require("./nm.command"));
exports.default = [nm_command_1.default, volunteer_command_1.default, identity_command_1.default];
