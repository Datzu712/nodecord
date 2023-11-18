import { CommandParamTypes } from '../../enums';
import { COMMAND_ARGS_METADATA } from '../../constants/command';
import type { PipeExecutable, Type } from '../../interfaces';

export type ParamData = object | string | number;

// function assignMetadata<TParamType = any, TArgs = any>(
//     args: TArgs,
//     paramType: TParamType,
//     index: number,
//     data?: ParamData,
//     ...pipes: (PipeExecutable | Type<PipeExecutable>)[]
// ) {
//     return {
//         ...args,
//         [`${paramType}:${index}`]: {
//             index,
//             data,
//             pipes,
//         },
//     };
// }

type ParamMetadata = {
    /**
     * Index of parameter in the method signature.
     */
    index: number;
    /**
     * Parameter type.
     */
    type: CommandParamTypes;
    /**
     * Additional parameter data.
     */
    data?: ParamData;
    /**
     * Pipes that will be used to transform the received value.
     */
    pipes: (PipeExecutable | Type<PipeExecutable>)[];
};

function createCommandParamDecorator(paramType: CommandParamTypes) {
    return function (data?: any, ...pipes: (PipeExecutable | Type<PipeExecutable>)[]): ParameterDecorator {
        return function (target, key, index) {
            if (pipes.length) {
                pipes = pipes.map(function (pipe) {
                    return pipe.constructor === Function ? new (pipe as Type<PipeExecutable>)() : pipe;
                });

                pipes.forEach(function (pipe) {
                    if (typeof (pipe as PipeExecutable).run !== 'function') {
                        throw new Error('Pipe must have execute method');
                    }
                });
            }
            const commandArgs: ParamMetadata[] =
                Reflect.getMetadata(COMMAND_ARGS_METADATA, target.constructor, key as string) || [];

            commandArgs.push({
                index,
                type: paramType,
                data,
                pipes,
            });

            Reflect.defineMetadata(COMMAND_ARGS_METADATA, commandArgs, target.constructor, key as string);
        };
    };
}

/**
 * Command handler parameter decorator. Extracts the `Message` object from the event `MessageCreate.
 * Example: `execute(@Message() message)`
 */
export function Message(): ParameterDecorator;

/**
 * Command handler parameter decorator. Extracts the `Message` object from the event `MessageCreate.
 * Example: `execute(@Message() message)`
 */
export function Message(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.MESSAGE)();
}

/**
 * Command handler parameter decorator. Extracts the 'Interaction' object from the event 'InteractionCreate'.
 * Example: `execute(@Interaction() interaction)`
 */
export function Interaction(): ParameterDecorator;

/**
 * Command handler parameter decorator. Extracts the 'Interaction' object from the event 'InteractionCreate'.
 * Example: `execute(@Interaction() interaction)`
 */
export function Interaction(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.INTERACTION)();
}

export const Msg = Message;
