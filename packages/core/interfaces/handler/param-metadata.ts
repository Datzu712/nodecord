import type { CommandParamTypes } from '../../enums/command-types.enum.js';

export interface BaseParamMetadata {
    index: number;
    type: CommandParamTypes;
    data?: unknown;
}

export interface ContextParamMetadata {
    type: CommandParamTypes.CONTEXT;
    data: {
        passThrough?: boolean;
    };
}

export interface OptionParamMetadata {
    type: CommandParamTypes.OPTION;
    data: string[];
}

export type ParamMetadata = ContextParamMetadata | OptionParamMetadata;
