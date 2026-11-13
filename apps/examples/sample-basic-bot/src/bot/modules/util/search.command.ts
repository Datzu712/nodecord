import { Autocomplete, CommandHandler, Focused, Option, SlashCommand, ChatInputOption } from '@nodecord/core';
import { ApplicationCommandOptionType } from 'discord.js';

@SlashCommand({
    name: 'search',
    description: 'Search command with autocomplete',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'query',
            description: 'The search query',
            required: true,
            autocomplete: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'category',
            description: 'The category to search in',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'tag',
            description: 'The tag to filter by',
            autocomplete: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'language',
            description: 'The language filter',
        },
    ],
})
export class SearchCommand implements CommandHandler {
    execute(
        @Option('query') query: ChatInputOption,
        @Option('category') category: ChatInputOption,
        @Option('tag') tag: ChatInputOption,
        @Option('language') language: ChatInputOption,
        @Option() options: Record<string, unknown>,
    ) {
        return `You searched for "${query.value}" in category "${category.value}" with tag "${tag.value}" and language "${language.value}".`;
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
    autocompleteTag(@Focused() input: ChatInputOption, @Option('category') category: ChatInputOption) {
        const exampleOptions = [
            { name: 'Library', value: 'library' },
            { name: 'Framework', value: 'framework' },
            { name: 'Tool', value: 'tool' },
        ];

        if (!input.value.toString().trim()) return exampleOptions;

        return exampleOptions.filter((v) =>
            v.value.toLowerCase().includes(input?.value.toString().toLowerCase() ?? ''),
        );
    }
}
