import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import type { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

import { DjsAutocompleteContext } from '../adapter/context/autocomplete-context.js';
import { DjsChatInputCommandContext } from '../adapter/context/chat-input-command-context.js';
import { DjsContextMenuContext } from '../adapter/context/context-menu-context.js';

const user = { id: '42', username: 'juan' };
const guild = { id: '7', name: 'Test Server', memberCount: 42 };

const contexts = {
    chatInput: (i: object) => new DjsChatInputCommandContext(i as ChatInputCommandInteraction),
    autocomplete: (i: object) => new DjsAutocompleteContext(i as AutocompleteInteraction),
    contextMenu: (i: object) => new DjsContextMenuContext(i as ContextMenuCommandInteraction),
};

describe.each(Object.entries(contexts))('%s context', (_name, make) => {
    it('returns the very user object the interaction holds', () => {
        expect(make({ commandName: 'x', user, guild }).getAuthor()).toBe(user);
    });

    it('returns the very guild object the interaction holds', () => {
        expect(make({ commandName: 'x', user, guild }).getGuild()).toBe(guild);
    });

    it('returns null when the library holds no guild object', () => {
        expect(make({ commandName: 'x', user, guild: null, guildId: '7' }).getGuild()).toBeNull();
    });
});

describe('chat input options', () => {
    it('carries what discord.js resolved, the user and never the member', () => {
        const member = { id: '42', nickname: 'j' };
        const role = { id: '77', name: 'mods' };
        const ctx = new DjsChatInputCommandContext({
            commandName: 'x',
            options: {
                data: [
                    { name: 'target', type: 6, value: '42', user, member },
                    { name: 'who', type: 9, value: '77', role },
                    { name: 'query', type: 3, value: 'nodecord' },
                ],
            },
        } as unknown as ChatInputCommandInteraction);

        const [target, who, query] = ctx.getOptions();

        expect(target).toEqual({ name: 'target', type: 6, value: '42', resolved: user });
        expect(target!.resolved).toBe(user);
        expect(who!.resolved).toBe(role);
        expect(query).toEqual({ name: 'query', type: 3, value: 'nodecord', resolved: undefined });
    });
});
