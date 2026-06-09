import { SUB_EXECUTIONS_METADATA } from '../constants/handler.js';
import { ExecutionKind } from '../constants/execution-kind.js';
import { ExecutorMetadata } from '../interfaces/handler/executor-metadata.js';

export function Autocomplete(option: string): MethodDecorator {
    return (target, methodKey) => {
        const currentExecutors =
            (Reflect.getMetadata(SUB_EXECUTIONS_METADATA, target.constructor) as ExecutorMetadata[]) ?? [];

        currentExecutors.push({ kind: ExecutionKind.AUTOCOMPLETE, methodKey: methodKey.toString(), data: option });

        // we don't store the metadata in the key method namespace because there is not a way to infer the method name in runtime without a explicit contract.
        // so its better just to store it in the constructor namespace
        Reflect.defineMetadata(SUB_EXECUTIONS_METADATA, currentExecutors, target.constructor);
    };
}
