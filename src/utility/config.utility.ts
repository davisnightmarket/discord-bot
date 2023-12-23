import { type EnvType } from '../model';
import { config } from 'dotenv';
import { GetSecret } from './aws-secrets.utility';
import { GetDebug } from './debug.utility';

const dbg = GetDebug('config.utility');

const nodeEnv = process.env.NODE_ENV as EnvType;
console.log(`Env: ${nodeEnv}`);

const dotenvConfig = config().parsed ?? {};

// because we don't want .env files in docker containers or anything running in prod or test, only local.
// NOTE: this doesn't prevent anyone from running prod/test configs in dev.
if (process.env.NODE_ENV !== 'dev' && Object.keys(dotenvConfig).length > 0) {
    console.error(`Using .env config file in ${nodeEnv} environment!`);
    // throw new Error(
    //   'Cannot use a .env config file in any but "dev" environment!'
    // );
}

// all our envs
const EnvList: EnvType[] = ['dev', 'test', 'prod'];

if (!EnvList.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of ${EnvList.join(', ')}`);
}

type ToConfig<U, V> = (a: U) => V;

export const GetConfig = async <
    U extends Record<string, unknown>,
    V extends Record<string, unknown>
>(
    toConfig: ToConfig<U, V>,
    // passing env allows us to test getting config
    env: EnvType = nodeEnv
) => {
    // because we always try AWS for a our ENV variables
    const secret = await GetSecret<U>(env, name);

    const smKeys = Object.keys(secret);
    if (smKeys.length) {
        dbg(`Found keys from Secrets Manager: ${smKeys.join(', ')}`);
    }
    // because we want to let the console know if we are overriding SM keys from Env
    // note that detenv .env configs always override secrets, but only in "dev"!
    const overrideKeys = Object.keys(process.env);
    for (const key of smKeys) {
        if (overrideKeys.includes(key)) {
            console.log(`Override of key from environment variable: ${key}`);
        }
    }

    // if anything isn't set EformsConfigModel should throw an error.
    return toConfig({ ...secret, ...(process.env || {}) });
};
