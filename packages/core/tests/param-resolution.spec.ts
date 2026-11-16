import 'reflect-metadata';

import { describe, expect, it, vi } from 'vitest';

import { CommandPipelineBuilder } from '../client/command-pipeline-builder.js';
import { AutocompleteContext } from '../context/autocomplete-context.js';
import { ChatInputCommandContext } from '../context/chat-input-command-context.js';
import type { InteractionContext } from '../context/interaction-context.js';
import type { AbstractLogger, GuildLike, ParamMetadata, UserLike } from '../interfaces/index.js';
import type { ChatInputOption } from '../interfaces/interactions/autocomplete.js';

const mockLogger: AbstractLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
};

const author: UserLike = { id: '1', username: 'author' };

class TestChatInputContext extends ChatInputCommandContext {
    constructor(
        private readonly options: ChatInputOption[],
        raw: unknown = {},
    ) {
        super('test', raw);
    }

    getOptions(): ChatInputOption[] {
        return this.options;
    }

    getGuild(): GuildLike | null {
        return null;
    }

    getAuthor(): UserLike {
        return author;
    }

    async reply(): Promise<void> {}
    async deferReply(): Promise<void> {}
    async editReply(): Promise<void> {}
    async followUp(): Promise<void> {}
}

class TestAutocompleteContext extends AutocompleteContext {
    constructor(
        private readonly focused: ChatInputOption,
        private readonly options: ChatInputOption[] = [],
    ) {
        super('test', {});
    }

    getFocusedOption(): ChatInputOption {
        return this.focused;
    }

    getOption(name?: string): ChatInputOption | null {
        return this.options.find((opt) => opt.name === name) ?? null;
    }

    getOptions(): ChatInputOption[] {
        return this.options;
    }

    getGuild(): GuildLike | null {
        return null;
    }

    getAuthor(): UserLike {
        return author;
    }

    async respond(): Promise<void> {}
}

/** Runs the pipeline with a caller that hands back the arguments it received. */
const resolve = async (ctx: InteractionContext, params: ParamMetadata[]): Promise<unknown[]> =>
    (await new CommandPipelineBuilder({ caller: async (...args) => args, ctx, params }, mockLogger).execute<
        unknown[]
    >())!;

const user = { id: '42', username: 'juan' };
const options: ChatInputOption[] = [
    { name: 'query', type: 3, value: 'nodecord' },
    { name: 'count', type: 4, value: 0 },
    { name: 'exact', type: 5, value: false },
    { name: 'target', type: 6, value: '42', resolved: user },
    { name: 'role', type: 8, value: '77' },
    { name: '__proto__', type: 3, value: 'own' },
];
const option = (...names: string[]): ParamMetadata => ({ index: 0, type: 'OPTION', data: names });
const ctx = () => new TestChatInputContext(options);

describe('@Option with one name', () => {
    it('delivers the value', async () => {
        expect(await resolve(ctx(), [option('query')])).toEqual(['nodecord']);
    });

    it('delivers falsy values as provided', async () => {
        expect(await resolve(ctx(), [option('count')])).toEqual([0]);
        expect(await resolve(ctx(), [option('exact')])).toEqual([false]);
    });

    it('delivers the resolved object for an entity option', async () => {
        expect((await resolve(ctx(), [option('target')]))[0]).toBe(user);
    });

    it('delivers the id when the adapter resolved nothing', async () => {
        expect(await resolve(ctx(), [option('role')])).toEqual(['77']);
    });

    it('delivers undefined when the option was not provided', async () => {
        expect(await resolve(ctx(), [option('missing')])).toEqual([undefined]);
    });
});

describe('@Option with several names', () => {
    it('delivers a record of the provided ones', async () => {
        const [record] = await resolve(ctx(), [option('query', 'target', 'missing')]);
        expect(record).toEqual({ query: 'nodecord', target: user });
    });

    it('delivers an empty record when none was provided', async () => {
        expect(await resolve(ctx(), [option('missing', 'other')])).toEqual([{}]);
    });
});

describe('@Option with no names', () => {
    it('delivers every provided option as own keys', async () => {
        const [record] = (await resolve(ctx(), [option()])) as [Record<string, unknown>];
        expect(Object.keys(record)).toEqual(['query', 'count', 'exact', 'target', 'role', '__proto__']);
        expect(Object.hasOwn(record, '__proto__')).toBe(true);
        expect(record.target).toBe(user);
    });

    it('delivers an empty record when the interaction carries no options', async () => {
        expect(await resolve(new TestChatInputContext([]), [option()])).toEqual([{}]);
    });
});

describe('@Focused', () => {
    it('delivers the focused value', async () => {
        const autocomplete = new TestAutocompleteContext({ name: 'query', type: 3, value: 'nod' });
        expect(await resolve(autocomplete, [{ index: 0, type: 'FOCUSED_OPTION' }])).toEqual(['nod']);
    });
});
