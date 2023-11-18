import { Client, SlashCommandBuilder, type ClientEvents, type ClientOptions, REST, Routes } from 'discord.js';
import { AbstractClientAdapter, CommandTypes, Logger } from '@nodecord/core';

export class DiscordJsAdapter extends AbstractClientAdapter<Client> {
    private logger = new Logger('djsAdapter');

    constructor(instanceOrOptions: Client | ClientOptions) {
        const instance = instanceOrOptions instanceof Client ? instanceOrOptions : new Client(instanceOrOptions);

        super(instance);
    }

    /**
     * Registers the slash commands for the Discord bot application.
     * @param token - The Discord bot token.
     * @param clientId - The Discord bot client ID.
     */
    public async loadSlashCommands(token: string, clientId: string) {
        this.checkSlashCommandsIntegrity();

        const slashCommands = this.commands.getSlashCommands();
        const rest = new REST({ version: '10' }).setToken(token);

        await rest.put(Routes.applicationCommands(clientId), {
            body: slashCommands.map((command) => (command.metadata.options as SlashCommandBuilder).toJSON()),
        });
        this.logger.log(`Successfully registered ${slashCommands.length} slash commands`);
    }

    public async login(token: string) {
        this.clientInstance.login(token);
    }

    public initialize() {
        this.on('ready', () =>
            this.logger.log(`Logged in as ${this.clientInstance.user?.tag} (${this.clientInstance.user?.id})`),
        );

        if (this.commands.hasSlashCommands()) {
            this.on('interactionCreate', (interaction) => {
                if (interaction.isChatInputCommand()) {
                    this.commands.execute(interaction, interaction.commandName, CommandTypes.SLASH);
                }
            });
        }

        if (this.commands.hasLegacyCommands()) {
            this.on('messageCreate', (msg) => this.commands.execute(msg, msg.content, CommandTypes.LEGACY));
        }
    }

    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void) {
        this.clientInstance.on(event, listener);
    }

    public once(event: string, listener: (...args: any[]) => void) {
        this.clientInstance.once(event, listener);
    }

    public emit(event: string, ...args: any[]) {
        this.clientInstance.emit(event, ...args);
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
