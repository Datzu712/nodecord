/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InteractionContext } from '../context/interaction-context.js';
import {
    AbstractLogger,
    ParamMetadata,
    RegisteredExceptionHandler,
    RegisteredInterceptor,
} from '../interfaces/index.js';

export interface ExecuteParams {
    caller: (...args: unknown[]) => Promise<unknown>;
    ctx: InteractionContext;
    interceptors?: RegisteredInterceptor[];
    exceptionHandlers?: RegisteredExceptionHandler[];
    params: ParamMetadata[];
}

export type CommandPipelineExecution<TResult> =
    | { status: 'completed'; result: TResult | undefined }
    | { status: 'exceptionHandled' };

export class CommandPipelineBuilder {
    constructor(
        private readonly params: ExecuteParams,
        private readonly logger?: AbstractLogger | undefined,
    ) {}

    private resolveArgs(params: ParamMetadata[], ctx: InteractionContext): unknown[] {
        if (params.length === 0) return [];

        const resolvedParams = new Array(params.length);

        const sortedParams = [...params].sort((a, b) => a.index - b.index);
        for (const param of sortedParams) {
            switch (param.type) {
                case 'CONTEXT':
                    resolvedParams[param.index] = ctx;
                    break;
                case 'OPTION':
                    if (!ctx.isChatInputCommand()) {
                        this.logger?.warn(
                            `Received an "OPTION" parameter metadata for a non-chat input command context. ` +
                                `Make sure that the parameter index ${param.index} of your command executor is decorated with @Context() instead of @Option().`,
                            'CommandPipelineBuilder',
                        );

                        resolvedParams[param.index] = undefined;
                        break;
                    }

                    const selectedOptions = ctx
                        .getOptions()
                        .filter(({ name: optionName }) => param.data.includes(optionName));

                    resolvedParams[param.index] = selectedOptions;
                    break;
                case 'AUTHOR':
                    resolvedParams[param.index] = ctx.getAuthor();
                    break;
                case 'GUILD':
                    resolvedParams[param.index] = ctx.getGuild();
                    break;
                // todo: add handling for custom parameters
            }
        }

        return resolvedParams;
    }

    public async execute<TResult = unknown>(): Promise<TResult | undefined> {
        const execution = await this.executeWithOutcome<TResult>();

        return execution.status === 'completed' ? execution.result : undefined;
    }

    public async executeWithOutcome<TResult = unknown>(): Promise<CommandPipelineExecution<TResult>> {
        const { caller, ctx, interceptors = [], exceptionHandlers = [], params } = this.params;

        /**
         * Chain of responsibility pattern for interceptors. See https://gist.github.com/Datzu712/6ed9c6115e00fb6ffd48fd03bf4c77c8 for a raw example of this implementation.
         */
        let final = caller;
        if (params.length) {
            const resolverArgs = this.resolveArgs(params, ctx);

            final = async () => caller(...resolverArgs);
        }

        const pipeline = interceptors.reduceRight(
            (next, { interceptor }) =>
                async () =>
                    interceptor.intercept(ctx, next),
            final,
        );

        try {
            return { status: 'completed', result: (await pipeline()) as TResult | undefined };
        } catch (exception) {
            const matches = exceptionHandlers.filter(({ metadata }) =>
                metadata.exceptions.some((ExCls) => exception instanceof ExCls),
            );

            if (matches.length > 1) {
                this.logger?.debug(
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
                const res = await matches[0]!.handler.handle(exception, ctx);

                if (res !== undefined) {
                    this.logger?.warn(
                        `Exception handler "${matches[0]!.handler.constructor.name}" returned a value, but exception handlers are not expected to return anything to the rest of the pipeline. ` +
                            `If you have a specific use case that requires this behavior, please open an issue or a discussion in the Nodecord repository so we can evaluate adding this feature!`,
                        'CommandExecutor',
                    );
                }

                return { status: 'exceptionHandled' };
            }

            // todo: add default exception handling provided by the core

            throw exception;
        }
    }
}
