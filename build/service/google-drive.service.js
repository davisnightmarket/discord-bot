"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const utility_1 = require("../utility");
const secrets_utility_1 = require("../utility/secrets.utility");
const dbg = (0, utility_1.Dbg)('GoogleDriveService');
const waitingForGdrive = secrets_utility_1.NmSecrets.then((keys) => {
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new google_auth_library_1.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/drive'
    });
    return googleapis_1.google.drive({ version: 'v3', auth });
});
class GoogleDriveService {
    constructor(folderId) {
        // each
        this.folderId = folderId;
    }
    async getFileIdByName(fileName) {
        dbg(`getFileIdByName ${fileName}`);
        const fileList = await this.getFileList(this.folderId);
        return fileList.data.files?.find((a) => a.name === fileName)?.id || '';
    }
    async getFileList(folderId) {
        const gdrive = await waitingForGdrive;
        return await gdrive.files.list({
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, createdTime, parents, properties)',
            q: `'${folderId}' in parents and trashed=false`
        });
    }
}
exports.GoogleDriveService = GoogleDriveService;
