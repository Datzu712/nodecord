import type { CategoryMetadata, ICommand } from '../../interfaces';

/**
 * Base interface for command metadata.
 * You can extend this interface to add your own metadata. (TODO)
 */
export interface CommandMetadata extends ICommand {
    metadata: {
        name: string;
        aliases: string[];
        category: CategoryMetadata;
    };
}
