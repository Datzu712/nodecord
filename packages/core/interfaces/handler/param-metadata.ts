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

export interface AuthorParamMetadata extends BaseParamMetadata {
    type: 'AUTHOR';
}

export interface GuildParamMetadata extends BaseParamMetadata {
    type: 'GUILD';
}

export type ParamMetadata = ContextParamMetadata | OptionParamMetadata | AuthorParamMetadata | GuildParamMetadata;
