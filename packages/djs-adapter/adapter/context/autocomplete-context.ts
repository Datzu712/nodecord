import type { APIGuild, APIUser, AutocompleteInteraction } from 'discord.js';
import { AutocompleteContext } from '@nodecord/core';
import type { AutocompleteChoice, FocusedOption } from '@nodecord/core';

export class DjsAutocompleteContext extends AutocompleteContext {
    constructor(private readonly interaction: AutocompleteInteraction) {
        super(interaction.commandName, interaction);
    }

    getFocusedOption(): FocusedOption {
        const focused = this.interaction.options.getFocused(true);
        return {
            name: focused.name,
            value: focused.value,
            type: focused.type,
        };
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
