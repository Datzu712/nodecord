import type { AutocompleteInteraction } from 'discord.js';
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

    async respond(choices: AutocompleteChoice[]): Promise<void> {
        await this.interaction.respond(choices);
    }
}
