import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { Dbg } from '../utility';
import { NmSecrets } from '../utility/secrets.utility';

const dbg = Dbg('GoogleDriveService');

const waitingForGdrive = NmSecrets.then((keys) => {
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/drive'
    });

    return google.drive({ version: 'v3', auth });
});

export class GoogleDriveService<U extends string> {
    folderId: string;

    constructor(folderId: string) {
        // each
        this.folderId = folderId;
    }

    async getFileIdByName(fileName: U): Promise<string> {
        dbg(`getFileIdByName ${fileName}`);
        const fileList = await this.getFileList(this.folderId);
        return fileList.data.files?.find((a) => a.name === fileName)?.id || '';
    }

    async getFileList(folderId: string) {
        const gdrive = await waitingForGdrive;
        return await gdrive.files.list({
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, createdTime, parents, properties)',
            q: `'${folderId}' in parents and trashed=false`
        });
    }
}
