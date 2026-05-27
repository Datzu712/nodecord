import { COMMAND_ARGS_METADATA } from '../constants/handler.js';
import { CommandParamTypes } from '../constants/command-types.js';
import type { BaseParamMetadata } from '../interfaces/handler/param-metadata.js';

export function createCommandParamDecorator(paramType: CommandParamTypes) {
    return function (data?: unknown): ParameterDecorator {
        return (target, methodKey, index) => {
            const existing =
                (Reflect.getMetadata(
                    COMMAND_ARGS_METADATA,
                    target.constructor,
                    methodKey as string,
                ) as BaseParamMetadata[]) ?? [];

            existing.push({ index, type: paramType, data });
            Reflect.defineMetadata(COMMAND_ARGS_METADATA, existing, target.constructor, methodKey as string);
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

export const Ctx = Context;

export function Option(...name: string[]): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.OPTION)(name);
}
