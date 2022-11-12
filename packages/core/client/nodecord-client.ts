import type { ICategory, ICommand } from '../interfaces';

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
     * Nodecord basic client.
     */
    constructor(clientOrOptions: any, options?: object) {
        clientOrOptions;
        options;
    }
}
