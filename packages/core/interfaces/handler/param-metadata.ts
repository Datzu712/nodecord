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
    data: string[] | [string]; // target option name. If multiple option names are provided, the output will be an array of options instead of a single option.
}

export interface AuthorParamMetadata extends BaseParamMetadata {
    type: 'AUTHOR';
}

export interface GuildParamMetadata extends BaseParamMetadata {
    type: 'GUILD';
}

export interface FocusedOptionParamMetadata extends BaseParamMetadata {
    type: 'FOCUSED_OPTION';
}

export type ParamMetadata =
    | ContextParamMetadata
    | OptionParamMetadata
    | AuthorParamMetadata
    | GuildParamMetadata
    | FocusedOptionParamMetadata;
