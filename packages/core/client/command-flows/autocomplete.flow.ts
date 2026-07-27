import { AutocompleteContext } from '../../context/autocomplete-context.js';
import { BaseCommandFlow } from '../../interfaces/handler/base-command-flow.js';
import type { AutocompleteChoice } from '../../interfaces/interactions/autocomplete.js';
import type { AbstractLogger, RegisteredCommandHandler } from '../../interfaces/index.js';
import { CommandPipelineBuilder } from '../command-pipeline-builder.js';
import { NodecordCoreException } from '../exceptions/base.js';

export class CommandAutocompleteFlow implements BaseCommandFlow {
    constructor(private readonly logger: AbstractLogger) {}

    async execute(ctx: AutocompleteContext, cmd: RegisteredCommandHandler): Promise<void> {
        const focusedOption = ctx.getFocusedOption();

        const targetExecutor = cmd.executors.find(
            ([, options]) => options.kind === 'autocomplete' && options.targetOptions.includes(focusedOption.name),
        );
        if (!targetExecutor) {
            this.logger.warn(
                `No autocomplete function executor found for command "${cmd.metadata.name}" with focused option "${focusedOption.name}". Skipping...`,
                'CommandExecutor',
            );

            return ctx.respond([]);
        }

        const [methodKey, executorOptions] = targetExecutor;
        if (!(methodKey in cmd.handler) || typeof cmd.handler[methodKey as keyof typeof cmd.handler] !== 'function') {
            throw new NodecordCoreException(
                `Unknown executor method "${methodKey}" for command "${cmd.metadata.name}".`,
            );
        }

        const shouldHandleResponse = !executorOptions.passThrough;
        const caller = cmd.handler[methodKey as keyof typeof cmd.handler].bind(cmd.handler);

        const pipeline = new CommandPipelineBuilder({
            caller,
            ctx,
            interceptors: cmd.interceptors,
            exceptionHandlers: cmd.exceptionHandlers,
            params: executorOptions.params,
        });

        const execution = await pipeline.executeWithOutcome<unknown>();
        if (execution.status === 'exceptionHandled' || !shouldHandleResponse) {
            return;
        }

        this.assertAutocompleteChoices(execution.result, cmd, methodKey);
        await ctx.respond(execution.result);
    }

    private assertAutocompleteChoices(
        result: unknown,
        cmd: RegisteredCommandHandler,
        methodKey: string,
    ): asserts result is AutocompleteChoice[] {
        if (this.isAutocompleteChoices(result)) {
            return;
        }

        throw new Error(
            `Autocomplete handler "${cmd.handler.constructor.name}.${methodKey}" must return an array of { name, value } objects, got: ${this.formatResult(result)}. ` +
                `If an interceptor is registered on this command, make sure it is not short-circuiting the pipeline or returning an unexpected value when the interaction type is AUTOCOMPLETE.`,
        );
    }

    private isAutocompleteChoices(result: unknown): result is AutocompleteChoice[] {
        return (
            Array.isArray(result) &&
            result.every((item) => typeof item === 'object' && item !== null && 'name' in item && 'value' in item)
        );
    }

    private formatResult(result: unknown): string {
        try {
            return JSON.stringify(result) ?? String(result);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            return `[unserializable ${Object.prototype.toString.call(result)}: ${errMsg}]`;
        }
    }
}
