import { EnvConfigModel } from './model';

// TODO: this config we may want to keep in a Core Config spreadsheet
export const EnvConfig: EnvConfigModel = {
    'davis.nightmarket': {
        dev: {
            coreConfig: {
                GSPREAD_CORE_PERSON_ID: '',
                GSPREAD_CORE_ORG_ID: '',
                GSPREAD_CORE_CONFIG_ID: ''
            },
            replicaConfig: {
                DISCORD_GUILD_ID: '',
                GSPREAD_OPS_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
                GSPREAD_FOODCOUNT_ID:
                    '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
            }
        },
        // these point to TEST data in night-tech folder
        test: {
            coreConfig: {
                GSPREAD_CORE_PERSON_ID: '',
                GSPREAD_CORE_ORG_ID: '',
                GSPREAD_CORE_CONFIG_ID: ''
            },
            replicaConfig: {
                DISCORD_GUILD_ID: '',
                GSPREAD_OPS_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
                GSPREAD_FOODCOUNT_ID:
                    '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
            }
        },
        prod: {
            coreConfig: {
                GSPREAD_CORE_PERSON_ID: '',
                GSPREAD_CORE_ORG_ID: '',
                GSPREAD_CORE_CONFIG_ID: ''
            },
            replicaConfig: {
                DISCORD_GUILD_ID: '',
                GSPREAD_OPS_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
                GSPREAD_FOODCOUNT_ID:
                    '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
            }
        }
    }
};
