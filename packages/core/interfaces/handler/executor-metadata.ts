import { type ExecutionKind } from '../../constants/execution-kind.js';

/**
 * Metadata for a sub-interaction executor method within a handler.
 * Each executor handles a specific interaction kind (e.g. autocomplete, button)
 * that is part of the handler's interaction flow.
 *
 * Note: the `execute` method is not stored here, its ExecuteOptions are inferred
 * by the compiler from the handler's HANDLER_WATERMARK.
 */
export type ExecutorMetadata<K extends ExecutionKind = ExecutionKind> = { kind: K; methodKey: string; data: unknown };
