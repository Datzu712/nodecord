import { CommandParamTypes } from '../../enums';
import { COMMAND_ARGS_METADATA } from '../../constants/command';
import type { ParamMetadata, PipeExecutable, Type } from '../../interfaces';

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
 * Command handler parameter decorator. Extracts the main argument from the target event (Message or InteractionCreate).
 * Example: `execute(@Context() message: Message)`
 */
export function Context(): ParameterDecorator;

/**
 * Command handler parameter decorator. Extracts the main argument from the target event (Message or InteractionCreate).
 * @example ```ts
 * // Legacy commands with message event
 * execute(@Context() message: Message)
 *
 * // Slash commands with interactionCreate event
 * execute(@Context() interaction: Interaction)
 * ```
 */
export function Context(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.CONTEXT)();
}

/**
 * Client parameter decorator. Gets the client that wrapper is using.
 * Example: `execute(@Client() client: Client)`
 */
export function Client(): ParameterDecorator;

/**
 * Client parameter decorator. Gets the client that wrapper is using.
 * @example ```ts
 * execute(@Client() client: djsClient)
 *
 * execute(@Client() client: BiscuitSession)
 * ```
 */
export function Client(): ParameterDecorator {
    return createCommandParamDecorator(CommandParamTypes.CLIENT)();
}

/**
 * Alias for `@Context()`
 */
export const Ctx = Context;
/**
 * Alias for `@Client()`
 */
export const LibClient = Client;
