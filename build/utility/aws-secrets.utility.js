"use strict";
// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAwsSecret = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const _1 = require(".");
const env_utility_1 = require("./env.utility");
const dbg = (0, _1.GetDebug)('aws-secrets.utility');
const client = new client_secrets_manager_1.SecretsManagerClient({
    region: 'us-west-1'
});
const GetAwsSecret = async (name, env = (0, env_utility_1.GetEnv)()) => {
    if (env === 'dev') {
        console.log('GetSecret: Environment is "dev", using "test" secret.');
        env = 'test';
    }
    const SecretId = `${env}/${name}`;
    dbg(SecretId);
    let response;
    try {
        response = await client.send(new client_secrets_manager_1.GetSecretValueCommand({
            SecretId,
            VersionStage: 'AWSCURRENT' // VersionStage defaults to AWSCURRENT if unspecified
        }));
    }
    catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.error(error.message);
    }
    return JSON.parse(response?.SecretString ?? '{}');
};
exports.GetAwsSecret = GetAwsSecret;
