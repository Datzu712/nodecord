import type { ICommand, CommandMetadata } from '@nodecord/core';

export interface DefinedCategory {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands: (ICommand & CommandMetadata)[];
}
