import type { CommandManager } from '@nodecord/core/managers';
import type { DefinedCommand } from '../../interfaces/command/defined-command.interface';

export interface LoadSlashCommandsOptions {
    /**
     * The token used to authenticate with the Discord API.
     * This should be the bot token from your Discord application.
     */
    token: string;

    /**
     * The client ID of your Discord application.
     * This is used to register the slash commands to your application.
     */
    clientId: string;

    /**
     * The version of the Discord REST API to use.
     * By default, this is '10'.
     */
    restVersion?: string;

    /**
     * An array of commands to register as slash commands.
     * If this is not provided, the global slash commands from the command list will be used.
     */
    commands?: DefinedCommand[];
}

/**
 * @publicApi
 */
export abstract class AbstractClientAdapter<TClientInstance = any> {
    public commands!: CommandManager;

    constructor(protected clientInstance: TClientInstance) {}

    abstract initialize(): void;
    abstract login(token: string): any;
    abstract loadSlashCommands(options: LoadSlashCommandsOptions): Promise<void>;
    abstract on(event: string, listener: (...args: any[]) => void): AbstractClientAdapter<TClientInstance>;
    abstract once(event: string, listener: (...args: any[]) => void): AbstractClientAdapter<TClientInstance>;
    abstract emit(event: string, ...args: any[]): AbstractClientAdapter<TClientInstance>;

    abstract getClient(): TClientInstance;
}
