import { describe, expect, test } from '@jest/globals';
import { CreateMdMessage } from '../../src/utility';

const messageInit = {
    FOODCOUNT_INSERT: {
        lbs: '10'
    },
    FOODCOUNT_INPUT_OK: {
        date: ''
    }
};

describe('MessageService', () => {
    test('gets a single message', () => {
        const a = CreateMdMessage('GENERIC_OK', {});
        expect(a({}).trim()).toBe(`OK! All set!`);
    });
});
