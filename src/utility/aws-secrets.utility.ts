// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
    SecretsManagerClient,
    GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager';
import { type EnvType } from '../model';
import { GetDebug } from '.';

const dbg = GetDebug('aws-secrets.utility');

const client = new SecretsManagerClient({
    region: 'us-west-1'
});

// todo: add app names

export const GetSecret = async <U>(env: EnvType = 'test', name: string) => {
    if (env === 'dev') {
        console.log('GetSecret: Environment is "dev", using "test" secret.');
        env = 'test';
    }

    dbg(GetSecret, env, name);

    const SecretId = `${env}/${name}`;

    let response;
    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId,
                VersionStage: 'AWSCURRENT' // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error: any) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.error(error.message);
    }

    return JSON.parse(response?.SecretString ?? '{}') as U;
};

export const GetSecretProp = async <U>(
    env: EnvType = 'test',
    name: string,
    prop: keyof U
): Promise<any> => {
    return (await GetSecret<U>(env, name))[prop];
};
