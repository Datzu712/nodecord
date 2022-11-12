import type { CommandMetadata } from './';

export interface ICommand extends CommandMetadata {
    /**
     * Method to implement the logic of the command.
     * To pass arguments to this function, use the commands [parameters decorators](google.com).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(...args: any[]): Promise<any> | any;
}
