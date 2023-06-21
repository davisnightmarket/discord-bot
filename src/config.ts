// TODO: this can be merged with nm-config.service
// the main difference is that is an async wrapper for secrets manager
// while these config aren't secret, but there is no reason not to
// roll them together I don't think - keeps it simple

// right now dev and test are the same
type EnvType = 'dev' | 'test' | 'prod';

// ok, time to stub out different night markets with their own discord servers
// we will call this "Night Market Instance"
// TODO: we don't actually want a type here, we want a string that can be dynamically gotten from somewhere
// TODO: we also want to get the full config from somewhere, maybe a database OR a gspreadsheet
// TODO: because we want to be able to add any number of instances from somewhere not in-code
// TODO: so we will change this, but for now:
type NMInstance = string;

export interface ConfigModel {
    // the  spreadsheet id for the core data model where people and orgs are kept
    GSPREAD_CORE_ID: string;
    // the  spreadsheet id for where food counts are kept
    GSPREAD_FOODCOUNT_ID: string;
}

const EnvConfig: {
    [l in NMInstance]: {
        [k in EnvType]: ConfigModel;
    };
} = {
    'davis.nightmarket': {
        dev: {
            GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
            GSPREAD_FOODCOUNT_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
        },
        // these point to TEST data in night-tech folder
        test: {
            GSPREAD_CORE_ID: '1y27iAsVWOG_l3yfLEvVIyKqKlL9i571pZN6wegCK_98',
            GSPREAD_FOODCOUNT_ID: '18TujYCUGf4Lko-8VVJtyagmk2SNEouxTTde5opG1eoo'
        },
        prod: {
            GSPREAD_CORE_ID: '17-BwSUuXOD_mawagA_cEjP9kVkWCC_boCUV_FikeDek',
            GSPREAD_FOODCOUNT_ID: '1uHQ6oL84fxlu3bXYxPIU7s1-T2RX0uWzCNC1Hxs8sMM'
        }
    }
};

export let Env: EnvType = (process.env.NODE_ENV as EnvType) ?? 'test';

if (!['dev', 'test', 'prod'].includes(Env)) {
    Env = 'test';
    console.log('No Environment set, using "test"');
}

export const ConfigGet = async (
    // allow a string to be passed for night market instance
    inst: NMInstance,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<ConfigModel> => EnvConfig[inst][env];

export const ConfigValueGet = async (
    // allow a string to be passed for night market instance
    inst: NMInstance,
    // get a string value
    a: keyof ConfigModel,
    // allow env to be passed so we can test config in any env
    env = Env
): Promise<string> => {
    const config = await ConfigGet(inst, env);
    return config[a];
};
