import type { RegisteredInterceptor } from '../interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../exception-handler/exception-handler.js';
import { ExecuteOptions } from './execute-options.js';
import { ApplicationCommandTypes } from '../../constants/application-command-types.js';

export interface CommandHandler {
    /**
     * Entry point for the interaction flow. The framework will call this method with the resolved arguments when the interaction (slash commands, context menus) is received.
     */
    execute(...args: unknown[]): any;
}

/**
 * Basic metadata about a command handler, used for registration and execution.
 * https://docs.discord.com/developers/interactions/application-commands#application-command-object
 *
 * todo: add missing name_localizations, guildId, description_localizations, default_member_permissions, etc...
 */
export interface CommandHandlerMetadata {
    id: string; // internal framework ID

    /**
     * Name of command, 1-32 characters and should match `^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$` regex.
     */
    name: string;

    /**
     * Description for `CHAT_INPUT` commands, 1-100 characters.
     */
    description: string;
    nsfw?: boolean;
    applicationCommandType: ApplicationCommandTypes;
}

/**
 * Anything exposing a `toJSON()` method (e.g. a discord.js `SlashCommandBuilder`) can be passed to
 * `@SlashCommand()`. Detected structurally (duck-typing), never via `instanceof`, so `packages/core`
 * never has to import discord.js or any `@discordjs/*` package.
 */
export interface CommandDefinitionBuilder {
    toJSON(): unknown;
}

/**
 * Argument accepted by `@SlashCommand()`: either a builder exposing `toJSON()`, or a plain object
 * (at minimum `name`/`description`, plus any adapter-specific fields such as `type`, `options`, `nsfw`, etc.).
 */
export type SlashCommandDefinition =
    | CommandDefinitionBuilder
    | (Omit<CommandHandlerMetadata, 'id' | 'applicationCommandType'> & Record<string, unknown>);

/**
 * At "compile" time we don't know anything about infrastructure or DI.
 * That's why we need a separate interface to represent the minimum contract of a handler
 */
export interface CompiledCommandHandler {
    metadata: CommandHandlerMetadata;

    /**
     * The original object or builder passed to `@SlashCommand()`, preserved by identity so adapters
     * can use it as-is for command registration (e.g. a discord.js `SlashCommandBuilder` instance).
     */
    definition: unknown;

    /**
     * Map<executor method key, ExecuteOptions>.
     */
    executors: [executorMethodKey: string, executorOptions: ExecuteOptions][];
}

/**
 * Minimum contract the core needs to use handlers without knowing the implementation details.
 */
export interface RegisteredCommandHandler extends CompiledCommandHandler {
    // instance with their dependencies resolved, ready to be executed by the framework.
    handler: CommandHandler;

    // infra
    interceptors: RegisteredInterceptor[];
    exceptionHandlers: RegisteredExceptionHandler[];
}
