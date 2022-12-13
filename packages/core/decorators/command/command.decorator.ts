import { CommandMetadata } from '../../interfaces/command/command-metadata.interface';
import { COMMAND_WATERMARK, COMMAND_METADATA } from '../../constants/command';
import type { MarkOptional } from 'ts-essentials';

/**
 * Interface defining the options that can be passed `@Command()` decorator
 */
export type CommandOptions = Omit<MarkOptional<CommandMetadata['metadata'], 'aliases'>, 'category' | 'execute'>;
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
    return (target: object) => {
        Reflect.defineMetadata(COMMAND_WATERMARK, true, target);
        Reflect.defineMetadata(COMMAND_METADATA, options, target);
    };
}
