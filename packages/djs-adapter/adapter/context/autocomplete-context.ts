import type { APIGuild, APIUser, AutocompleteInteraction } from 'discord.js';
import { AutocompleteContext } from '@nodecord/core';
import type { AutocompleteChoice, ChatInputOption } from '@nodecord/core';

export class DjsAutocompleteContext extends AutocompleteContext {
    constructor(private readonly interaction: AutocompleteInteraction) {
        super(interaction.commandName, interaction);
    }

    getFocusedOption(): ChatInputOption {
        const focused = this.interaction.options.getFocused(true);

        return {
            name: focused.name,
            value: focused.value,
            type: focused.type,
        };
    }

    getOption(optionName?: string): ChatInputOption | null {
        const targetOption = this.interaction.options.data.find((opt) => opt.name === optionName);

        if (!targetOption || !targetOption.value) return null;

        return {
            name: targetOption.name,
            value: targetOption.value,
            type: targetOption.type,
        };
    }

    override getOptions(): ChatInputOption[] {
        const options = this.interaction.options.data.filter((opt) => opt.value !== undefined);

        return options.map((opt) => ({ name: opt.name, value: opt.value!, type: opt.type }));
    }

    getGuild(): APIGuild | null {
        const guild = this.interaction.guild;
        if (!guild) return null;
        return { id: guild.id, name: guild.name } as APIGuild;
    }

    getAuthor(): APIUser {
        const user = this.interaction.user;
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
        } as APIUser;
    }

    async respond(choices: AutocompleteChoice[]): Promise<void> {
        await this.interaction.respond(choices);
    }
}
