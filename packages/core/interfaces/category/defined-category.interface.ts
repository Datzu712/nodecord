import type { DefinedCommand } from '../command';

export interface DefinedCategory {
    metadata: {
        name: string;
        aliases: string[];
        options?: Record<string, any>;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands: DefinedCommand[];
}
