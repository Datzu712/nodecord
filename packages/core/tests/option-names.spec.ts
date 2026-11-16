import { describe, expect, it } from 'vitest';

import { assertOptionNamesDeclared, collectDeclaredOptionNames } from '../client/container/resolvers/option-names.js';
import { UnknownOptionException } from '../client/exceptions/module.js';
import { ApplicationCommandTypes } from '../constants/application-command-types.js';
import type { CommandHandlerMetadata } from '../interfaces/handler/command-handler.js';
import type { ParamMetadata } from '../interfaces/index.js';

type Options = CommandHandlerMetadata['options'];

const STRING = 3;
const USER = 6;
const SUBCOMMAND = 1;
const SUBCOMMAND_GROUP = 2;

const definition = (options?: Options): CommandHandlerMetadata => ({
    id: 'id',
    applicationCommandType: ApplicationCommandTypes.ChatInput,
    name: 'search',
    description: 'Search',
    ...(options ? { options } : {}),
});

const flat = definition([
    { type: STRING, name: 'query', description: 'q' },
    { type: STRING, name: 'category', description: 'c' },
]);

// /search admin ban <target> <reason>, /search admin kick <target>, /search info <query>
const nested = definition([
    {
        type: SUBCOMMAND_GROUP,
        name: 'admin',
        description: 'a',
        options: [
            {
                type: SUBCOMMAND,
                name: 'ban',
                description: 'b',
                options: [
                    { type: USER, name: 'target', description: 't' },
                    { type: STRING, name: 'reason', description: 'r' },
                ],
            },
            {
                type: SUBCOMMAND,
                name: 'kick',
                description: 'k',
                options: [{ type: USER, name: 'target', description: 't' }],
            },
        ],
    },
    {
        type: SUBCOMMAND,
        name: 'info',
        description: 'i',
        options: [{ type: STRING, name: 'query', description: 'q' }],
    },
] as Options);

const option = (index: number, ...names: string[]): ParamMetadata => ({ index, type: 'OPTION', data: names });

class SearchHandler {}

/** Runs the assertion for a method of SearchHandler and returns what it threw, if anything. */
const check = (args: {
    definition?: CommandHandlerMetadata;
    params?: ParamMetadata[];
    autocompleteTargets?: string[];
    methodKey?: string;
}): unknown => {
    try {
        assertOptionNamesDeclared({
            target: SearchHandler,
            methodKey: args.methodKey ?? 'execute',
            definition: args.definition ?? flat,
            params: args.params ?? [],
            ...(args.autocompleteTargets ? { autocompleteTargets: args.autocompleteTargets } : {}),
        });
    } catch (error) {
        return error;
    }
    return undefined;
};

const messageOf = (error: unknown): string => {
    expect(error).toBeInstanceOf(UnknownOptionException);
    return (error as UnknownOptionException).message;
};

describe('collectDeclaredOptionNames', () => {
    it('returns nothing for a definition without options', () => {
        expect(collectDeclaredOptionNames(definition())).toEqual([]);
        expect(collectDeclaredOptionNames(definition([]))).toEqual([]);
    });

    it('returns the names in declaration order', () => {
        expect(collectDeclaredOptionNames(flat)).toEqual(['query', 'category']);
    });

    it('walks into subcommands and groups without listing them', () => {
        const names = collectDeclaredOptionNames(nested);

        expect(names).toContain('target');
        expect(names).toContain('reason');
        expect(names).toContain('query');
        expect(names).not.toContain('admin');
        expect(names).not.toContain('ban');
        expect(names).not.toContain('kick');
        expect(names).not.toContain('info');
    });

    it('lists a name shared by several subcommands once, where it first appears', () => {
        expect(collectDeclaredOptionNames(nested)).toEqual(['target', 'reason', 'query']);
    });
});

