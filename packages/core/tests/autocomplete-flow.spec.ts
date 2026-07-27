import 'reflect-metadata';

import type { APIGuild, APIUser } from 'discord-api-types/v10';
import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommandAutocompleteFlow } from '../client/command-flows/autocomplete.flow.js';
import { AutocompleteContext } from '../context/autocomplete-context.js';
import type { AbstractLogger, NodecordInterceptor, RegisteredCommandHandler } from '../interfaces/index.js';
import type { AutocompleteChoice, ChatInputOption } from '../interfaces/interactions/autocomplete.js';

const mockLogger: AbstractLogger = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
};

class TestAutocompleteContext extends AutocompleteContext {
    getOption(): ChatInputOption | null {
        return vi.mockObject<ChatInputOption>({
            value: 'test',
            name: 'test',
            type: 1,
        });
    }
    override getOptions(): ChatInputOption[] {
        return [
            {
                value: 'test',
                name: 'test',
                type: 1,
            },
        ];
    }
    readonly respond = vi.fn<(choices: AutocompleteChoice[]) => Promise<void>>(async () => {});

    constructor(private readonly focusedOption: ChatInputOption) {
        super('search', {});
    }

    getFocusedOption(): ChatInputOption {
        return this.focusedOption;
    }

    getGuild(): APIGuild {
        return {} as APIGuild;
    }

    getAuthor(): APIUser {
        return {} as APIUser;
    }
}

function makeCommand(
    handler: RegisteredCommandHandler['handler'],
    overrides: Partial<RegisteredCommandHandler> = {},
): RegisteredCommandHandler {
    return {
        metadata: {
            id: randomUUID(),
            name: 'search',
            description: 'Search',
            applicationCommandType: 1,
        },
        executors: [
            [
                'autocomplete',
                {
                    kind: 'autocomplete',
                    targetOptions: ['query'],
                    passThrough: false,
                    params: [],
                },
            ],
        ],
        handler,
        interceptors: [],
        exceptionHandlers: [],
        ...overrides,
    };
}

describe('CommandAutocompleteFlow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('responds with the result produced by the interceptor pipeline', async () => {
        const ctx = new TestAutocompleteContext({ name: 'query', value: 'query', type: 3 });
        const handler = {
            execute: vi.fn(),
            autocomplete: vi.fn(async () => [{ name: 'alpha', value: 'alpha' }]),
        };

        const transformInterceptor: NodecordInterceptor<AutocompleteChoice[], AutocompleteChoice[]> = {
            async intercept(_ctx, next) {
                const result = await next();

                return result.map((choice) => ({
                    ...choice,
                    name: choice.name.toUpperCase(),
                }));
            },
        };

        const command = makeCommand(handler, {
            interceptors: [{ interceptor: transformInterceptor, metadata: { id: randomUUID() } }],
        });

        await new CommandAutocompleteFlow(mockLogger).execute(ctx, command);

        expect(handler.autocomplete).toHaveBeenCalledOnce();
        expect(ctx.respond).toHaveBeenCalledWith([{ name: 'ALPHA', value: 'alpha' }]);
    });

    it('does not run the response post-pipeline when an exception handler handled the failure', async () => {
        class AppError extends Error {}

        const ctx = new TestAutocompleteContext({ name: 'query', value: 'query', type: 3 });
        const exceptionHandler = { handle: vi.fn() };
        const handler = {
            execute: vi.fn(),
            autocomplete: vi.fn(async () => {
                throw new AppError('boom');
            }),
        };
        const command = makeCommand(handler, {
            exceptionHandlers: [
                {
                    handler: exceptionHandler,
                    metadata: { id: randomUUID(), exceptions: [AppError] },
                },
            ],
        });

        await new CommandAutocompleteFlow(mockLogger).execute(ctx, command);

        expect(exceptionHandler.handle).toHaveBeenCalledWith(expect.any(AppError), ctx);
        expect(ctx.respond).not.toHaveBeenCalled();
    });
});
