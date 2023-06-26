import type { ICommand } from '../command/command.interface';
import { Type } from '../../interfaces/type.interface';

export interface CategoryMetadata {
    metadata: {
        name: string;
    };
    /**
     * Optional list of the commands that belong to this category.
     */
    commands?: Type<ICommand>[];
}
