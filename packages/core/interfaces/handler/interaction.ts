import type { HandlerTypes } from '../../enums/command-types.enum.js';

export interface Interaction {
    readonly name: string;
    readonly type: HandlerTypes;
}
