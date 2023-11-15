import type { CommandMetadata } from '@nodecord/core';
import type { CommandManager } from '@nodecord/core/managers/CommandManager';
import { Message, CommandInteraction } from 'discord.js';

export class ExecutionManager {
    constructor(private commands: CommandManager) {}

    public listenCommands(context: Message | CommandInteraction) {
        if (this.isSlashCommand(context)) {
            const command = this.commands.get(`/${context.commandName}`);
            if (!command) return;

            command.execute(context);
        } else {
            const commandName = this.extractCommandName(context.content);
            if (!commandName) return;
            const command = this.commands.get(commandName) as CommandMetadata;

            command.execute(context);
        }
        // const commandName = this.isSlashCommand(context) ? context.commandName : context.content;

        // const command = this.commands.get(commandName);
        // if (!command) return;

        // command.execute(context);
    }

    public isSlashCommand(context: Message | CommandInteraction): context is CommandInteraction {
        return context instanceof CommandInteraction;
    }

    private extractCommandName(content: string, possiblePrefixes = this.commands.prefixes) {
        const prefix = possiblePrefixes.find((prefix) => content.startsWith(prefix));
        if (!prefix) return;

        const commandName = content.slice(prefix.length).split(' ')[0];
        return this.commands.has(commandName) ? commandName : undefined;
    }
}
