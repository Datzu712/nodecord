import {
    Client as DjsClient,
    type ClientOptions,
    type ApplicationCommandDataResolvable,
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
    type RegisteredInterceptor,
    type RegisteredListener,
} from '@nodecord/core';
import { CommandRegistry } from './command-registry.js';
import { EventManager } from './event-manager.js';
import { InteractionCreateDispatcher } from './events/interaction-create.dispatcher.js';
import { isDjsCommandMeta } from './helpers/validate-command-meta.js';
import { ResponseHandler } from './response-handler.js';
import { randomUUID } from 'node:crypto';

export class DiscordJsAdapter extends AbstractClientAdapter<DjsClient> {
    private alreadyInitialized = false;

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
        interceptors: RegisteredInterceptor[],
    ): void {
        if (this.alreadyInitialized) {
            throw new Error(
                'Adapter is already initialized. Adapter should only be initialized by the framework once during setup.',
            );
        }
        this.alreadyInitialized = true;

        this.registerParamResolvers(executor);

        const eventManager = new EventManager();

        if (handlers.length) {
            handlers.forEach(({ descriptor, handler, ...rest }) => {
                if (!isDjsCommandMeta(descriptor)) {
                    throw new Error(
                        `Invalid metadata for handler "${handler.constructor.name}". ` +
                            `Expected SlashCommandBuilder or ContextMenuCommandBuilder.`,
                    );
                }
                this.commandRegistry.register({ descriptor: descriptor.toJSON(), handler, ...rest });
            });

            const responseHandler = new ResponseHandler();
            const dispatcher = new InteractionCreateDispatcher(
                this.commandRegistry,
                executor,
                interceptors,
                responseHandler,
            );
            eventManager.register({
                metadata: { event: Events.InteractionCreate, once: false, id: randomUUID() },
                listener: dispatcher,
            });
        }

        listeners.forEach((l) => eventManager.register(l));
        eventManager.attach(this.clientInstance);
    }

    async login(token: string): Promise<void> {
        if (!this.alreadyInitialized) {
            throw new Error('Adapter must be initialized before login. Please ensure the client is properly set up.');
        }

        await this.clientInstance.login(token);
    }

    /**
     * Todo: Add someway to filter which commands get registered.
     */
    async loadSlashCommands({ token, clientId, restVersion = '10' }: LoadSlashCommandsOptions): Promise<void> {
        const commands = this.commandRegistry
            .getAll()
            .map((cmd) => cmd.descriptor) as ApplicationCommandDataResolvable[];

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
            (ctx: ExecutionContext<Interaction>) => ctx.getRaw().guild,
        );

        executor.registerParamResolver(
            CommandParamTypes.AUTHOR,
            (ctx: ExecutionContext<Interaction>) => ctx.getRaw().user,
        );
    }
}
