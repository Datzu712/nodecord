/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandParamTypes } from '../../enums';
import { PARAM_TYPES_METADATA } from '../../constants';

export type ParamData = object | string | number;

// TODO
type pipe = {
    execute: (data: any) => any;
};

export function assignMetadata<TParamType = any, TArgs = any>(
    args: TArgs,
    paramType: TParamType,
    index: number,
    data?: ParamData,
    ...pipes: pipe[]
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

function createCommandParamDecorator(paramType: CommandParamTypes, ...pipes: pipe[]) {
    return function (data?: object | string | number) {
        return (target: object, key: string | symbol, index: number) => {
            const commandArgs = Reflect.getMetadata(PARAM_TYPES_METADATA, target.constructor, key) || {};
            Reflect.defineMetadata(
                PARAM_TYPES_METADATA,
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
export function Message(...pipes: pipe[]): ParameterDecorator;

/**
 * Command handler parameter decorator. Extracts the `Message` object from the event `MessageCreate.
 * Example: `execute(@Message() message)`
 *
 * @param { pipe[] } pipes - pipes to apply to the parameter. See (pipes)[https://github.com/Datzu712/nodecord] for more info.
 */
export function Message(...pipes: pipe[]): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.MESSAGE, ...pipes);
}

export const Msg = Message;
