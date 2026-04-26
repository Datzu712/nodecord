import { COMMAND_ARGS_METADATA, DEFER_REPLY_METADATA } from '../constants/handler.js';
import { CommandParamTypes } from '../enums/command-types.enum.js';
import { CommandHandler } from '../interfaces/handler/command-handler.js';
import type { ParamMetadata } from '../interfaces/handler/param-metadata.js';
import type { NodecordInterceptor } from '../interfaces/interceptor/interceptor.js';
import type { ExecutionContext } from './execution-context.js';

export type ParamTypeResolver = (ctx: ExecutionContext, data?: unknown) => unknown;

export class CommandExecutor {
    private readonly paramResolvers = new Map<CommandParamTypes, ParamTypeResolver>();

    registerParamResolver(type: CommandParamTypes, resolver: ParamTypeResolver): void {
        this.paramResolvers.set(type, resolver);
    }

    // TODO: use observable for interceptors
    async execute(
        ctx: ExecutionContext<any>,
        handler: CommandHandler,
        interceptors: NodecordInterceptor[] = [],
    ): Promise<unknown> {
        /**
         * Chain of responsibility pattern for interceptors. See https://gist.github.com/Datzu712/6ed9c6115e00fb6ffd48fd03bf4c77c8 for an example implementation.
         */
        const final = async () => {
            const metadata = this.getParamMetadata(handler);
            const args = metadata
                .sort((a, b) => a.index - b.index)
                .map((meta) => this.paramResolvers.get(meta.type)?.(ctx, meta.data));

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await handler.execute(...args);
        };

        const pipeline = interceptors.reduceRight((next, interceptor) => () => interceptor.intercept(ctx, next), final);

        return pipeline();
    }

    isDeferReply(handler: CommandHandler): boolean {
        return Reflect.getMetadata(DEFER_REPLY_METADATA, handler.constructor, 'execute') === true;
    }

    isPassThrough(handler: CommandHandler): boolean {
        return this.getParamMetadata(handler).some(
            (m) =>
                m.type === CommandParamTypes.CONTEXT &&
                (m.data as { passThrough?: boolean } | undefined)?.passThrough === true,
        );
    }

    private getParamMetadata(handler: CommandHandler): ParamMetadata[] {
        return (
            (Reflect.getMetadata(COMMAND_ARGS_METADATA, handler.constructor, 'execute') as
                | ParamMetadata[]
                | undefined) ?? []
        );
    }
}
