import type { DefinedCategory, ICommand } from '../../interfaces';

/**
 * Base interface for command metadata.
 * You can extend this interface to add your own metadata. (TODO)
 */
export interface CommandMetadata extends ICommand {
    metadata: {
        name: string;
        aliases: string[];
        category: DefinedCategory;
        /**
         * Only for slash commands.
         */
        options?: Record<string, any>;

        /**
         * Only for slash commands
         */
        global: boolean;
    };
}
