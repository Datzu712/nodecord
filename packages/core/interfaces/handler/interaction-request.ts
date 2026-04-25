import type { HandlerTypes } from '../../enums/command-types.enum.js';

export interface InteractionRequest {
    readonly name: string;
    readonly type: HandlerTypes;
}
