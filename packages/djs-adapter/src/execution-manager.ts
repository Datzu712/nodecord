import type { CommandManager } from '@nodecord/core/managers/CommandManager';
import { Message, CommandInteraction } from 'discord.js';

export class ExecutionManager {
    constructor(private commands: CommandManager) {}

    public listenCommands(context: Message | CommandInteraction) {
        const commandName = this.isSlashCommand(context) ? context.commandName : context.content;

        const command = this.commands.get(commandName);
        if (!command) return;

        // command.execute(context);
    }

    public isSlashCommand(context: Message | CommandInteraction): context is CommandInteraction {
        return context instanceof CommandInteraction;
    }
}
