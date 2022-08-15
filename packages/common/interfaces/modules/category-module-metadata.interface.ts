import type { ICommand, ICategory, Type } from '../index';

export interface CategoryModuleMetadata {
    metadata: Omit<ICategory, 'commands'>;
    /**
     * Optional list of the commands that belong to this category.
     */
    commands?: (ICommand | Type<ICommand>)[];
}
