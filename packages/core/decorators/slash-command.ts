import { injectable } from 'inversify';
import { randomUUID } from 'node:crypto';

import { HandlerTypes } from '../enums/command-types.enum.js';
import { HANDLER_METADATA, HANDLER_WATERMARK } from '../constants/handler.js';
import { HandlerMetadata } from '../interfaces/handler/command-handler.js';

/**
 * Class decorator for slash command handlers.
 *
 * The metadata parameter depends on the adapter. For example, the discord.js adapter accepts either a SlashCommandBuilder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SlashCommand(definition: any): ClassDecorator {
    return (target) => {
        injectable()(target);

        const metadata: HandlerMetadata = {
            id: randomUUID(),
            type: HandlerTypes.SLASH,
            definition,
        };

        Reflect.defineMetadata(HANDLER_WATERMARK, true, target);
        Reflect.defineMetadata(HANDLER_METADATA, metadata, target);
    };
}
