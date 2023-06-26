import type { DefinedCommand } from '../command';

export interface DefinedCategory {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands: DefinedCommand[];
}
