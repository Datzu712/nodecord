import type { CommandParamTypes } from 'enums/command-paramTypes.enum';
import type { PipeExecutable } from 'interfaces/pipe-executable.interface';
import type { Type } from 'interfaces/type.interface';
import { assignCustomMetadata } from './assign-custom-metadata';
import { COMMAND_ARGS_METADATA } from '../../constants/command';

export function createCustomCommandParamDecorator<TContext, TReturn>(
    paramType: CommandParamTypes,
    execute: (args: TContext) => TReturn,
) {
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
            const args = Reflect.getMetadata(COMMAND_ARGS_METADATA, target.constructor, key as string) || {};
            Reflect.defineMetadata(
                COMMAND_ARGS_METADATA,
                assignCustomMetadata<TContext, TReturn>({
                    args,
                    paramType,
                    paramIndex: index,
                    data,
                    pipes,
                    factory: execute,
                }),
                target.constructor,
                key as string,
            );
        };
    };
}
