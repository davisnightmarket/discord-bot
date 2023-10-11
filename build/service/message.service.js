"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const utility_1 = require("../utility");
const messageMap = (0, utility_1.CreateMessageMap)({
    GENERIC_SORRY: {
        techPhone: ''
    }
});
class MessageService {
    constructor(coreDataService) {
        this.coreDataService = coreDataService;
    }
    getGenericSorry() {
        // TODO: figure out how to do this
        return messageMap.GENERIC_SORRY({ techPhone: '' });
    }
}
exports.MessageService = MessageService;
