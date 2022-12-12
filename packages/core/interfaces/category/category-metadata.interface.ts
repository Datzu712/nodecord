import type { ICommand, Type } from '../index';

export interface CategoryMetadata {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands?: (ICommand | Type<ICommand>)[];
}
