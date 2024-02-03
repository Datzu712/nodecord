import { Type } from '../type.interface';
import { CommandParamTypes } from '../../enums/command-param-types.enum';
import { PipeExecutable } from '../pipe-executable.interface';

export type ParamData = object | string | number;

export interface ParamMetadata {
    /**
     * Index of parameter in the method signature.
     */
    index: number;
    /**
     * Parameter type.
     */
    type: CommandParamTypes;
    /**
     * Additional parameter data.
     */
    data?: ParamData;
    /**
     * Pipes that will be used to transform the received value.
     */
    pipes: (PipeExecutable | Type<PipeExecutable>)[];
}
