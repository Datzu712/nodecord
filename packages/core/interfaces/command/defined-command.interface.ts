import type { CommandMetadata } from './command-metadata.interface';
import type { ICommand } from './command.interface';

export type DefinedCommand = ICommand & CommandMetadata;
