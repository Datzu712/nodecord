import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { CommandInteractionOptionResolver } from 'discord.js';
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

    it('lists the options inside a subcommand group and subcommand, not the groups', () => {
        // /mod admin ban target:@juan reason:spam, through discord.js's own resolver, which keeps `data` nested
        const Resolver = CommandInteractionOptionResolver as unknown as new (
            client: unknown,
            options: unknown[],
            resolved: unknown,
        ) => CommandInteractionOptionResolver;
        const ctx = new DjsChatInputCommandContext({
            commandName: 'mod',
            options: new Resolver(
                {},
                [
                    {
                        name: 'admin',
                        type: 2,
                        options: [
                            {
                                name: 'ban',
                                type: 1,
                                options: [
                                    { name: 'target', type: 6, value: '42', user },
                                    { name: 'reason', type: 3, value: 'spam' },
                                ],
                            },
                        ],
                    },
                ],
                {},
            ),
        } as unknown as ChatInputCommandInteraction);

        expect(ctx.getOptions()).toEqual([
            { name: 'target', type: 6, value: '42', resolved: user },
            { name: 'reason', type: 3, value: 'spam', resolved: undefined },
        ]);
    });
});

describe('autocomplete options', () => {
    // /search filter limit:0 exact:false query:<typing>
    const ctx = new DjsAutocompleteContext({
        commandName: 'search',
        options: {
            data: [
                {
                    name: 'filter',
                    type: 1,
                    options: [
                        { name: 'limit', type: 4, value: 0 },
                        { name: 'exact', type: 5, value: false },
                        { name: 'query', type: 3, value: '', focused: true },
                    ],
                },
            ],
        },
    } as unknown as AutocompleteInteraction);

    it('lists the options inside a subcommand, falsy values included', () => {
        expect(ctx.getOptions()).toEqual([
            { name: 'limit', type: 4, value: 0 },
            { name: 'exact', type: 5, value: false },
            { name: 'query', type: 3, value: '' },
        ]);
    });

    it('finds an option inside a subcommand, even with a falsy value', () => {
        expect(ctx.getOption('limit')).toEqual({ name: 'limit', type: 4, value: 0 });
        expect(ctx.getOption('exact')).toEqual({ name: 'exact', type: 5, value: false });
        expect(ctx.getOption('query')).toEqual({ name: 'query', type: 3, value: '' });
    });

    it('returns null for an option the user has not filled in', () => {
        expect(ctx.getOption('missing')).toBeNull();
        expect(ctx.getOption('filter')).toBeNull();
    });
});
