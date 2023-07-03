import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const secretmanagerClient = new SecretManagerServiceClient({});

export async function GetGoogleSecrets<U>(secretName: string): Promise<U> {
    // name: `projects/PROJECT_NUMBER/secrets/SECRET_NAME/versions/latest`
    const name = `projects/eco501c3/secrets/${secretName}/versions/latest`;
    const [version] = await secretmanagerClient.accessSecretVersion({
        name
    });

    // we want empty strings to be replaced with the "{}"
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return JSON.parse(version.payload?.data?.toString() || '{}');
}
