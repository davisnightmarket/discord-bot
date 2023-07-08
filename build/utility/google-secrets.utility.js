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
exports.GetGoogleSecrets = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const secretmanagerClient = new secret_manager_1.SecretManagerServiceClient({});
function GetGoogleSecrets(secretName) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // name: `projects/PROJECT_NUMBER/secrets/SECRET_NAME/versions/latest`
        const name = `projects/eco501c3/secrets/${secretName}/versions/latest`;
        const [version] = yield secretmanagerClient.accessSecretVersion({
            name
        });
        // we want empty strings to be replaced with the "{}"
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return JSON.parse(((_b = (_a = version.payload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString()) || '{}');
    });
}
exports.GetGoogleSecrets = GetGoogleSecrets;
