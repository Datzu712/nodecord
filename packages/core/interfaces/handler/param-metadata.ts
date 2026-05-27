import { CommandParamTypes } from '../../constants/command-types.js';

export interface BaseParamMetadata {
    index: number;
    type: CommandParamTypes;
    data?: unknown;
}

export interface ContextParamMetadata extends BaseParamMetadata {
    type: 'CONTEXT';
    data: {
        passThrough?: boolean;
    };
}

export interface OptionParamMetadata extends BaseParamMetadata {
    type: 'OPTION';
    data: string[];
}

export type ParamMetadata = ContextParamMetadata | OptionParamMetadata;
