import { InteractionContext } from '../../context/interaction-context.js';
import { RegisteredCommandHandler } from './command-handler.js';

export interface BaseCommandFlow {
    execute(ctx: InteractionContext, cmd: RegisteredCommandHandler): Promise<void>;
}
