import { ApplicationCommandOptionType, type CommandInteractionOption } from 'discord.js';

/**
 * The options the user filled in, with subcommands and subcommand groups unwrapped.
 *
 * discord.js keeps them nested the way Discord sends them, so `/mod ban target:@bob` arrives as a
 * single `ban` entry that holds `target`.
 */
export function leafOptions(options: readonly CommandInteractionOption[]): CommandInteractionOption[] {
    return options.flatMap((option) =>
        option.type === ApplicationCommandOptionType.Subcommand ||
        option.type === ApplicationCommandOptionType.SubcommandGroup
            ? leafOptions(option.options ?? [])
            : [option],
    );
}
