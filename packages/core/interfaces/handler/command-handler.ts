import type { RegisteredInterceptor } from '../interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../exception-handler/exception-handler.js';
import { ExecuteOptions } from './execute-options.js';
import { ApplicationCommandTypes } from '../../constants/application-command-types.js';

/**
 * Defines the kind of interaction an executor handles within a handler's interaction flow.
 * Each kind may expose different options, repliable interactions (slashCommand, contextMenu, button, modal)
 * extend {@link RepliableExecuteOptions}, while non-repliable ones (autocomplete) extend {@link BaseExecuteOptions} directly,
 * since Discord does not allow defer or ephemeral responses for those interaction types.
 *
 * todo: move constant to packages/core/constants
 */
export const ExecutionKind = {
    // Entrypoints:
    SLASH_COMMAND: 'slashCommand', // CHAT_INPUT type 1
    CONTEXT_MENU: 'contextMenu', // USER type 2 or MESSAGE type 3

    // Sub interactions that might be triggered by the entrypoint:
    BUTTON: 'button',
    AUTOCOMPLETE: 'autocomplete',
} as const;

export type ExecutionKind = (typeof ExecutionKind)[keyof typeof ExecutionKind];

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
 * At "compile" time we don't know anything about infrastructure or DI.
 * That's why we need a separate interface to represent the minimum contract of a handler
 */
export interface CompiledCommandHandler {
    metadata: CommandHandlerMetadata;
    // definition: APIApplicationCommand; We can add this later because it is not needed in runtime to know the exact shape of the command definition for discord api

    /**
     * Map<executor method key, ExecuteOptions>.
     */
    executions: Map<string, ExecuteOptions>;
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
