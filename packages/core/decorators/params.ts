import { COMMAND_ARGS_METADATA } from '../constants/handler.js';
import { CommandParamTypes } from '../enums/command-types.enum.js';
import type { ParamMetadata } from '../interfaces/handler/param-metadata.js';

export function createCommandParamDecorator(paramType: CommandParamTypes) {
    return function (data?: unknown): ParameterDecorator {
        return (target, key, index) => {
            const existing =
                (Reflect.getMetadata(COMMAND_ARGS_METADATA, target.constructor, key as string) as
                    | ParamMetadata[]
                    | undefined) ?? [];

            existing.push({ index, type: paramType, data });
            Reflect.defineMetadata(COMMAND_ARGS_METADATA, existing, target.constructor, key as string);
        };
    };
}

export function Context(options?: { passThrough?: boolean }): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.CONTEXT)(options);
}

export function Guild(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.GUILD)();
}

export function Author(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.AUTHOR)();
}
