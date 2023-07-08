// this is not a test, it's a module so we can test cache across modules

import { CacheUtility } from '../src/utility';
export const TestCache = CacheUtility<{ some: string }>('food-count');

export const TEST_CACHE_STRING = 'other data';
TestCache.add('test-module', { some: TEST_CACHE_STRING });
