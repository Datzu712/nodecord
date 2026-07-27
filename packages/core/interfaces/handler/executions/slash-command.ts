import { RepliableExecuteOptions } from '../execute-options.js';

export interface SlashCommandExecuteOptions extends RepliableExecuteOptions {
    kind: 'slashCommand';
}
