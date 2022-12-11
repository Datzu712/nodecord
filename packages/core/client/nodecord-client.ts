import { EventEmitter } from 'stream';
import { loadAdapter } from '@nodecord/core';

import type { ICategory, ICommand, NodecordClientOptions, AbstractClient } from '../interfaces';

/**
 * @publicApi
 */
export class NodecordClient {
    /* todo: change maps for managers */
    /**
     * Map of all categories.
     * `<CategoryName, CategoryObject>`
     */
    public readonly categories: Map<string, ICategory> = new Map();

    /**
     * Map of all slash and normal commands.
     *`<CommandName, CommandObject>`
     */
    public readonly commands: Map<string, ICommand> = new Map();

    /**
     * Nodecord client constructor.
     */
    constructor(module: any, options?: NodecordClientOptions);
    constructor(module: any, client: any, options: NodecordClientOptions);
    constructor(module: any, clientOrOptions?: any, options?: NodecordClientOptions) {
        const [client, clientOptions] = this.isDjsClient(clientOrOptions)
            ? [clientOrOptions, options]
            : [this.createClientAdapter(), clientOrOptions];
        client;
        clientOptions;
    }

    public isDjsClient(clientOrOptions: NodecordClientOptions | AbstractClient): clientOrOptions is AbstractClient {
        return (
            clientOrOptions instanceof EventEmitter &&
            typeof (clientOrOptions as AbstractClient).application === 'object'
        );
    }

    private createClientAdapter(client?: AbstractClient): AbstractClient {
        const { djsAdapter } = loadAdapter('@nodecord/djs-adapter');

        return new djsAdapter(client);
    }
}
