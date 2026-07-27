import type { InteractionContext } from '../../context/interaction-context.js';
import type { Constructor } from '../common/constructor.js';

export interface ExceptionHandler {
    handle(exception: unknown, context: InteractionContext): void | Promise<void>;
}

export interface ExceptionHandlerMetadata {
    id: string;
    exceptions: Constructor[];
}

export interface RegisteredExceptionHandler {
    handler: ExceptionHandler;
    metadata: ExceptionHandlerMetadata;
}
