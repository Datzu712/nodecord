import { Client, SlashCommandBuilder, type ClientEvents, type ClientOptions, REST, Routes } from 'discord.js';
import { AbstractClientAdapter, LoadSlashCommandsOptions, Logger } from '@nodecord/core';
import { EventTracker } from './tracker';

export class DiscordJsAdapter extends AbstractClientAdapter<Client> {
    private logger = new Logger('djsAdapter');
    private eventTracker: EventTracker;

    constructor(instanceOrOptions: Client | ClientOptions) {
        super(instanceOrOptions instanceof Client ? instanceOrOptions : new Client(instanceOrOptions));

        this.eventTracker = new EventTracker(this);
    }

    /**
     * Loads and registers slash commands for the Discord bot.
     * @param { LoadSlashCommandsOptions } options - The options for loading slash commands.
     * @param { string } options.token - The token used to authenticate with the Discord API. This should be the bot token from your Discord application.
     * @param { string } options.clientId - The client ID of your Discord application. This is used to register the slash commands to your application.
     * @param { string } [options.restVersion='10'] - The version of the Discord REST API to use. By default, this is '10'.
     * @param { DefinedCommand[] } [options.commands] - An array of commands to register as slash commands. If this is not provided, the global slash commands from the commands manager list will be used.
     * @returns { Promise<void> } - A promise that resolves when the slash commands are successfully registered.
     */
    public async loadSlashCommands({
        token,
        clientId,
        restVersion = '10',
        commands,
    }: LoadSlashCommandsOptions): Promise<void> {
        const slashCommands = commands
            ? commands
            : this.commands.getSlashCommands().filter((slash) => slash.metadata.global);
        this.checkSlashCommandsIntegrity(slashCommands);

        const rest = new REST({ version: restVersion }).setToken(token);
        await rest.put(Routes.applicationCommands(clientId), {
            body: slashCommands.map((command) => (command.metadata.options as SlashCommandBuilder).toJSON()),
        });
        this.logger.log(`Successfully registered ${slashCommands.length} slash commands`);
    }

    public async login(token: string) {
        this.clientInstance.login(token);
    }

    public initialize() {
        this.eventTracker.listenMainEvents();
    }

    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void) {
        this.clientInstance.on(event, listener);

        return this;
    }

    public once(event: string, listener: (...args: any[]) => void) {
        this.clientInstance.once(event, listener);

        return this;
    }

    public emit(event: string, ...args: any[]) {
        this.clientInstance.emit(event, ...args);

        return this;
    }

    /**
     * Checks the integrity of the slash commands by verifying that each command has options.
     * Throws an error if a command has no options.

     */
    private checkSlashCommandsIntegrity(slashCommands = this.commands.getSlashCommands()) {
        for (const command of slashCommands) {
            if (!(command.metadata.options instanceof SlashCommandBuilder)) {
                this.logger.debug(
                    `${command.metadata.name} (${command.metadata.options?.constructor.name}) is not an instance of SlashCommandBuilder`,
                );
                throw new Error(`Slash command ${command.metadata.name} has no options or aren't valid. `);
            }
        }
        return this;
    }

    public getClient() {
        return this.clientInstance;
    }
}
