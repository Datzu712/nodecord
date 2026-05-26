import { CommandParamTypes } from '../../../enums/command-types.enum.js';
import { CompiledCommandHandler, ExecutionKind } from '../../../interfaces/handler/command-handler.js';
import { ApplicationCommandTypes } from '../../../constants/application-command-types.js';
import { BaseExecuteOptions, ExecuteOptions } from '../../../interfaces/handler/execute-options.js';
import { ExecutorMetadata } from '../../../interfaces/handler/executor-metadata.js';
import { Constructor } from '../../../interfaces/index.js';
import { NodecordCoreException } from '../../exceptions/base.js';
import { InvalidHandlerException, MissingContractMethodException } from '../../exceptions/module.js';
import { MetadataScanner } from '../metadata-scanner.js';
import { compileAutocompleteExecutor } from './executor/autocomplete.js';
import { compileSlashCommandExecutor } from './executor/slash-command.js';

export function compileCommandHandlerMetadata(target: Constructor): CompiledCommandHandler {
    if (!MetadataScanner.isHandler(target)) {
        throw new InvalidHandlerException(target.name);
    }

    // This validation might be moved into compileSlashCommandExecutor, etc... because
    // the only responsibility of this function is to orchestrate the compilation of the handler metadata and not
    // validate the executors itself
    if (!('execute' in target.prototype)) {
        throw new MissingContractMethodException(target.name, 'CommandHandler', 'execute');
    }
    const executions = new Map<string, ExecuteOptions>();

    const rawEntrypointExecutorMetadata = MetadataScanner.getCommandHandlerEntrypointMetadata(target);
    if (!rawEntrypointExecutorMetadata) {
        throw new InvalidHandlerException(target.name);
    }

    let entrypointExecutor: ExecutorMetadata;

    switch (rawEntrypointExecutorMetadata.applicationCommandType) {
        case ApplicationCommandTypes.ChatInput: {
            const params = MetadataScanner.getHandlerExecutorParams(target, 'execute');
            const baseOptions: Omit<BaseExecuteOptions, 'kind'> = {
                passThrough: params.some(
                    (param) => param.type === CommandParamTypes.CONTEXT && param.data?.passThrough,
                ),
                params,
            };
            entrypointExecutor = {
                kind: ExecutionKind.SLASH_COMMAND,
                methodKey: 'execute',
                data: rawEntrypointExecutorMetadata,
            };
            executions.set('execute', compileSlashCommandExecutor({ target, baseOptions }));
            break;
        }
        default: {
            throw new NodecordCoreException(
                `Unknown applicationCommandType "${rawEntrypointExecutorMetadata.applicationCommandType}" for handler ${target.name}. Please open an issue if you are seeing this error.`,
            );
        }
    }

    const rawExecutors = MetadataScanner.getCommandHandlerExecutors(target);

    for (const subExecutor of rawExecutors) {
        if (subExecutor.methodKey === 'execute') {
            throw new InvalidHandlerException(target.name);
        }

        const params = MetadataScanner.getHandlerExecutorParams(target, subExecutor.methodKey);

        // kind is omitted here because at this point ts doesn't know the exact type
        // so later in the switch it won't assert the correct type
        const baseOptions: Omit<BaseExecuteOptions, 'kind'> = {
            passThrough: params.some((param) => param.type === CommandParamTypes.CONTEXT && param.data?.passThrough),
            params,
        };

        switch (subExecutor.kind) {
            case ExecutionKind.AUTOCOMPLETE: {
                executions.set(
                    subExecutor.methodKey,
                    compileAutocompleteExecutor({
                        baseOptions,
                        entrypointExecutor,
                        // I'm not sure why typescript doesn't narrow the type of subExecutor here, it should know that it is ExecutorMetadata<'autocomplete'> based on the switch case
                        // i would like to search if there is a way to avoid this type assertions in the future...
                        subExecutor: subExecutor as ExecutorMetadata<'autocomplete'>,
                        target,
                        params,
                    }),
                );
                break;
            }
            // @ts-expect-error - this case is a type guard for unexpected cases where some entrypoint executor is registered as a sub executor which should never happen
            // this happens because in sub executors the kind `slashCommand` is excluded from the possible values
            case ExecutionKind.SLASH_COMMAND: {
                /**
                 * SLASH_COMMAND executors should never appear in rawExecutors.
                 *
                 * The `execute` method is the designated entrypoint for slash commands and is registered
                 * separately in the handler's own metadata namespace, not alongside sub executors like
                 * @Autocomplete, @Button, etc.
                 *
                 * If this case is reached, it means a second @SlashCommand executor was registered outside
                 * of `execute`, which is invalid (and shouldn't be the case because it is a class-level decorator).
                 * Sub executors are defined via their own decorators (@Autocomplete, @Button, etc.) and compiled separately.
                 *
                 * This is likely a bug in MetadataScanner.
                 *
                 * todo: add tests covering this case
                 */
                throw new NodecordCoreException(
                    `Malformed CommandHandler ${target.name}: multiple slash command executors found. Please open an issue if you are seeing this error.`,
                );
                break;
            }
            case ExecutionKind.CONTEXT_MENU: {
                throw new Error('Not implemented yet');
                break;
            }
            case ExecutionKind.BUTTON: {
                throw new Error('Not implemented yet');
                break;
            }
        }
    }

    return {
        metadata: rawEntrypointExecutorMetadata,
        executions,
    };
}
