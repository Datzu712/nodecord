import { Logger, type DefinedCommand, CommandTypes, CommandParamTypes } from '@nodecord/core';
import type { CommandManager } from '@nodecord/core/managers/command.manager';

export interface executionOptions {
    command: DefinedCommand;
    type: CommandTypes;
    arg: any;
}

export class ExecutionManager {
    private logger = new Logger('ExecutionManager');

    constructor(private commands: CommandManager) {}

    public run(options: executionOptions) {
        const commandArguments = [] as any[];

        for (const param of options.command.params) {
            if (param.type === CommandParamTypes.CONTEXT) {
                commandArguments[param.index] = options.arg;
            }
        }

        options.command.execute(...commandArguments);
    }
}
