import type { CommandRegistry } from './command-registry.js';

export class CommandExecutor {
    constructor(private readonly registry: CommandRegistry) {}

    async execute(ctx: any): Promise<unknown> {
        const handler = this.registry.get(ctx.name);
        if (!handler) {
            return;
        }

        return handler.execute(ctx);
    }
}
