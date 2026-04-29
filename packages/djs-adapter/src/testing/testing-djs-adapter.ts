/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { EventEmitter } from 'node:events';
import { Client as DjsClient, Events } from 'discord.js';
import { type LoadSlashCommandsOptions } from '@nodecord/core';
import { DiscordJsAdapter } from '../djs-adapter.js';
import type { MockInteraction } from './mock-interaction.js';

function createFakeDiscordClient(): DjsClient {
    const fake = Object.create(DjsClient.prototype) as DjsClient;
    const emitter = new EventEmitter();
    fake.on = emitter.on.bind(emitter) as DjsClient['on'];
    fake.once = emitter.once.bind(emitter) as DjsClient['once'];
    fake.emit = emitter.emit.bind(emitter) as DjsClient['emit'];
    return fake;
}

export class TestingDjsAdapter extends DiscordJsAdapter {
    constructor() {
        super(createFakeDiscordClient());
    }

    override async login(_token: string): Promise<void> {
        throw new Error(
            'Login is not supported in TestingDjsAdapter. This adapter is meant for testing command handling logic without connecting to Discord.',
        );
    }

    override async loadSlashCommands(_options: LoadSlashCommandsOptions): Promise<void> {
        throw new Error(
            'Loading slash commands is not supported in TestingDjsAdapter. This adapter is meant for testing command handling logic without connecting to Discord.',
        );
    }

    /**
     * EventEmitter.emit() is synchronous, it invokes async listeners but does not await their
     * returned promises. Those promises become """floating""" and resolve later in the event loop,
     * after this method has already returned. This means any test assertions (expect()) would
     * run before the async pipeline completes, resulting in 0 calls on mocked functions even
     * though the code eventually executes correctly.
     *
     * emitAsync() solves this by explicitly awaiting all listeners before returning, ensuring
     * the full pipeline has completed when control returns to the test.
     *
     * This is a crazy rare edge case lol.
     */
    async simulateInteraction(interaction: MockInteraction): Promise<void> {
        await this.eventManager.emitAsync(Events.InteractionCreate, interaction);
    }
}
