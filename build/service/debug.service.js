"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dbg = exports.DebugService = void 0;
const debug_1 = __importDefault(require("debug"));
const DebugService = (id) => (0, debug_1.default)(`nm:${id}`);
exports.DebugService = DebugService;
// smaller util!
exports.Dbg = exports.DebugService;
