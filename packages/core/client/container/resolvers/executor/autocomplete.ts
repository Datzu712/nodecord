import { ExecutionKind } from '../../../../constants/execution-kind.js';
import type { BaseExecuteOptions } from '../../../../interfaces/handler/execute-options.js';
import type { AutocompleteExecuteOptions } from '../../../../interfaces/handler/executions/autocomplete.js';
import type { ExecutorMetadata } from '../../../../interfaces/handler/executor-metadata.js';
import type { Constructor } from '../../../../interfaces/index.js';
import { InvalidAutocompleteContextException } from '../../../exceptions/module.js';

export function compileAutocompleteExecutor({
    baseOptions,
    entrypointExecutor, // aka ExecuteOptions for `execute` entrypoint method
    subExecutor, // options for the sub executor function for handling an specific autocomplete interaction
    target,
}: {
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

    return {
        ...baseOptions,
        targetOptions: subExecutor.data as string[],
        kind: subExecutor.kind,
    };
}
