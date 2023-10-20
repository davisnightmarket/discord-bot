"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGenericMessage = void 0;
const utility_1 = require("../utility");
const messageMap = (0, utility_1.CreateMessageMap)({
    GENERIC_SORRY: {
        techPhone: ''
    }
});
const GetGenericMessage = async (a) => {
    // todo: get core data for this stuff
    return messageMap.GENERIC_SORRY({ techPhone: '' });
};
exports.GetGenericMessage = GetGenericMessage;
