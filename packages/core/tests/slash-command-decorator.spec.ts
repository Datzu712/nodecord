import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { ApplicationCommandTypes } from '../constants/application-command-types.js';
import { compileCommandHandlerMetadata } from '../client/container/resolvers/handler-metadata.js';
import { InvalidCommandDefinitionException } from '../client/exceptions/module.js';
import { SlashCommand } from '../decorators/slash-command.js';

class FakeBuilder {
    toJSON() {
        return { name: 'ping', description: 'Replies with pong', type: 1, options: [{ name: 'target', type: 6 }] };
    }
}

describe('SlashCommand decorator', () => {
    describe('definition identity', () => {
        it('preserves a builder instance by identity as compiled.definition', () => {
            const builder = new FakeBuilder();

            @SlashCommand(builder)
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.definition).toBe(builder);
        });

        it('preserves a plain object by identity as compiled.definition', () => {
            const definition = { name: 'ping', description: 'Replies with pong' };

            @SlashCommand(definition)
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.definition).toBe(definition);
        });
    });

    describe('metadata normalization', () => {
        it('extracts name/description from toJSON() output and applicationCommandType from numeric type', () => {
            @SlashCommand(new FakeBuilder())
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.metadata.name).toBe('ping');
            expect(compiled.metadata.description).toBe('Replies with pong');
            expect(compiled.metadata.applicationCommandType).toBe(ApplicationCommandTypes.ChatInput);
        });

        it('defaults applicationCommandType to ChatInput when the source has no type field', () => {
            @SlashCommand({ name: 'ping', description: 'Replies with pong' })
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.metadata.applicationCommandType).toBe(ApplicationCommandTypes.ChatInput);
        });

        it('carries nsfw: true from the source into metadata', () => {
            @SlashCommand({ name: 'ping', description: 'Replies with pong', nsfw: true })
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.metadata.nsfw).toBe(true);
        });
    });

    describe('validation', () => {
        it('throws InvalidCommandDefinitionException when name is empty', () => {
            expect(() => {
                @SlashCommand({ name: '', description: 'Replies with pong' })
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);
        });

        it('throws InvalidCommandDefinitionException when name is missing', () => {
            expect(() => {
                @SlashCommand({ description: 'Replies with pong' } as never)
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);
        });

        it('throws InvalidCommandDefinitionException when a ChatInput definition has no description', () => {
            expect(() => {
                @SlashCommand({ name: 'ping' } as never)
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);
        });

        it('throws InvalidCommandDefinitionException when toJSON() returns null', () => {
            class NullBuilder {
                toJSON() {
                    return null;
                }
            }

            expect(() => {
                @SlashCommand(new NullBuilder())
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);
        });

        it('throws InvalidCommandDefinitionException naming the handler when toJSON() throws', () => {
            class ThrowingBuilder {
                toJSON(): unknown {
                    throw new Error('boom: builder is not fully configured');
                }
            }

            expect(() => {
                @SlashCommand(new ThrowingBuilder())
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);

            try {
                @SlashCommand(new ThrowingBuilder())
                class PingHandler2 {
                    execute() {}
                }
                void PingHandler2;
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidCommandDefinitionException);
                expect((error as Error).message).toContain('PingHandler2');
                expect((error as Error).message).toContain('toJSON()');
                expect((error as Error).message).toContain('boom: builder is not fully configured');
            }
        });

        it('does not mention toJSON() when a plain object definition is not a valid object', () => {
            try {
                @SlashCommand(null as never)
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
                throw new Error('expected @SlashCommand(null) to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidCommandDefinitionException);
                expect((error as Error).message).not.toContain('toJSON()');
            }
        });

        it('throws InvalidCommandDefinitionException when the source type is not ChatInput', () => {
            expect(() => {
                @SlashCommand({ name: 'ping', description: 'Replies with pong', type: 3 } as never)
                class PingHandler {
                    execute() {}
                }
                void PingHandler;
            }).toThrow(InvalidCommandDefinitionException);
        });

        it('accepts an explicit ChatInput (type: 1) definition', () => {
            @SlashCommand({ name: 'ping', description: 'Replies with pong', type: 1 } as never)
            class PingHandler {
                execute() {}
            }

            const compiled = compileCommandHandlerMetadata(PingHandler);
            expect(compiled.metadata.applicationCommandType).toBe(ApplicationCommandTypes.ChatInput);
        });
    });
});
