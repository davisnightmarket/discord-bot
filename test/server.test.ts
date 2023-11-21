import { describe, expect, test, jest } from '@jest/globals';
import { Events, TextChannel } from 'discord.js';
import { NmSecrets } from '../src/utility';
import { CrabappleClient } from './crabapple-client';

jest.setTimeout(5000);

describe('nm-secrets.utility.ts', () => {
    // only test the discord client in test/dev
    if (process.env.NODE_ENV !== 'prod') {
        test('make sure our Discord server works', async () => {
            // Start discord client

            CrabappleClient.on(Events.MessageCreate, async (client) => {
                // food count input
                expect(client.content).toBe('hello!');
            });

            CrabappleClient.on(Events.ClientReady, async (client) => {
                const channel = client.channels?.cache?.get(
                    // tuesday
                    '1095377181514936321'
                );
                (channel as TextChannel).send('hello!');
            });

            const {
                discordConfig: { appToken }
            } = await NmSecrets;

            CrabappleClient.login(appToken);
        });
    }
});
