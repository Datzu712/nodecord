import 'reflect-metadata';

import { describe, expect, it, vi } from 'vitest';
import type { RESTOptions } from 'discord.js';

import { DiscordJsAdapter } from '../adapter/djs-adapter.js';

describe('DiscordJsAdapter', () => {
    describe('loadSlashCommands', () => {
        it('overwrites the global commands of the application with the given definitions', async () => {
            const makeRequest = vi.fn<RESTOptions['makeRequest']>(async () => Response.json([]));
            const adapter = new DiscordJsAdapter({ intents: [], rest: { makeRequest } });

            await adapter.loadSlashCommands({ token: 'bot-token', clientId: '123' }, [
                { type: 1, name: 'ping', description: 'Replies with pong' },
            ]);

            expect(makeRequest).toHaveBeenCalledOnce();
            const [url, init] = makeRequest.mock.calls[0]!;

            expect(url).toBe('https://discord.com/api/v10/applications/123/commands');
            expect(init.method).toBe('PUT');
            expect(init.headers).toMatchObject({ Authorization: 'Bot bot-token' });
            expect(JSON.parse(init.body as string)).toEqual([
                { type: 1, name: 'ping', description: 'Replies with pong' },
            ]);
        });
    });
});
