import type { ExecutionKind } from '../../constants/execution-kind.js';

// todo: check if this interface is still needed...
export interface InteractionRequest {
    readonly name: string;
    readonly type: ExecutionKind;
}
