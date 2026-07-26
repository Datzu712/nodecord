/* eslint-disable @typescript-eslint/no-unsafe-return */
import { APIGuild, APIUser } from 'discord-api-types/payloads/v10';
import { InteractionContext } from '../context/interaction-context.js';
import {
    AbstractLogger,
    ChatInputOption,
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
    { status: 'completed'; result: TResult | undefined } | { status: 'exceptionHandled' };

export type PosibleCommandParameter =
    InteractionContext | ChatInputOption[] | ChatInputOption | undefined | APIUser | APIGuild | null;

export class CommandPipelineBuilder {
    constructor(
        private readonly params: ExecuteParams,
        private readonly logger?: AbstractLogger | undefined,
    ) {}

    private resolveArgs(params: ParamMetadata[], ctx: InteractionContext): unknown[] {
        if (params.length === 0) return [];

        const resolvedParams = new Array(params.length) as PosibleCommandParameter[];

        const sortedParams = [...params].sort((a, b) => a.index - b.index);
        for (const param of sortedParams) {
            switch (param.type) {
                case 'CONTEXT':
                    resolvedParams[param.index] = ctx;
                    break;
                case 'OPTION':
                    if (ctx.isAutocomplete() || ctx.isChatInputCommand()) {
                        const options = ctx.getOptions();

                        /**
                         * There are 3 ways to retrieve resolved options:
                         *
                         * @Param()            ->   []                          (all options)
                         * @Param('x')         ->   ChatInputOption | undefined (single option by name)
                         * @Param('a', 'b')    ->   ChatInputOption[]           (filtered by name; unselected options are excluded)
                         */
                        if (!param.data.length) {
                            resolvedParams[param.index] = options;
                        } else if (param.data.length === 1) {
                            console.log(
                                'find',
                                options.find((opt) => opt.name === param.data[0]),
                            );
                            resolvedParams[param.index] = options.find((opt) => opt.name === param.data[0]);
                        } else {
                            resolvedParams[param.index] = options.filter((opt) => param.data.includes(opt.name));
                        }
                    } else {
                        this.logger?.warn(
                            `Received an "OPTION" parameter metadata for a context that is not a chat input command or autocomplete context.`,
                            'CommandPipelineBuilder',
                        );
                    }

                    break;
                case 'AUTHOR':
                    resolvedParams[param.index] = ctx.getAuthor();
                    break;
                case 'FOCUSED_OPTION':
                    if (ctx.isAutocomplete()) {
                        resolvedParams[param.index] = ctx.getFocusedOption() ?? null;
                    } else {
                        this.logger?.warn(
                            `Received a "FOCUSED_OPTION" parameter metadata for a context that is not an autocomplete context.`,
                            'CommandPipelineBuilder',
                        );
                    }
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
