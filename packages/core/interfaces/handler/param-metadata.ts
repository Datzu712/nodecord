import type { CommandParamTypes } from '../../enums/command-types.enum.js';

export interface ParamMetadata {
    index: number;
    type: CommandParamTypes;
    data?: unknown;
}
