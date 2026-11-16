import { ApplicationCommandOptionType } from 'discord-api-types/v10';

import type { CommandHandlerMetadata } from '../../../interfaces/handler/command-handler.js';
import type { Constructor, ParamMetadata } from '../../../interfaces/index.js';
import { UnknownOptionException } from '../../exceptions/module.js';

interface OptionNode {
    name: string;
    type: number;
    options?: readonly OptionNode[];
}

/**
 * Every option name in the definition, nested ones included, in declaration order and deduplicated.
 *
 * Subcommands and subcommand groups are walked through but not listed: they group options, they are not
 * something a handler can receive through `@Option()`.
 */
export function collectDeclaredOptionNames(definition: Pick<CommandHandlerMetadata, 'options'>): string[] {
    const names = new Set<string>();

    const visit = (options: readonly OptionNode[] = []) => {
        for (const option of options) {
            const isGroup =
                option.type === ApplicationCommandOptionType.Subcommand ||
                option.type === ApplicationCommandOptionType.SubcommandGroup;

            if (!isGroup) names.add(option.name);

            if (option.options?.length) {
                visit(option.options);
            }
        }
    };

    visit(definition.options as readonly OptionNode[] | undefined);

    return [...names];
}

/**
 * Makes sure every option name a method refers to, through `@Option(...)` on its parameters or through
 * `@Autocomplete(...)` on the method itself, is declared in the command definition.
 *
 * @throws {UnknownOptionException} for the first name that is not.
 */
export function assertOptionNamesDeclared({
    target,
    methodKey,
    definition,
    params,
    autocompleteTargets = [],
}: {
    target: Constructor;
    methodKey: string;
    definition: CommandHandlerMetadata;
    params: ParamMetadata[];
    autocompleteTargets?: string[];
}): void {
    const declaredOptions = collectDeclaredOptionNames(definition);

    const optionParams = params.filter((param) => param.type === 'OPTION').sort((a, b) => a.index - b.index);

    const references: { decorator: 'Option' | 'Autocomplete'; optionName: string }[] = [
        ...autocompleteTargets.map((optionName) => ({ decorator: 'Autocomplete' as const, optionName })),
        ...optionParams.flatMap((param) =>
            param.data.map((optionName) => ({ decorator: 'Option' as const, optionName })),
        ),
    ];

    const unknown = references.find(({ optionName }) => !declaredOptions.includes(optionName));
    if (!unknown) return;

    throw new UnknownOptionException({
        ...unknown,
        className: target.name,
        methodName: methodKey,
        commandName: definition.name,
        declaredOptions,
    });
}
