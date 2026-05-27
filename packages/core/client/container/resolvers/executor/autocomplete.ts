import { CommandParamTypes } from '../../../../constants/command-types.js';
import { ExecutionKind } from '../../../../constants/execution-kind.js';
import { BaseExecuteOptions } from '../../../../interfaces/handler/execute-options.js';
import { AutocompleteExecuteOptions } from '../../../../interfaces/handler/executions/autocomplete.js';
import { ExecutorMetadata } from '../../../../interfaces/handler/executor-metadata.js';
import type { Constructor, ParamMetadata } from '../../../../interfaces/index.js';
import { InvalidAutocompleteContextException, InvalidOptionContextException } from '../../../exceptions/module.js';

export function compileAutocompleteExecutor({
    baseOptions,
    entrypointExecutor, // aka ExecuteOptions for `execute` entrypoint method
    subExecutor,
    target,
    params,
}: {
    params: ParamMetadata[];
    baseOptions: Omit<BaseExecuteOptions, 'kind'>;
    entrypointExecutor: ExecutorMetadata;
    subExecutor: ExecutorMetadata<'autocomplete'>;
    target: Constructor;
}): AutocompleteExecuteOptions {
    if (entrypointExecutor?.kind !== ExecutionKind.SLASH_COMMAND) {
        throw new InvalidAutocompleteContextException({
            methodName: subExecutor.methodKey,
            targetOptions: subExecutor.data as string[],
            className: target.name,
        });
    }

    // @Options() decorator is only allowed in the entrypoint executor (CommandHandler#`execute`).
    if (params.some((param) => param.type === CommandParamTypes.OPTION)) {
        throw new InvalidOptionContextException({
            methodName: subExecutor.methodKey,
            focusedOptions: subExecutor.data as string[],
            className: target.name,
        });
    }

    return {
        ...baseOptions,
        focusedOptions: subExecutor.data as string[],
        kind: subExecutor.kind,
    };
}
