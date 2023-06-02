import type { PipeExecutable } from 'interfaces/pipe-executable.interface';
import type { ParamData } from './command-params.decorator';
import type { Type } from 'interfaces/type.interface';

export function assignCustomMetadata<TContext = any, TFactoryReturn = any>({
    args,
    paramType,
    paramIndex,
    data,
    pipes,
    factory,
}: {
    args: any;
    paramType: number | string;
    paramIndex: number;
    data: ParamData;
    pipes: (PipeExecutable | Type<PipeExecutable>)[];
    factory: (context: TContext) => TFactoryReturn;
}) {
    return {
        ...args,
        [`${paramType}:${paramIndex}`]: {
            index: paramIndex,
            data,
            pipes,
            factory,
        },
    };
}
