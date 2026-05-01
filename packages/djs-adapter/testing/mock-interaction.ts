/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApplicationCommandType, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import { vi } from 'vitest';

export function createMockChatInputInteraction(
    overrides: { [K in keyof ChatInputCommandInteraction]?: unknown } = {},
): ChatInputCommandInteraction {
    const mock = Object.create(ChatInputCommandInteraction.prototype);

    const overridesWithDefaults = {
        type: InteractionType.ApplicationCommand,
        commandType: ApplicationCommandType.ChatInput,
        // Defaults
        commandName: 'unknown',
        reply: vi.fn().mockResolvedValue(undefined),
        deferReply: vi.fn().mockImplementation(async () => {
            overridesWithDefaults.deferred = true;
            return Promise.resolve();
        }),
        editReply: vi.fn().mockResolvedValue(undefined),
        followUp: vi.fn().mockResolvedValue(undefined),
        deferred: false,
        isChatInputCommand: () => true,
        options: {
            getString: vi.fn().mockReturnValue(null),
            getInteger: vi.fn().mockReturnValue(null),
            getBoolean: vi.fn().mockReturnValue(null),
            getUser: vi.fn().mockReturnValue(null),
            getMember: vi.fn().mockReturnValue(null),
            getChannel: vi.fn().mockReturnValue(null),
            getNumber: vi.fn().mockReturnValue(null),
            getRole: vi.fn().mockReturnValue(null),
        },
        ...overrides,
    };

    return new Proxy(mock, {
        get(target, prop) {
            // if (prop === 'editReply')
            //     console.log('editReply intercepted, in state:', 'editReply' in overridesWithDefaults);
            if (prop in overridesWithDefaults) {
                return overridesWithDefaults[prop as keyof typeof overridesWithDefaults];
            }
            const value = target[prop];
            return typeof value === 'function' ? value.bind(target) : value;
        },
    }) as ChatInputCommandInteraction;
}

export type MockInteraction = ReturnType<typeof createMockChatInputInteraction>;
