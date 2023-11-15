import { CommandMetadata } from '../../interfaces/command/command-metadata.interface';
import { COMMAND_WATERMARK, COMMAND_METADATA } from '../../constants/command';
import type { MarkOptional } from 'ts-essentials';
import { CommandTypes } from '../../enums';

/**
 * Interface defining the options that can be passed `@SlashCommand()` decorator
 */
export type SlashCommandOptions = Omit<MarkOptional<CommandMetadata['metadata'], 'aliases'>, 'category' | 'execute'> & {
    options: any;
};
/**
 * Decorator that marks a class as a command for Nodecord and receive a `Interaction` from discord
 * and produce responses.
 *
 * An Command can receive a `Interaction` from Discord, and make a response.
 * It defines a class that provides a context to respond a interaction sent from Discord.
 * @param { CommandOptions } options - Options for the command.
 */
export function SlashCommand(options: SlashCommandOptions): ClassDecorator;

/**
 * Decorator that marks a class as a command for Nodecord and receive a `Interaction` from discord
 * and produce responses.
 *
 * An Command can receive a `Interaction` from Discord, and make a response.
 * It defines a class that provides a context to respond a interaction sent from Discord.
 * @param { CommandOptions } options - Options for the command.
 */
export function SlashCommand(options: SlashCommandOptions): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(COMMAND_WATERMARK, { type: CommandTypes.SLASH }, target);
        Reflect.defineMetadata(COMMAND_METADATA, options, target);
    };
}
