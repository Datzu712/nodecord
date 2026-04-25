import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { HandlerTypes } from '../enums/command-types.enum.js';
import { HANDLER_ID, HANDLER_METADATA, HANDLER_WATERMARK } from '../constants/handler.js';

/**
 * Class decorator for slash command handlers.
 *
 * The metadata parameter depends on the adapter. For example, the discord.js adapter accepts either a SlashCommandBuilder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SlashCommand(metadata: any): ClassDecorator {
    return (target) => {
        injectable()(target);
        Reflect.defineMetadata(HANDLER_WATERMARK, HandlerTypes.SLASH, target);
        Reflect.defineMetadata(HANDLER_METADATA, metadata, target);
        Reflect.defineMetadata(HANDLER_ID, randomUUID(), target);
    };
}
