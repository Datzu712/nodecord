import type { ICategory } from '../interfaces';

export class BaseClient {
    /**
     * Map of all categories.
     * <CategoryName, CategoryObject>
     */
    public readonly categories: Map<string, ICategory> = new Map();

    /**
     * Nodecord basic client.
     * @param { any } client - discord.js or eris client adapter
     */
    constructor(private client: any) {}
}
