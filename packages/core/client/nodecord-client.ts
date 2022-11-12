import { EventEmitter } from 'stream';
import type { ICategory, ICommand, NodecordClientOptions, AbstractClient } from '../interfaces';

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
        const [client, clientPptions] = this.isDiscordClient(clientOrOptions)
            ? [clientOrOptions, options]
            : [this.createClient(), clientOrOptions];
    }

    public isDiscordClient(clientOrOptions: NodecordClientOptions | AbstractClient) {
        return clientOrOptions instanceof EventEmitter && (clientOrOptions as AbstractClient).application;
    }

    private createClient() {
        // todo
        return {};
    }
}
