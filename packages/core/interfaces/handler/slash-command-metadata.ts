import type { AbstractCommand } from '../../commands/abstract-command.js';

export interface RegisteredSlashCommand {
    id: string;
    name: string;
    description: string;
    options?: unknown;
    global?: boolean;
    instance: AbstractCommand;
}

export type SlashCommandMetadata = Omit<RegisteredSlashCommand, 'instance' | 'id'>;
