import { loadAdapter } from '../helpers/load-adapter.js';
import { NodecordClientOptions } from '../interfaces/client/nodecord-client-options.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { Constructor } from '../interfaces/common/constructor.js';
import { AbstractClientAdapter, type LoadSlashCommandsOptions } from './abstract-client-adapter.js';
import { CommandExecutor } from './command-executor.js';
import { ConsoleLogger } from './console-logger.js';
import { ModuleCompiler } from './container/module-compiler.js';

interface NodecordClientConstructor<IAdapterOptions extends object> {
    module: Constructor;
    adapter?: Constructor<AbstractClientAdapter> | AbstractClientAdapter;
    options?: NodecordClientOptions & IAdapterOptions;
}

const mutedLogger: AbstractLogger = {
    log: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
    verbose: () => {},
};

export class NodecordClient {
    private readonly adapter: AbstractClientAdapter;
    private readonly logger: AbstractLogger;
    private readonly moduleCompiler: ModuleCompiler;

    private constructor(adapter: AbstractClientAdapter, logger: AbstractLogger, moduleCompiler: ModuleCompiler) {
        this.adapter = adapter;
        this.logger = logger;
        this.moduleCompiler = moduleCompiler;
    }

    static create<IAdapterOptions extends object>({
        module,
        adapter,
        options,
    }: NodecordClientConstructor<IAdapterOptions>): NodecordClient {
        if (!options) {
            throw new Error('Client options are required to initialize NodecordClient.');
        }

        const logger = options.logger === false ? mutedLogger : (options.logger ?? new ConsoleLogger('NodecordClient'));
        const moduleCompiler = new ModuleCompiler(logger);
        moduleCompiler.compile(module);

        const resolvedAdapter = NodecordClient.resolveAdapter(adapter, options);
        const client = new NodecordClient(resolvedAdapter, logger, moduleCompiler);
        client.init();

        return client;
    }

    private init() {
        const executor = new CommandExecutor();
        const handlers = this.moduleCompiler.getHandlers();
        const listeners = this.moduleCompiler.getEventListeners();
        const interceptors = this.moduleCompiler.getInterceptors();

        this.adapter.initialize(executor, handlers, listeners, interceptors);
    }

    get<T>(cls: Constructor<T>): T {
        const targetContainer = this.moduleCompiler.getContainerFor(cls);
        this.logger.debug(`Resolving ${cls.name} from container: ${targetContainer.constructor.name}`);
        return targetContainer.resolve(cls);
    }

    /**
     * Resolves the adapter to use for this client.
     *
     * Accepts three forms:
     * - An already-created adapter instance → used directly.
     * - An adapter class (constructor) → instantiated internally with the provided options.
     * - Nothing → falls back to the default adapter (DiscordJsAdapter).
     *
     * @example
     * // Instance
     * resolveAdapter(new DiscordJsAdapter(client), options)
     *
     * // Class
     * resolveAdapter(DiscordJsAdapter, options)
     *
     * // Default
     * resolveAdapter(undefined, options)
     */
    private static resolveAdapter<IAdapterOptions extends object>(
        adapter: Constructor<AbstractClientAdapter> | AbstractClientAdapter | undefined,
        options: NodecordClientOptions & IAdapterOptions,
    ): AbstractClientAdapter {
        if (adapter instanceof AbstractClientAdapter) {
            return adapter;
        }

        if (typeof adapter === 'function' && adapter.prototype instanceof AbstractClientAdapter) {
            return new adapter(options);
        }

        return NodecordClient.createClientAdapter(options);
    }

    private static createClientAdapter<IAdapterOptions extends object>(
        options: NodecordClientOptions & IAdapterOptions,
    ): AbstractClientAdapter<IAdapterOptions> {
        const { DiscordJsAdapter } = loadAdapter<{
            DiscordJsAdapter: new (options: IAdapterOptions) => AbstractClientAdapter<IAdapterOptions>;
        }>('@nodecord/djs-adapter');

        return new DiscordJsAdapter(options);
    }

    async login(token: string): Promise<void> {
        await this.adapter.login(token);
    }

    public async loadSlashCommands(options: LoadSlashCommandsOptions): Promise<void> {
        await this.adapter.loadSlashCommands(options);
    }
}
