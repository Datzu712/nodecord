import { EventEmitter } from 'stream';
import { loadAdapter, Logger, ExceptionCatcher } from '@nodecord/core';
import { CommandManager, CategoryManager } from '../managers';

import type { NodecordClientOptions, AbstractClientAdapter } from '../interfaces';

/**
 * @publicApi
 */
export class NodecordClient<IAdapterOptions> {
    /* todo: change maps for managers */
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

    /**
     * Nodecord client constructor.
     * @param { any } module - Main module of the client.
     * @param { NodecordClientOptions } options - Nodecord client options.
     */
    constructor(module: any, options?: NodecordClientOptions & IAdapterOptions);
    /**
     * Nodecord client constructor.
     * @param { any } module - Main module of the client.
     * @param { AbstractClientAdapter } adapter - The client adapter (eris or biscuit client adapter).
     * @param { NodecordClientOptions } options - Nodecord client options.
     */
    constructor(module: any, adapter: AbstractClientAdapter, options: NodecordClientOptions & IAdapterOptions);
    constructor(private module: any, adapterOrOptions?: any, options?: NodecordClientOptions & IAdapterOptions) {
        const [clientAdapter, clientOptions] = this.isClientAdapter(adapterOrOptions)
            ? [adapterOrOptions, options]
            : [this.createClientAdapter(), adapterOrOptions];

        this.adapter = clientAdapter;

        clientAdapter.initialize(clientOptions);
        Logger.overrideLocalInstance(clientOptions?.logger);

        this.loadMainModule(clientOptions);
    }

    private loadMainModule(config: NodecordClientOptions): void {
        const shouldRethrow =
            config.abortOnError === false
                ? (err: Error) => {
                      throw err;
                  }
                : undefined;

        ExceptionCatcher.run(() => {
            // todo
            this;
        }, shouldRethrow);
    }

    public isClientAdapter(
        clientOrOptions: NodecordClientOptions | AbstractClientAdapter,
    ): clientOrOptions is AbstractClientAdapter {
        return (
            clientOrOptions instanceof EventEmitter &&
            typeof (clientOrOptions as AbstractClientAdapter).initialize === 'function'
        );
    }

    private createClientAdapter(): AbstractClientAdapter {
        const { djsAdapter } = loadAdapter('@nodecord/djs-adapter');

        return new djsAdapter();
    }

    public async login(token: string): Promise<void> {
        this.adapter.login(token);
    }
}
