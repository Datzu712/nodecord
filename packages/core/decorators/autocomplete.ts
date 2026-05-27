import { EXECUTIONS_METADATA } from '../constants/handler.js';
import { ExecutionKind } from '../constants/execution-kind.js';

export function Autocomplete(...options: string[]): MethodDecorator {
    return (target, methodKey) => {
        const currentExecutors =
            (Reflect.getMetadata(EXECUTIONS_METADATA, target.constructor) as [
                string,
                { kind: ExecutionKind; methodKey: string; data: unknown },
            ][]) || [];

        currentExecutors.push([
            methodKey.toString(),
            { kind: ExecutionKind.AUTOCOMPLETE, methodKey: methodKey.toString(), data: options },
        ]);

        // we don't store the metadata in the key method namespace because there is not a way to infer the method name in runtime without a explicit contract.
        // so its better just to store it in the constructor namespace
        Reflect.defineMetadata(EXECUTIONS_METADATA, currentExecutors, target.constructor);
    };
}
