import 'reflect-metadata';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NodecordClient } from '@nodecord/core';

import { BotModule } from '../src/bot.module.js';
import { TestingDjsAdapter, createMockChatInputInteraction } from '@nodecord/djs-adapter/testing';

const mockedUser = { id: '1', username: 'juan', discriminator: '0000' } as any;

describe('UtilModule', () => {
    let adapter: TestingDjsAdapter;

    beforeEach(() => {
        adapter = new TestingDjsAdapter();
        NodecordClient.create({
            module: BotModule,
            adapter,
            options: { logger: false },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('/ping', async () => {
        it('defers and replies with the author username', async () => {
            vi.useFakeTimers();

            const interaction = createMockChatInputInteraction({
                commandName: 'ping',
                user: mockedUser,
            });

            const simulation = adapter.simulateInteraction(interaction);
            await vi.runAllTimersAsync();
            await simulation;

            expect(interaction.deferReply).toHaveBeenCalledOnce();
            expect(interaction.editReply).toHaveBeenCalledWith('Pong! Hello, juan!');
        });
    });

    describe('/status', () => {
        it('defers and replies with bot status', async () => {
            const interaction = createMockChatInputInteraction({ commandName: 'status', user: mockedUser });

            await adapter.simulateInteraction(interaction);

            expect(interaction.deferReply).toHaveBeenCalledOnce();
            expect(interaction.editReply).toHaveBeenCalledWith(
                expect.objectContaining({
                    embeds: expect.arrayContaining([
                        expect.objectContaining({
                            data: expect.objectContaining({ description: expect.stringContaining('online') }),
                        }),
                    ]),
                }),
            );
            //expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [{ description: 'Bot is online' }] });
        });
    });

    describe('/server-info', () => {
        it('defers and replies with an embed when inside a guild', async () => {
            const mockGuild = { name: 'Test Server', memberCount: 42, createdTimestamp: 0 } as any;
            const interaction = createMockChatInputInteraction({
                commandName: 'server-info',
                guild: mockGuild,
                user: mockedUser,
            });

            await adapter.simulateInteraction(interaction);

            expect(interaction.deferReply).toHaveBeenCalledOnce();
            expect(interaction.editReply).toHaveBeenCalledWith(
                expect.objectContaining({
                    embeds: expect.arrayContaining([
                        expect.objectContaining({
                            data: expect.objectContaining({ description: expect.stringContaining('Test Server') }),
                        }),
                    ]),
                }),
            );
        });

        it('replies with an error message when outside a guild', async () => {
            const interaction = createMockChatInputInteraction({
                commandName: 'server-info',
                guild: null,
                user: mockedUser,
            });

            await adapter.simulateInteraction(interaction);

            expect(interaction.editReply).toHaveBeenCalledWith(
                expect.objectContaining({
                    embeds: expect.arrayContaining([
                        expect.objectContaining({
                            data: { description: 'This command can only be used inside a server.' },
                        }),
                    ]),
                }),
            );
        });
    });

    describe('/admin', () => {
        it('defers and replies with the admin status as plain text', async () => {
            vi.useFakeTimers();

            const interaction = createMockChatInputInteraction({
                commandName: 'admin',
                user: mockedUser,
            });
            const simulation = adapter.simulateInteraction(interaction);
            await vi.runAllTimersAsync();
            await simulation;

            expect(interaction.deferReply).toHaveBeenCalledOnce();
            expect(interaction.editReply).toHaveBeenCalledWith({ content: '6 or 7' });
        });
    });
});
