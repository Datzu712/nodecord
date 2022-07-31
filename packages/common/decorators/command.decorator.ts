import { CommandMetadata } from '../interfaces/command/command-metadata.interface';
import { COMMAND_WATERMARK, COMMAND_METADATA } from '../constants';

/**
 * Interface defining options that can be passed `@Command()` decorator
 */
export interface CommandOptions extends CommandMetadata {
    /**
     * Whether the command is enabled or not.
     * Pass `false` to override the default value. If `false` is passed, the command will not executed.
     * @default true
     */
    // enabled?: boolean;
    /**
     * If the command can only used by the owner of the bot
     * @default false
     */
    // ownerOnly?: boolean;
    /**
     * Specifies the name of the command.
     * The name of the command is used to find which command is being executed in slash or message context.
     */
    name: string;
    /**
     * Specifies the group the command belongs to (target category).
     * The value passed should be a sting that specifies the group name, and the group name should exists in the `groups` property of the `CommandRegistry` instance.
     * If the group exists, the `CommandRegistry` will automatically add the command to the group (Categories Map) and it will create a property in the command instance `category` with the group object.
     */
    group: string;
}

/**
 * Decorator that marks a class as a command for Nodecord and receive a `Message` or `CommandInteraction` (depending on the library)
 * and produce responses.
 *
 * An Command can receive a `Message` or a `CommandInteraction` from Discord, and make a response.
 * It defines a class that provides a context to respond a message/interaction sent from Discord.
 * @param { CommandOptions } options - Options for the command.
 */
export function Command(options: CommandOptions): ClassDecorator;

/**
 * Decorator that marks a class as a command for Nodecord and receive a `Message` or `CommandInteraction` (depending on the library)
 * and produce responses.
 *
 * An Command can receive a `Message` or a `CommandInteraction` from Discord, and make a response.
 * It defines a class that provides a context to respond a message/interaction sent from Discord.
 * @param { CommandOptions } options - Options for the command.
 */
export function Command(options: CommandOptions): ClassDecorator {
    if (!options.name || !options.group) {
        throw new Error(`Command ${options.name ? 'name' : 'group'} is required.`);
    }
    return (target: object) => {
        Reflect.defineMetadata(COMMAND_WATERMARK, true, target);
        Reflect.defineMetadata(COMMAND_METADATA, options, target);
    };
}
