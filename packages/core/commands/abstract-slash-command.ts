import { AbstractCommand } from './abstract-command.js';

export abstract class AbstractSlashCommand extends AbstractCommand {
    readonly global?: boolean;
    readonly options?: unknown;
}
