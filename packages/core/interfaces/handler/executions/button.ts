import { RepliableExecuteOptions } from '../execute-options.js';

export interface ButtonExecuteOptions extends RepliableExecuteOptions {
    kind: 'button';
    customId: string;
}
