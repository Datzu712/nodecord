import type { CommandMetadata } from './command-metadata.interface';
import { ParamMetadata } from './command-param-metadata.interface';

export interface DefinedCommand extends CommandMetadata {
    params: ParamMetadata[];
}