describe('assertOptionNamesDeclared', () => {
    describe('accepts', () => {
        it('a method that refers to no option at all', () => {
            expect(check({})).toBeUndefined();
            expect(check({ definition: definition() })).toBeUndefined();
        });

        it('declared names, one or several per parameter', () => {
            expect(check({ params: [option(0, 'query'), option(1, 'query', 'category')] })).toBeUndefined();
        });

        it('declared names in @Autocomplete', () => {
            expect(
                check({ methodKey: 'complete', autocompleteTargets: ['query'], params: [option(0, 'category')] }),
            ).toBeUndefined();
        });

        it('@Option() without names, even on a command that declares no options', () => {
            expect(check({ definition: definition(), params: [option(0)] })).toBeUndefined();
        });

        it('parameters that are not options, whatever the command declares', () => {
            const params: ParamMetadata[] = [
                { index: 0, type: 'CONTEXT', data: {} },
                { index: 1, type: 'AUTHOR' },
                { index: 2, type: 'GUILD' },
                { index: 3, type: 'FOCUSED_OPTION' },
            ];

            expect(check({ definition: definition(), params })).toBeUndefined();
        });

        it('a name declared inside a subcommand, at any depth', () => {
            expect(check({ definition: nested, params: [option(0, 'reason'), option(1, 'query')] })).toBeUndefined();
        });
    });

    describe('rejects', () => {
        it('an unknown name in @Option, naming where it is and what the command declares', () => {
            const error = check({ params: [option(0, 'qurey')] });

            expect(error).toBeInstanceOf(UnknownOptionException);
            expect((error as UnknownOptionException).code).toBe('UNKNOWN_OPTION');
            expect(messageOf(error)).toContain(
                '@Option("qurey") on SearchHandler.execute() does not match any option of the command "search".',
            );
            expect(messageOf(error)).toContain('Declared options: "query", "category".');
        });

        it('an unknown name in @Autocomplete, naming the autocomplete method', () => {
            const error = check({ methodKey: 'complete', autocompleteTargets: ['qurey'] });

            expect(messageOf(error)).toContain('@Autocomplete("qurey") on SearchHandler.complete()');
        });

        it('any name when the command declares no options', () => {
            const error = check({ definition: definition(), params: [option(0, 'query')] });

            expect(messageOf(error)).toContain('Declared options: none.');
        });

        it('an unknown name hidden among declared ones in the same @Option', () => {
            const error = check({ params: [option(0, 'query', 'qurey', 'category')] });

            expect(messageOf(error)).toContain('@Option("qurey")');
        });

        it('an unknown name in a later parameter when the earlier ones are fine', () => {
            const error = check({ params: [option(0, 'query'), option(1, 'category'), option(2, 'tag')] });

            expect(messageOf(error)).toContain('@Option("tag")');
        });

        it('a name that only differs in case', () => {
            expect(messageOf(check({ params: [option(0, 'Query')] }))).toContain('@Option("Query")');
        });

        it('a name that is only part of a declared one, or contains one', () => {
            expect(messageOf(check({ params: [option(0, 'quer')] }))).toContain('@Option("quer")');
            expect(messageOf(check({ params: [option(0, 'query2')] }))).toContain('@Option("query2")');
        });

        it('an empty name', () => {
            expect(messageOf(check({ params: [option(0, '')] }))).toContain('@Option("")');
        });

        it('names every object has, when the command does not declare them', () => {
            for (const name of ['constructor', 'toString', '__proto__', 'length']) {
                expect(messageOf(check({ params: [option(0, name)] }))).toContain(`@Option("${name}")`);
            }
        });

        it('the name of a subcommand or of a subcommand group', () => {
            const forSubcommand = check({ definition: nested, params: [option(0, 'ban')] });
            const forGroup = check({ definition: nested, params: [option(0, 'admin')] });

            expect(messageOf(forSubcommand)).toContain('@Option("ban")');
            expect(messageOf(forSubcommand)).toContain('Declared options: "target", "reason", "query".');
            expect(messageOf(forGroup)).toContain('@Option("admin")');
        });
    });

    describe('with several unknown names', () => {
        it('reports the one in the earliest parameter, whatever order the metadata came in', () => {
            // Parameter decorators run from the last parameter to the first, so metadata arrives reversed.
            const error = check({ params: [option(2, 'third'), option(1, 'second'), option(0, 'first')] });

            expect(messageOf(error)).toContain('@Option("first")');
        });

        it('reports the one in @Autocomplete before the ones in @Option', () => {
            const error = check({
                methodKey: 'complete',
                autocompleteTargets: ['nope'],
                params: [option(0, 'alsoNope')],
            });

            expect(messageOf(error)).toContain('@Autocomplete("nope")');
        });
    });

    it('leaves the params it was given untouched', () => {
        const params = [option(1, 'category'), option(0, 'query')];

        check({ params });

        expect(params.map((param) => param.index)).toEqual([1, 0]);
    });
});
