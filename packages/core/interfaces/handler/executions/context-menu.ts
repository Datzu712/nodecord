import { RepliableExecuteOptions } from '../execute-options.js';

export interface ContextMenuExecuteOptions extends RepliableExecuteOptions {
    kind: 'contextMenu';
}
