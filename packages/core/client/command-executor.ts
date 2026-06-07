import { CommandAutocompleteFlow } from './command-flows/autocomplete.flow.js';

import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { InteractionContext } from '../context/interaction-context.js';
import type { RegisteredCommandHandler } from '../interfaces/index.js';
import type { BaseCommandFlow } from '../interfaces/handler/base-command-flow.js';
import type { ExecutionKind } from '../constants/execution-kind.js';

export class CommandExecutor {
    private readonly commandFlows = new Map<ExecutionKind, BaseCommandFlow>();

    constructor(
        private readonly logger: AbstractLogger,
        private readonly commandHandlers: RegisteredCommandHandler[],
    ) {
        this.commandFlows.set('autocomplete', new CommandAutocompleteFlow(logger));
    }

    async execute(ctx: InteractionContext): Promise<void> {
        // todo: changing this to a map would make it O(1) instead of O(n)
        const cmd = this.commandHandlers.find((cmd) => cmd.metadata.name === ctx.name);
        if (!cmd) return;

        const flow = this.commandFlows.get(ctx.type);
        if (!flow) {
            this.logger.warn(
                `No command flow registered for execution kind "${ctx.type}". Skipping command execution for command "${ctx.name}".`,
                'CommandExecutor',
            );
            return;
        }

        await flow.execute(ctx, cmd);
    }

    public overrideFlow(kind: ExecutionKind, flow: BaseCommandFlow): void {
        this.commandFlows.set(kind, flow);
    }
}
