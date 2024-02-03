import { Logger } from '../../services/logger.service';
import type { DefinedCommand } from '../../interfaces/command/defined-command.interface';
import { CommandTypes } from '../../enums/command-types.enum';
import { CommandParamTypes } from '../../enums/command-param-types.enum';
import { AbstractClientAdapter } from '../../interfaces/client/clientAdapter-abstract.interface';

export interface executionOptions {
    command: DefinedCommand;
    type: CommandTypes;
    arg: any;
}

export class ExecutionManager {
    private logger = new Logger('ExecutionManager');

    constructor(private adapter: AbstractClientAdapter) {}

    public async run(options: executionOptions) {
        const commandArguments = [] as any[];

        for (const param of options.command.params) {
            let arg: any = undefined;
            if (param.type === CommandParamTypes.CONTEXT) {
                arg = options.arg;
            } else if (param.type === CommandParamTypes.CLIENT) {
                arg = this.adapter.getClient();
            }
            commandArguments[param.index] = arg;
        }
        return options.command.execute(...commandArguments);
    }
}
