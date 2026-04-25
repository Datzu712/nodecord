import { COMMAND_ARGS_METADATA } from '../constants/handler.js';
import { CommandParamTypes } from '../enums/command-types.enum.js';
import { CommandHandler } from '../interfaces/handler/command-handler.js';
import type { ParamMetadata } from '../interfaces/handler/param-metadata.js';
import { ExecutionContext } from './execution-context.js';

export type ParamTypeResolver = (ctx: ExecutionContext, data?: unknown) => unknown;

export class CommandExecutor {
    private readonly resolvers = new Map<CommandParamTypes, ParamTypeResolver>();

    registerParamResolver(type: CommandParamTypes, resolver: ParamTypeResolver): void {
        this.resolvers.set(type, resolver);
    }

    async execute(ctx: ExecutionContext<any>, handler: CommandHandler): Promise<unknown> {
        const metadata =
            (Reflect.getMetadata(COMMAND_ARGS_METADATA, handler.constructor, 'execute') as
                | ParamMetadata[]
                | undefined) ?? [];

        const args = metadata
            .sort((a, b) => a.index - b.index)
            .map((meta) => this.resolvers.get(meta.type)?.(ctx, meta.data));

        return await handler.execute(...args);
    }
}
