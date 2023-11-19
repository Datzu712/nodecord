import { Logger } from '../../services/logger.service';
import type { DefinedCommand } from '../../interfaces/command/defined-command.interface';
import { CommandTypes } from '../../enums/command-types.enum';
import { CommandParamTypes } from '../../enums/command-param-types.enum';
// import type { CommandManager } from './command.manager';
import { ExceptionCatcher } from '../../helpers/catch-exception';

export interface executionOptions {
    command: DefinedCommand;
    type: CommandTypes;
    arg: any;
}

export class ExecutionManager {
    private logger = new Logger('ExecutionManager');

    // constructor(private commands: CommandManager) {}

    public async run(options: executionOptions) {
        const commandArguments = [] as any[];

        for (const param of options.command.params) {
            if (param.type === CommandParamTypes.CONTEXT) {
                commandArguments[param.index] = options.arg;
            }
        }

        return ExceptionCatcher.asyncRun(
            async () => {
                options.command.execute(...commandArguments);
            },
            () => undefined, // todo
        );
    }
}
