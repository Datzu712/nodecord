import type { DefinedCommand } from '@nodecord/core';

export interface DefinedCategory {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands: DefinedCommand[];
}
