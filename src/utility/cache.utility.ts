// we type our cache strings to make autocomplete work across cache imports
// todo: add more cache types as needed
type CacheType = 'food-count';

interface PayloadBaseModel {
    stamp: number;
}

type PayloadModel = Record<string, any>;

// a basic object map for named caches
type CachePayloadModel<
    U extends PayloadModel & {
        stamp: number;
    }
> = Record<string, U>;

type CacheModel<U extends PayloadModel = PayloadModel> = Record<CacheType, CachePayloadModel<U & PayloadBaseModel>>;

// the private cache
const Cache: CacheModel<PayloadModel> = {
    'food-count': {}
};

// todo: we should probably delete any cached data that is too old once per day

// a model is passed to cache service which types that cache
export function CacheUtility<U extends PayloadModel = PayloadModel>(
    name: CacheType
): {
    add: (id: string, payload: U) => U;
    update: (id: string, payload: Partial<U>) => U | undefined;
    get: (id: string) => U | undefined;
    delete: (id: string) => void;
} {
    const C = Cache[name] as CachePayloadModel<U & PayloadBaseModel>;

    return {
        add: (id: string, payload: U): U => {
            Cache[name][id] = { ...payload, stamp: Date.now() };
            return payload;
        },
        get: (id: string): U => {
            return C[id];
        },
        update: (id, payload: Partial<U>) => {
            if (C && id in C) {
                return (C[id] = {
                    ...C[id],
                    ...payload
                });
            }
        },
        delete: (id: string) => {
            if (C[id]) {
                delete C[id];
            }
        }
    };
}
