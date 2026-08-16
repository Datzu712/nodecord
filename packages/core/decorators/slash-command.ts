import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { COMMAND_HANDLER_DEFINITION, COMMAND_HANDLER_METADATA, HANDLER_WATERMARK } from '../constants/handler.js';
import { InvalidCommandDefinitionException } from '../client/exceptions/module.js';
import {
    CommandDefinitionBuilder,
    CommandHandlerMetadata,
    SlashCommandDefinition,
} from '../interfaces/handler/command-handler.js';
import { ApplicationCommandTypes } from '../constants/application-command-types.js';

function isCommandDefinitionBuilder(definition: SlashCommandDefinition): definition is CommandDefinitionBuilder {
    return (
        typeof definition === 'object' &&
        definition !== null &&
        typeof (definition as CommandDefinitionBuilder).toJSON === 'function'
    );
}

/**
 * Class decorator for slash command handlers.
 *
 * Accepts either a plain definition object (`{ name, description, ... }`) or any builder exposing a
 * `toJSON()` method (e.g. a discord.js `SlashCommandBuilder`). The builder is detected structurally
 * (duck-typing), never via `instanceof`, since `packages/core` cannot depend on discord.js.
 *
 * The `definition` argument passed here is preserved BY IDENTITY on the compiled handler (see
 * `CompiledCommandHandler.definition`) so adapters can use the exact same object/builder instance for
 * command registration. `toJSON()` is only called once, at decoration time, to normalize and validate
 * the framework's own `CommandHandlerMetadata`.
 *
 * Only chat input (slash) commands are supported: `name` and `description` are always required, and a
 * `type` other than `ApplicationCommandTypes.ChatInput` throws `InvalidCommandDefinitionException`. If
 * `toJSON()` itself throws (e.g. a discord.js builder rejects an incomplete definition), the error is
 * caught and rethrown as `InvalidCommandDefinitionException` naming the handler class.
 */
export function SlashCommand(definition: SlashCommandDefinition): ClassDecorator {
    return (target) => {
        injectable()(target);

        const isBuilder = isCommandDefinitionBuilder(definition);
        let source: unknown;

        if (isBuilder) {
            try {
                source = definition.toJSON();
            } catch (error) {
                const reason = error instanceof Error ? error.message : String(error);

                throw new InvalidCommandDefinitionException(
                    target.name,
                    `toJSON() threw while normalizing the definition: ${reason}`,
                );
            }
        } else {
            source = definition;
        }

        if (typeof source !== 'object' || source === null) {
            const reason = isBuilder
                ? 'toJSON() must return a non-null object.'
                : 'the definition must be a non-null object.';

            throw new InvalidCommandDefinitionException(target.name, reason);
        }

        const src = source as Record<string, unknown>;

        if (typeof src.name !== 'string' || src.name.length === 0) {
            throw new InvalidCommandDefinitionException(target.name, 'name must be a non-empty string.');
        }

        if (src.type !== undefined && src.type !== ApplicationCommandTypes.ChatInput) {
            throw new InvalidCommandDefinitionException(
                target.name,
                '@SlashCommand only supports chat input commands (type 1).',
            );
        }

        const applicationCommandType: ApplicationCommandTypes = ApplicationCommandTypes.ChatInput;

        if (typeof src.description !== 'string' || src.description.length === 0) {
            throw new InvalidCommandDefinitionException(
                target.name,
                'description must be a non-empty string for ChatInput commands.',
            );
        }

        const metadata: CommandHandlerMetadata = {
            id: randomUUID(),
            name: src.name,
            description: src.description,
            applicationCommandType,
        };

        if (typeof src.nsfw === 'boolean') {
            metadata.nsfw = src.nsfw;
        }

        Reflect.defineMetadata(HANDLER_WATERMARK, true, target);
        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, metadata, target);
        Reflect.defineMetadata(COMMAND_HANDLER_DEFINITION, definition, target);
    };
}
