import type { CommandManager } from '@nodecord/core/managers';

/**
 * @publicApi
 */
export abstract class AbstractClientAdapter<TClientInstance = any> {
    public commands!: CommandManager;

    constructor(protected clientInstance: TClientInstance) {}

    abstract initialize(commands: CommandManager): void;
    abstract login(token: string): any;
    abstract loadSlashCommands(token: string, clientId: string): Promise<void>;
    abstract on(event: string, listener: (...args: any[]) => void): void;
    abstract once(event: string, listener: (...args: any[]) => void): void;
    abstract emit(event: string, ...args: any[]): void;
}
