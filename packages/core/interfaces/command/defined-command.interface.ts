import type { CommandMetadata } from './command-metadata.interface';

export interface DefinedCommand extends CommandMetadata {
    params: any[];
}
