import { Logger, type CommandMetadata } from '@nodecord/core';
import type { CommandManager } from '@nodecord/core/managers/CommandManager';
import { Message, CommandInteraction, Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';

export class ExecutionManager {
    private logger = new Logger('ExecutionManager');

    constructor(private commands: CommandManager) {}

    public listenCommands(context: Message | CommandInteraction) {
        if (this.isSlashCommand(context)) {
            const command = this.commands.get(`/${context.commandName}`);
            if (!command) return;

            command.execute(context);
        } else {
            if (context.author.bot) return;
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

    /**
     * Registers the slash commands for the Discord bot application.
     * @param token - The Discord bot token.
     * @param clientId - The Discord bot client ID.
     */
    public async registerSlashCommands(token: string, clientId: string) {
        this.checkSlashCommandsIntegrity();

        const slashCommands = this.commands.getSlashCommands();
        const rest = new REST({ version: '10' }).setToken(token);

        await rest.put(Routes.applicationCommands(clientId), {
            body: slashCommands.map((command) => (command.metadata.options as SlashCommandBuilder).toJSON()),
        });
        this.logger.log(`Successfully registered ${slashCommands.length} slash commands`);
    }

    /**
     * Checks the integrity of the slash commands by verifying that each command has options.
     * Throws an error if a command has no options.
     */
    private checkSlashCommandsIntegrity() {
        const slashCommands = this.commands.getSlashCommands();

        for (const command of slashCommands) {
            if (!(command.metadata.options instanceof SlashCommandBuilder)) {
                throw new Error(`Slash command ${command.metadata.name} has no options`);
            }
        }
    }
}
