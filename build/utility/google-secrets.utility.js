"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGoogleSecrets = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const secretmanagerClient = new secret_manager_1.SecretManagerServiceClient({});
async function GetGoogleSecrets(secretName) {
    // name: `projects/PROJECT_NUMBER/secrets/SECRET_NAME/versions/latest`
    const name = `projects/eco501c3/secrets/${secretName}/versions/latest`;
    const [version] = await secretmanagerClient.accessSecretVersion({
        name
    });
    // we want empty strings to be replaced with the "{}"
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return JSON.parse(version.payload?.data?.toString() || '{}');
}
exports.GetGoogleSecrets = GetGoogleSecrets;
