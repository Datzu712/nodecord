import { Client as DjsClient, type ClientOptions, Events } from 'discord.js';
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
    // eslint-disable-next-line @typescript-eslint/require-await
    async loadSlashCommands(_options: LoadSlashCommandsOptions): Promise<void> {
        throw new Error('Method not implemented.'); // Placeholder until we decide on a strategy for command registration.
        // const commands = this.commandRegistry
        //     .getAll()
        //     .map((cmd) => cmd.metadata.definition) as ApplicationCommandDataResolvable[];

        // const rest = new REST({ version: restVersion }).setToken(token);
        // await rest.put(Routes.applicationCommands(clientId), {
        //     body: commands,
        // });
    }

    getClient(): DjsClient {
        return this.clientInstance;
    }
}
