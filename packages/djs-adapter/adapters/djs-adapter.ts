// todo: Change discord.js to @discordjs/rest & @discordjs/ws
import { Client, type ClientEvents, type ClientOptions, type CommandInteraction } from 'discord.js';
import { AbstractClientAdapter, Logger } from '@nodecord/core';
import { ExecutionManager } from './execution-manager';
import type { CommandManager } from '@nodecord/core/managers';

export class DiscordJsAdapter extends AbstractClientAdapter<Client, ExecutionManager> {
    private logger = new Logger('djsAdapter');

    constructor(instanceOrOptions: Client | ClientOptions) {
        const instance = instanceOrOptions instanceof Client ? instanceOrOptions : new Client(instanceOrOptions);

        super(instance);
    }

    public async loadSlashCommands(token: string, clientId: string) {
        if (!this.executionManager) throw new Error('Execution manager not initialized.');

        await this.executionManager.registerSlashCommands(token, clientId);
    }

    public async login(token: string) {
        this.clientInstance.login(token);
    }

    public initialize(commands: CommandManager) {
        this.executionManager = new ExecutionManager(commands);

        this.on('ready', () =>
            this.logger.log(`Logged in as ${this.clientInstance.user?.tag} (${this.clientInstance.user?.id})`),
        );

        if (commands.hasSlashCommands()) {
            this.on('interactionCreate', (interaction) =>
                this.executionManager.listenCommands(interaction as CommandInteraction),
            );
        }

        if (commands.hasChannelInputCommands()) {
            this.on('messageCreate', (message) => this.executionManager.listenCommands(message));
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
}
