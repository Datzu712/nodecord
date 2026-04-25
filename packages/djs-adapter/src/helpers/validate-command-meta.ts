import { SlashCommandBuilder, ContextMenuCommandBuilder } from 'discord.js';

export function isDjsCommandMeta(meta: unknown): meta is SlashCommandBuilder | ContextMenuCommandBuilder {
    return meta instanceof SlashCommandBuilder || meta instanceof ContextMenuCommandBuilder;
}
