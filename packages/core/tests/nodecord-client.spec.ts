import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { AbstractClientAdapter } from '../client/abstract-client-adapter.js';
import { NodecordClient } from '../client/nodecord-client.js';
import { Module } from '../decorators/module.js';
import { SlashCommand } from '../decorators/slash-command.js';

class FakeAdapter extends AbstractClientAdapter<null> {
    received: unknown[] = [];

    constructor() {
        super(null);
    }

    initialize(): void {}

    async login(): Promise<void> {}

    async loadSlashCommands(...args: unknown[]): Promise<void> {
        this.received = args;
    }

    getClient(): null {
        return null;
    }
}

describe('NodecordClient', () => {
    describe('loadSlashCommands', () => {
        it('hands the adapter the Discord definition of every registered command', async () => {
            @SlashCommand({
                name: 'search',
                description: 'Search something',
                options: [{ type: 3, name: 'query', description: 'The search query', required: true }],
            })
            class SearchCommand {
                execute() {}
            }

            @Module({ handlers: [SearchCommand] })
            class AppModule {}

            const adapter = new FakeAdapter();
            const client = NodecordClient.create({ module: AppModule, adapter, options: { logger: false } });

            await client.loadSlashCommands({ token: 'token', clientId: '123' });

            expect(adapter.received).toEqual([
                { token: 'token', clientId: '123' },
                [
                    {
                        type: 1,
                        name: 'search',
                        description: 'Search something',
                        options: [{ type: 3, name: 'query', description: 'The search query', required: true }],
                    },
                ],
            ]);
        });
    });
});
