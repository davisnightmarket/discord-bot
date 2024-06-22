import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { GetDebug, WaitingForConfig } from '../utility';
import type { NMConfigModel } from '../model';
const dbg = GetDebug('GoogleDriveService');

const waitingForGdrive = WaitingForConfig.then((keys) => {
    const credentials = keys.googleApiConfig;
    const auth = new GoogleAuth({
        credentials,
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file'
        ]
    });

    return google.drive({ version: 'v3', auth });
});

export class GoogleDriveService {
    constructor(private readonly config: NMConfigModel) {}

    async getFileIdByName(fileName: string, folderId: string): Promise<string> {
        dbg(`getFileIdByName ${fileName}`);
        const fileList = await this.getFileList(folderId);
        return fileList.data.files?.find((a) => a.name === fileName)?.id ?? '';
    }

    async getFileList(folderId: string) {
        const gdrive = await waitingForGdrive;
        return await gdrive.files.list({
            pageSize: 100,
            fields: 'nextPageToken, files(id, name, mimeType, createdTime, parents, properties)',
            q: `'${folderId}' in parents and trashed=false`
        });
    }

    async getNmInstanceMarkdownFiles() {
        this.getFileList(this.config.NM_MARKDOWN_FOLDER_ID);
    }

    async getNmConstitutionMarkdownFile() {
        return await this.getFileContentsById(
            this.config.NM_CONSTITUTION_GDRIVE_ID
        );
    }

    async getFileContentsById(fileId: string): Promise<string> {
        const files = await this.getFileList(this.config.NM_MARKDOWN_FOLDER_ID);
        const gdrive = await waitingForGdrive;

        const buffers: any[] = [];

        let a = '';
        try {
            a = await gdrive.files
                .get({
                    fileId,
                    supportsAllDrives: true,
                    alt: 'media'
                })
                .then(({ data }) => data as string);
        } catch (e: any) {
            dbg(e.message);
        }
        return a;
    }
}
