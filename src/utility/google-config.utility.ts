/**
 * Deprecated: we use AWS now
 */

// import { GetGoogleSecrets } from './google-secrets.utility';
// import { join } from 'path';
// import { readFileSync } from 'fs';

// const DISCORD_CONFIG_NAME = 'config-discord-api';
// const GOOGLE_KEYS_NAME = 'config-google-api';

// export async function GetGoogleSecretsConfig(): Promise<NmKeysModel> {
//     if (process.env.NODE_ENV === 'prod') {
//         return {
//             googleApiKeys: await GetGoogleSecrets<GoogleApiKeysModel>(
//                 `nm-${GOOGLE_KEYS_NAME}`
//             ),
//             discordApiKeys: await GetGoogleSecrets<DiscordApiKeysModel>(
//                 `nm-${DISCORD_CONFIG_NAME}`
//             )
//         };
//     } else {
//         return {
//             googleApiKeys: JSON.parse(
//                 readFileSync(
//                     join(__dirname, `../../${GOOGLE_KEYS_NAME}.secret.json`),
//                     'utf-8'
//                 )
//             ),
//             discordApiKeys: JSON.parse(
//                 readFileSync(
//                     join(__dirname, `../../${DISCORD_CONFIG_NAME}.secret.json`),
//                     'utf-8'
//                 )
//             )
//         };
//     }
// }
