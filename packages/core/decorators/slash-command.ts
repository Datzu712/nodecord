import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { COMMAND_HANDLER_METADATA, HANDLER_WATERMARK } from '../constants/handler.js';
import { CommandHandlerMetadata } from '../interfaces/handler/command-handler.js';
import { ApplicationCommandTypes } from '../constants/application-command-types.js';

/**
 * Class decorator for slash command handlers.
 *
 * The metadata parameter depends on the adapter. For example, the discord.js adapter accepts either a SlashCommandBuilder.
 */
export function SlashCommand(meta: Omit<CommandHandlerMetadata, 'id' | 'applicationCommandType'>): ClassDecorator {
    return (target) => {
        injectable()(target);

        const metadata = {
            id: randomUUID(),
            applicationCommandType: ApplicationCommandTypes.ChatInput,
            ...meta,
        };

        Reflect.defineMetadata(HANDLER_WATERMARK, true, target);
        Reflect.defineMetadata(COMMAND_HANDLER_METADATA, metadata, target);
    };
}
