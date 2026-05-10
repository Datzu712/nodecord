import {
    Client as DjsClient,
    type ClientOptions,
    type ApplicationCommandDataResolvable,
    type ChatInputCommandInteraction,
    Events,
    type Interaction,
    REST,
    Routes,
} from 'discord.js';
import {
    AbstractClientAdapter,
    CommandExecutor,
    CommandParamTypes,
    LoadSlashCommandsOptions,
    type ExecutionContext,
    type RegisteredCommandHandler,
    type RegisteredListener,
} from '@nodecord/core';
import { CommandRegistry } from './command-registry.js';
import { EventManager } from './event-manager.js';
import { InteractionDispatcher } from './events/interaction-dispatcher.js';
import { ConsoleLogger } from '@nodecord/core';
import { isDjsCommandMeta } from './helpers/validate-command-meta.js';
import {
    AdapterAlreadyInitializedException,
    AdapterNotInitializedException,
    InvalidHandlerMetadataException,
} from './exceptions/adapter.exception.js';
import { randomUUID } from 'node:crypto';

export class DiscordJsAdapter extends AbstractClientAdapter<DjsClient> {
    private alreadyInitialized = false;

    protected eventManager!: EventManager;

    private readonly commandRegistry = new CommandRegistry();

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

    initialize(
        executor: CommandExecutor,
        handlers: RegisteredCommandHandler[],
        listeners: RegisteredListener<unknown[]>[],
    ): void {
        if (this.alreadyInitialized) {
            throw new AdapterAlreadyInitializedException();
        }
        this.alreadyInitialized = true;

        this.registerParamResolvers(executor);

        this.eventManager = new EventManager();

        if (handlers.length) {
            handlers.forEach(({ metadata, handler, ...rest }) => {
                if (!isDjsCommandMeta(metadata.definition)) {
                    throw new InvalidHandlerMetadataException(handler.constructor.name);
                }
                this.commandRegistry.register({
                    metadata: { ...metadata, definition: metadata.definition.toJSON() },
                    handler,
                    ...rest,
                });
            });

            const dispatcher = new InteractionDispatcher(
                this.commandRegistry,
                executor,
                new ConsoleLogger('ExceptionHandler'),
            );
            this.eventManager.register({
                metadata: { event: Events.InteractionCreate, once: false, id: randomUUID() },
                listener: dispatcher,
            });
        }

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
    async loadSlashCommands({ token, clientId, restVersion = '10' }: LoadSlashCommandsOptions): Promise<void> {
        const commands = this.commandRegistry
            .getAll()
            .map((cmd) => cmd.metadata.definition) as ApplicationCommandDataResolvable[];

        const rest = new REST({ version: restVersion }).setToken(token);
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });
    }

    getClient(): DjsClient {
        return this.clientInstance;
    }

    private registerParamResolvers(executor: CommandExecutor): void {
        executor.registerParamResolver(CommandParamTypes.CONTEXT, (ctx: ExecutionContext) => ctx);

        executor.registerParamResolver(
            CommandParamTypes.GUILD,
            (ctx: ExecutionContext) => ctx.getRaw<Interaction>().guild,
        );

        executor.registerParamResolver(
            CommandParamTypes.AUTHOR,
            (ctx: ExecutionContext) => ctx.getRaw<Interaction>().user,
        );

        executor.registerParamResolver(CommandParamTypes.OPTION, (ctx: ExecutionContext, data?: unknown) => {
            const interaction = ctx.getRaw<ChatInputCommandInteraction>();
            if (data === undefined) {
                return Object.fromEntries(interaction.options.data.map((opt) => [opt.name, opt.value]));
            }
            return interaction.options.get(data as string)?.value;
        });
    }
}
