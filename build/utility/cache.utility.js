"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheUtility = void 0;
// the private cache
const Cache = {
    'food-count': {}
};
// todo: we should probably delete any cached data that is too old once per day
// a model is passed to cache service which types that cache
function CacheUtility(name) {
    const C = Cache[name];
    return {
        add: (id, payload) => {
            Cache[name][id] = { ...payload, stamp: Date.now() };
            return payload;
        },
        get: (id) => {
            return C[id];
        },
        update: (id, payload) => {
            if (C && id in C) {
                return (C[id] = {
                    ...C[id],
                    ...payload
                });
            }
        },
        delete: (id) => {
            if (C[id]) {
                delete C[id];
            }
        }
    };
}
exports.CacheUtility = CacheUtility;
