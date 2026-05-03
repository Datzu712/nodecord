/* eslint-disable @typescript-eslint/no-unsafe-return */
import { COMMAND_ARGS_METADATA, DEFER_REPLY_METADATA } from '../constants/handler.js';
import { CommandParamTypes } from '../enums/command-types.enum.js';
import { CommandHandler } from '../interfaces/handler/command-handler.js';
import type { ParamMetadata } from '../interfaces/handler/param-metadata.js';
import type { RegisteredInterceptor } from '../interfaces/interceptor/interceptor.js';
import type { RegisteredExceptionHandler } from '../interfaces/exception-handler/exception-handler.js';
import type { AbstractLogger } from '../interfaces/common/abstract-logger.js';
import type { ExecutionContext } from './execution-context.js';

export type ParamTypeResolver = (ctx: ExecutionContext, data?: unknown) => unknown;

// TODO: CommandExecutor should have zero knowledge of reflect-metadata. All metadata resolution
// (param metadata, defer-reply flag, etc.) belongs in ModuleCompiler/MetadataScanner.
export class CommandExecutor {
    private readonly paramResolvers = new Map<CommandParamTypes, ParamTypeResolver>();

    constructor(private readonly logger: AbstractLogger) {}

    registerParamResolver(type: CommandParamTypes, resolver: ParamTypeResolver): void {
        this.paramResolvers.set(type, resolver);
    }

    // TODO: use observable for interceptors and convert params to a single object
    async execute(
        ctx: ExecutionContext,
        handler: CommandHandler,
        interceptors: RegisteredInterceptor[] = [],
        exceptionHandlers: RegisteredExceptionHandler[] = [],
    ): Promise<unknown> {
        /**
         * Chain of responsibility pattern for interceptors. See https://gist.github.com/Datzu712/6ed9c6115e00fb6ffd48fd03bf4c77c8 for an example of this implementation.
         */
        const final = async () => {
            const metadata = this.getParamMetadata(handler);
            const args = metadata
                .sort((a, b) => a.index - b.index)
                .map((meta) => this.paramResolvers.get(meta.type)?.(ctx, meta.data));

            return await handler.execute(...args);
        };

        const pipeline = interceptors.reduceRight(
            (next, { interceptor }) =>
                async () =>
                    interceptor.intercept(ctx, next),
            final,
        );

        try {
            return await pipeline();
        } catch (exception) {
            const matches = exceptionHandlers.filter(({ metadata }) =>
                metadata.exceptions.some((ExCls) => exception instanceof ExCls),
            );

            if (matches.length > 1) {
                this.logger.debug(
                    `Multiple exception handlers matched for command "${ctx.name}". ` +
                        `Executing the first one: ${matches[0]!.handler.constructor.name}. ` +
                        `Skipped: ${matches
                            .slice(1)
                            .map((m) => m.handler.constructor.name)
                            .join(', ')}.`,
                    'CommandExecutor',
                );
            }

            if (matches.length > 0) {
                return await matches[0]!.handler.handle(exception, ctx);
            }

            throw exception;
        }
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
