import type { ICategory, ICommand, NodecordClientOptions } from '../interfaces';

export class NodecordClient {
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
     * Nodecord client.
     */
    constructor(module: any, options?: NodecordClientOptions);
    constructor(module: any, client: any, options: NodecordClientOptions);
    constructor(module: any, clientOrOptions?: any, options?: NodecordClientOptions) {
        clientOrOptions;
        options;
        module;
    }
}
