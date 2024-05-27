// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
    SecretsManagerClient,
    GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager';
import { type EnvType } from '../model';
import { GetDebug } from '.';
import { GetEnv } from './env.utility';
import type {
    DiscordApiKeysModel,
    GoogleApiKeysModel,
    PostgresApiKeysModel,
    RdbKeysModel
} from '../model/nm-keys.model';

const dbg = GetDebug('aws-secrets.utility');

const client = new SecretsManagerClient({
    region: 'us-west-1'
});

interface AwsSecretsMap {
    'nm-rds-postgres': PostgresApiKeysModel;
    'nm-discord-api': DiscordApiKeysModel;
    'nm-google-api': GoogleApiKeysModel;
    'nm-rethinkdb': RdbKeysModel;
}

export const GetAwsSecret = async <V extends keyof AwsSecretsMap>(
    name: V,
    env: EnvType = GetEnv()
) => {
    if (env === 'dev') {
        console.log('GetSecret: Environment is "dev", using "test" secret.');
        env = 'test';
    }

    const SecretId = `${env as string}/${name}`;

    dbg(SecretId);

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

    return JSON.parse(response?.SecretString ?? '{}') as AwsSecretsMap[V];
};
