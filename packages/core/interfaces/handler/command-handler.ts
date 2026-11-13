import type { RegisteredInterceptor } from '../interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../exception-handler/exception-handler.js';
import { ExecuteOptions } from './execute-options.js';
import { ApplicationCommandTypes } from '../../constants/application-command-types.js';
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

export interface CommandHandler {
    /**
     * Entry point for the interaction flow. The framework will call this method with the resolved arguments when the interaction (slash commands, context menus) is received.
     */
    execute(...args: unknown[]): any;
}

/**
 * Metadata about a command handler, used for registration and execution. It is the command definition as the
 * Discord API expects it, plus the fields the framework needs internally.
 * https://docs.discord.com/developers/interactions/application-commands#application-command-object
 *
 * todo: add guildId
 */
export interface CommandHandlerMetadata extends Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type'> {
    id: string; // internal framework ID
    applicationCommandType: ApplicationCommandTypes;
}

/**
 * At "compile" time we don't know anything about infrastructure or DI.
 * That's why we need a separate interface to represent the minimum contract of a handler
 */
export interface CompiledCommandHandler {
    metadata: CommandHandlerMetadata;
    // definition: APIApplicationCommand; We can add this later because it is not needed in runtime to know the exact shape of the command definition for discord api

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
