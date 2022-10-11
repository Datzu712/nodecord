import { CommandParamTypes } from '../../enums';
import { COMMAND_ARGS_METADATA } from '../../constants';
import type { PipeExecutable, Type } from '../../interfaces';

export type ParamData = object | string | number;

function assignMetadata<TParamType = any, TArgs = any>(
    args: TArgs,
    paramType: TParamType,
    index: number,
    data?: ParamData,
    ...pipes: (PipeExecutable | Type<PipeExecutable>)[]
) {
    return {
        ...args,
        [`${paramType}:${index}`]: {
            index,
            data,
            pipes,
        },
    };
}
function createCommandParamDecorator(paramType: CommandParamTypes) {
    return function (data?: object | string | number, ...pipes: (PipeExecutable | Type<PipeExecutable>)[]) {
        // TODO: This evaluations must be inside the core
        if (pipes.length) {
            pipes = pipes.map((pipe) => (pipe.constructor === Function ? new (pipe as Type<PipeExecutable>)() : pipe));

            pipes.forEach((pipe) => {
                if (typeof (pipe as PipeExecutable).run !== 'function') {
                    throw new Error('Pipe must have execute method');
                }
            });
        }
        return (target: object, key: string | symbol, index: number) => {
            const commandArgs = Reflect.getMetadata(COMMAND_ARGS_METADATA, target.constructor, key) || {};
            Reflect.defineMetadata(
                COMMAND_ARGS_METADATA,
                assignMetadata(commandArgs, paramType, index, data, ...pipes),
                target.constructor,
                key,
            );
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
 *
 * @param { pipe[] } pipes - pipes to apply to the parameter. See [pipes](https://github.com/Datzu712/nodecord) (TODO) for more info.
 */
export function Message(...pipes: (PipeExecutable | Type<PipeExecutable>)[]): ParameterDecorator;

/**
 * Command handler parameter decorator. Extracts the `Message` object from the event `MessageCreate.
 * Example: `execute(@Message() message)`
 *
 * @param { pipe[] } pipes - pipes to apply to the parameter. See (pipes)[https://github.com/Datzu712/nodecord] for more info.
 */
export function Message(...pipes: (PipeExecutable | Type<PipeExecutable>)[]): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.MESSAGE)(undefined, ...pipes);
}

export const Msg = Message;
