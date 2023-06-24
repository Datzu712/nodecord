import { EventEmitter } from 'stream';
import { Logger, type AbstractLogger } from '@nodecord/core/services/logger.service';
import { loadAdapter } from '@nodecord/core/helpers/load-adapter';
import { CommandManager, CategoryManager } from '../managers';
import { ExceptionCatcher } from '../helpers/catch-exception';
import { Injector } from '../helpers/injector';
import { rethrow } from '../helpers/rethrow';

import type { NodecordClientOptions, AbstractClientAdapter } from '../interfaces';

/**
 * @publicApi
 */
export class NodecordClient<IAdapterOptions extends object> {
    private logger = new Logger('NodecordClient');
    /**
     * Map of all categories.
     * `<CategoryName, CategoryObject>`
     */
    public readonly categories = new CategoryManager();

    /**
     * Map of all slash and normal commands.
     *`<CommandName, CommandObject>`
     */
    public readonly commands = new CommandManager();

    private adapter: AbstractClientAdapter;
    private options: NodecordClientOptions & IAdapterOptions;

    /**
     * Nodecord client constructor.
     * @param { any } module - Main module of the client.
     * @param { NodecordClientOptions & IAdapterOptions | undefined } options - Nodecord client options.
     */
    constructor(module: any, options?: NodecordClientOptions & IAdapterOptions);
    /**
     * Nodecord client constructor.
     * @param { any } module - Main module of the client.
     * @param { AbstractClientAdapter } adapter - The client adapter (djs or biscuit client adapter).
     * @param { NodecordClientOptions & IAdapterOptions } options - Nodecord client options.
     */
    constructor(module: any, adapter: AbstractClientAdapter, options: NodecordClientOptions & IAdapterOptions);
    constructor(
        private module: any,
        adapterOrOptions: (NodecordClientOptions & IAdapterOptions) | AbstractClientAdapter,
        options?: NodecordClientOptions & IAdapterOptions,
    ) {
        const [clientAdapter, clientOptions] = this.isClientAdapter(adapterOrOptions)
            ? [adapterOrOptions, options]
            : [this.createClientAdapter(adapterOrOptions), adapterOrOptions];

        if (!clientOptions) throw new Error('No client options provided.');

        this.options = clientOptions;
        this.adapter = clientAdapter;

        if (options?.logger) Logger.overrideLocalInstance(clientOptions.logger as AbstractLogger);

        this.start(clientOptions);
        clientAdapter.initialize(this.commands);
    }

    private start(config: NodecordClientOptions): void {
        const shouldRethrow = config.abortOnError === false ? rethrow : undefined;
        const injector = new Injector(this.module);

        ExceptionCatcher.run(() => {
            const categories = injector.loadCategoriesWithCommands();

            categories.forEach((category) => this.categories.set(category.metadata.name, category));
            categories.forEach((category) =>
                category.commands.forEach((command) => this.commands.set(command.metadata.name, command)),
            );
        }, shouldRethrow);

        this.categories.forEach((category) => {
            this.logger.log(`Mapped ${category.metadata.name} with ${category.commands.length} commands.`);
        });
    }

    private isClientAdapter(
        clientOrOptions: NodecordClientOptions | AbstractClientAdapter,
    ): clientOrOptions is AbstractClientAdapter {
        return (
            clientOrOptions instanceof EventEmitter &&
            typeof (clientOrOptions as AbstractClientAdapter).initialize === 'function'
        );
    }

    private createClientAdapter(options: NodecordClientOptions & IAdapterOptions): AbstractClientAdapter {
        const { DiscordJsAdapter } = loadAdapter('@nodecord/djs-adapter');

        return new DiscordJsAdapter(options);
    }

    public async login(token: string): Promise<void> {
        await this.adapter.login(token);
    }
}
