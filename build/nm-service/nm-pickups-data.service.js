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
exports.NmPickupsDataService = void 0;
const service_1 = require("../service");
class NmPickupsDataService {
    constructor(config) {
        this.pickupsSheetService = new service_1.Sheet({
            sheetId: config.GSPREAD_CORE_PICKUPS_ID,
            range: "pickups!A1:I"
        });
    }
    getAllPickups() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pickupsSheetService.get();
        });
    }
    getPickupsFor(day) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getAllPickups()
                .then((pickups) => pickups
                .filter((pickup) => pickup.day === day)
                .filter((pickup) => pickup.activity === "food pickup"));
        });
    }
}
exports.NmPickupsDataService = NmPickupsDataService;