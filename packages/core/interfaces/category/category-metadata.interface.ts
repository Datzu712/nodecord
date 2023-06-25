import type { ICommand, Type } from '@nodecord/core';

export interface CategoryMetadata {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands?: Type<ICommand>[];
}
