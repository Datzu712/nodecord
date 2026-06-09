export const CommandParamTypes = {
    CONTEXT: 'CONTEXT',
    GUILD: 'GUILD',
    AUTHOR: 'AUTHOR',
    OPTION: 'OPTION',
    FOCUSED_OPTION: 'FOCUSED_OPTION',
    CUSTOM: 'CUSTOM',
} as const;

export type CommandParamTypes = (typeof CommandParamTypes)[keyof typeof CommandParamTypes];
