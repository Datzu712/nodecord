import type { RegisteredCommandHandler } from '@nodecord/core';
import type {
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

export type DjsRegisteredCommand = RegisteredCommandHandler<
    RESTPostAPIContextMenuApplicationCommandsJSONBody | RESTPostAPIChatInputApplicationCommandsJSONBody
>;

export class CommandRegistry {
    private readonly handlers = new Map<string, DjsRegisteredCommand>(); // <command name, handler & metadata>

    register(cmd: DjsRegisteredCommand): void {
        this.handlers.set(cmd.descriptor.name, cmd);
    }

    get(name: string): DjsRegisteredCommand | undefined {
        return this.handlers.get(name);
    }

    getAll(): DjsRegisteredCommand[] {
        return Array.from(this.handlers.values());
    }
}
