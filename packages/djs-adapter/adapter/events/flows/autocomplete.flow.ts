import type { AutocompleteInteraction } from 'discord.js';
import type { CommandExecutor, ExecutionContext } from '@nodecord/core';
import type { DjsRegisteredCommand } from '../../command-registry.js';

export class AutocompleteInteractionFlow {
    constructor(private readonly executor: CommandExecutor) {}

    async handle(raw: AutocompleteInteraction, ctx: ExecutionContext, cmd: DjsRegisteredCommand): Promise<void> {
        const focusedName = raw.options.getFocused(true).name;
        const autoCompleteEntry = cmd.autocompleteEntries.find(([, options]) => options.includes(focusedName));

        if (!autoCompleteEntry) {
            // add logs...

            await raw.respond([]).catch(() => {}); // ?
            return;
        }

        const [methodName] = autoCompleteEntry;
        const caller = async () => {
            const args = this.executor.resolveArgs(cmd.handler, ctx, methodName);

            /**
             * I would like to add "[key: string]: ((...args: unknown[]) => any) | undefined;" to the CommandHandler interface to avoid this unsafe access
             * but it would introduce problemas implementing interfaces like "incorrectly implements interface..." so for now
             * we will just ignore the type safety here sadly
             */
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
            return (await (cmd.handler as any)[methodName]!(...args)) as unknown;
        };

        const guardedCaller = async () => {
            const result = await caller();

            if (
                !Array.isArray(result) ||
                !result.every((item) => typeof item === 'object' && 'name' in item && 'value' in item)
            ) {
                let safeResult: string;
                try {
                    safeResult = JSON.stringify(result);
                } catch (err) {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    safeResult = `[unserializable ${Object.prototype.toString.call(result)}: ${errMsg}]`;
                }

                throw new Error(
                    `Autocomplete handler "${cmd.handler.constructor.name}.${methodName}" must return an array of { name, value } objects, got: ${safeResult}. ` +
                        `If an interceptor is registered on this command, make sure it is not short-circuiting the pipeline or returning an unexpected value when the interaction type is AUTOCOMPLETE.`,
                );
            }

            await raw.respond(result as { name: string; value: string }[]);
        };

        await this.executor.execute(ctx, {
            caller: guardedCaller,
            interceptors: cmd.interceptors,
            exceptionHandlers: cmd.exceptionHandlers,
        });
    }
}
