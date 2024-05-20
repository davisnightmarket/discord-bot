import type { EnvType } from '../model';

const envList: EnvType[] = ['dev', 'test', 'prod'];

export function GetEnv(): EnvType {
    if (!envList.includes(process.env.NODE_ENV as EnvType)) {
        console.error(`Invalid NODE_ENV: ${process.env.NODE_ENV as string}`);
        return 'dev';
    }
    return process.env.NODE_ENV as EnvType;
}
