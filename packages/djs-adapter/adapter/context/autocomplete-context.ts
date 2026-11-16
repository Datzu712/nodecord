import type { AutocompleteInteraction, Guild, User } from 'discord.js';
import { AutocompleteContext } from '@nodecord/core';
import type { AutocompleteChoice, ChatInputOption } from '@nodecord/core';
import type { DjsTypes } from '../djs-types.js';
import { leafOptions } from './leaf-options.js';

export class DjsAutocompleteContext extends AutocompleteContext<DjsTypes> {
    constructor(private readonly interaction: AutocompleteInteraction) {
        super(interaction.commandName, interaction);
    }

    getFocusedOption(): ChatInputOption<DjsTypes> {
        const focused = this.interaction.options.getFocused(true);

        return {
            name: focused.name,
            value: focused.value,
            type: focused.type,
        };
    }

    getOption(optionName?: string): ChatInputOption<DjsTypes> | null {
        return this.getOptions().find((opt) => opt.name === optionName) ?? null;
    }

    override getOptions(): ChatInputOption<DjsTypes>[] {
        const options = leafOptions(this.interaction.options.data).filter((opt) => opt.value !== undefined);

        return options.map((opt) => ({ name: opt.name, value: opt.value!, type: opt.type }));
    }

    getGuild(): Guild | null {
        return this.interaction.guild;
    }

    getAuthor(): User {
        return this.interaction.user;
    }

    async respond(choices: AutocompleteChoice[]): Promise<void> {
        await this.interaction.respond(choices);
    }
}
