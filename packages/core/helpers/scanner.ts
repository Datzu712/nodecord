import { CommandTypes } from '../enums/command-types.enum';
import { COMMAND_WATERMARK, CATEGORY_WATERMARK, MAIN_MODULE_WATERMARK } from '../constants';

export class Scanner {
    /**
     * Checks if the given instance is a command.
     * @param instance - The instance to check.
     * @returns True if the instance is a command, false otherwise.
     */
    static isCommand(instance: any): boolean {
        const metadata = Reflect.getMetadata(COMMAND_WATERMARK, instance) as { type?: CommandTypes };
        return Object.values<string | CommandTypes | undefined>(CommandTypes).includes(metadata?.type);
    }
    static isLegacyCommand(instance: any): boolean {
        const metadata = Reflect.getMetadata(COMMAND_WATERMARK, instance) as { type?: CommandTypes };
        return metadata?.type === CommandTypes.LEGACY;
    }
    static isSlashCommand(instance: any): boolean {
        const metadata = Reflect.getMetadata(COMMAND_WATERMARK, instance) as { type?: CommandTypes };
        return metadata?.type === CommandTypes.SLASH;
    }
    static isCategory(instance: any): boolean {
        return !!Reflect.hasMetadata(CATEGORY_WATERMARK, instance);
    }
    static isClientModule(instance: any): boolean {
        return !!Reflect.hasMetadata(MAIN_MODULE_WATERMARK, instance);
    }
}
