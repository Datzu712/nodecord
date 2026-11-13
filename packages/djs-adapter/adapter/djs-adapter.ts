import {
    Client as DjsClient,
    type ClientOptions,
    Events,
    type RESTPutAPIApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import { AbstractClientAdapter, type InitAdapterOptions, type LoadSlashCommandsOptions } from '@nodecord/core';
import { EventManager } from './event-manager.js';
import { InteractionDispatcher } from './events/interaction-dispatcher.js';
import { AdapterAlreadyInitializedException, AdapterNotInitializedException } from './exceptions/adapter.exception.js';
import { randomUUID } from 'node:crypto';

export class DiscordJsAdapter extends AbstractClientAdapter<DjsClient> {
    private alreadyInitialized = false;
    protected eventManager!: EventManager;

    /**
     * Accepts either an already-created Client instance or raw ClientOptions.
     * If ClientOptions are passed, the adapter creates the Client internally.
     */
    constructor(clientOrOptions: DjsClient | ClientOptions) {
        if (clientOrOptions instanceof DjsClient) {
            super(clientOrOptions);
        } else {
            super(new DjsClient(clientOrOptions));
        }
    }

    override initialize({ executor, listeners }: InitAdapterOptions): void {
        if (this.alreadyInitialized) {
            throw new AdapterAlreadyInitializedException();
        }
        this.alreadyInitialized = true;

        this.eventManager = new EventManager();

        const dispatcher = new InteractionDispatcher(executor);
        this.eventManager.register({
            metadata: { event: Events.InteractionCreate, once: false, id: randomUUID() },
            listener: dispatcher,
        });

        listeners.forEach((l) => this.eventManager.register(l));
        this.eventManager.attach(this.clientInstance);
    }

    async login(token: string): Promise<void> {
        if (!this.alreadyInitialized) {
            throw new AdapterNotInitializedException();
        }

        await this.clientInstance.login(token);
    }

    /**
     * Todo: Add someway to filter which commands get registered.
     */
    async loadSlashCommands(
        { token, clientId }: LoadSlashCommandsOptions,
        commands: RESTPutAPIApplicationCommandsJSONBody,
    ): Promise<void> {
        await this.clientInstance.rest.setToken(token).put(Routes.applicationCommands(clientId), { body: commands });
    }

    getClient(): DjsClient {
        return this.clientInstance;
    }
}
