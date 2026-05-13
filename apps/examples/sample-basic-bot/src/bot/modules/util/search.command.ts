import { Autocomplete, CommandHandler, Option, SlashCommand } from '@nodecord/core';
import { SlashCommandBuilder } from 'discord.js';

@SlashCommand(
    new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search command with autocomplete')
        .addStringOption((option) =>
            option.setName('query').setDescription('The search query').setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) =>
            option.setName('category').setDescription('The category to search in').setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('tag').setDescription('The tag to filter by').setRequired(false).setAutocomplete(true),
        )
        .addStringOption((option) =>
            option.setName('language').setDescription('The language filter').setRequired(false),
        ),
)
export class SearchCommand implements CommandHandler {
    execute(
        @Option('query') query: string,
        @Option('category') category: string,
        @Option('tag') tag: string = 'none',
        @Option('language') language: string = 'none',
        @Option() options: Record<string, unknown>,
    ) {
        console.log(options);
        return `You searched for "${query}" in category "${category}" with tag "${tag}" and language "${language}".`;
    }

    @Autocomplete('query')
    async autocompleteQuery() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return [
            { name: 'Nodecord', value: 'nodecord' },
            { name: 'Discord.js', value: 'discord.js' },
            { name: 'TypeScript', value: 'typescript' },
        ];
    }

    @Autocomplete('tag')
    async autocompleteTag() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return [
            { name: 'Library', value: 'library' },
            { name: 'Framework', value: 'framework' },
            { name: 'Tool', value: 'tool' },
        ];
    }
}
