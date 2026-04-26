import { HandlerTypes } from '../../enums/command-types.enum.js';
import { NodecordInterceptor } from '../interceptor/interceptor.js';

export interface HandlerMetadata {
    id: string;
    type: HandlerTypes;
    descriptor: unknown;
}

export interface CommandHandler {
    execute(...args: unknown[]): any;
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
export interface RegisteredCommandHandler<TMetadata = unknown> {
    type: HandlerTypes;
    handler: CommandHandler;
    descriptor: TMetadata;
    interceptors: NodecordInterceptor[];
}
