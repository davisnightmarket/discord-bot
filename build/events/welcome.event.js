"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEvent = void 0;
const WelcomeEvent = async (member) => {
    // TODO: add content
    member.send({
        content: 'Welcome! ... what do we say?'
    });
};
exports.WelcomeEvent = WelcomeEvent;
