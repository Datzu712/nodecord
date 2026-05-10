import type { ExecutionContext } from '../../context/execution-context.js';
import type { Constructor } from '../common/constructor.js';

export interface ExceptionHandler {
    handle(exception: unknown, context: ExecutionContext): void | Promise<void>;
}

export interface ExceptionHandlerMetadata {
    id: string;
    exceptions: Constructor[];
}

export interface RegisteredExceptionHandler {
    handler: ExceptionHandler;
    metadata: ExceptionHandlerMetadata;
}
