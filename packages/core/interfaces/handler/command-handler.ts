import type { HandlerTypes } from '../../enums/command-types.enum.js';
import type { RegisteredInterceptor } from '../interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../exception-handler/exception-handler.js';
import { ParamMetadata } from './param-metadata.js';

export type AutocompleteEntry = [methodName: string, options: string[]];

export interface HandlerMetadata<TDefinition = unknown> {
    id: string;
    type: HandlerTypes;
    definition: TDefinition;
}

export interface CommandHandler {
    execute(...args: unknown[]): any;
}

export interface ExecuteOptions {
    /** If true, the framework will defer the reply to the interaction before executing the handler. */
    shouldDefer: boolean;

    /** If true, the framework will not attempt to send a response after the handler execution, leaving it up to the handler to manage the interaction response. */
    shouldPassThrough: boolean;

    params: ParamMetadata[];
}

/**
 * At "compile" time we don't know anything about infrastructure or DI.
 * That's why we need a separate interface to represent the minimum contract of a handler
 */
export interface CompiledCommandHandler<TDefinition = unknown> {
    metadata: HandlerMetadata<TDefinition>;
    executeOptions: ExecuteOptions;
    autocompleteEntries: AutocompleteEntry[];
}

/**
 * Minimum contract the core needs to use handlers.
 *
 * @todo
 * - Move command registration (REST deploy) into core as a standalone feature,
 *   since it's a standard Discord API call not tied to any specific adapter.
 *   This would introduce a direct dev dependency on `discord-api-types` in the core,
 *   which is acceptable given the framework is discord only and `discord-api-types`
 *   represents the protocol contract, not an implementation detail related with the adapter.
 * - Revisit versioning strategy if multi-version API support becomes a requirement.
 *
 */
export interface RegisteredCommandHandler<TDefinition = unknown> extends CompiledCommandHandler<TDefinition> {
    // instance with their dependencies resolved, ready to be executed by the framework.
    handler: CommandHandler;

    // infra
    interceptors: RegisteredInterceptor[];
    exceptionHandlers: RegisteredExceptionHandler[];
}
