/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegisteredCommandHandler, RegisteredListener } from '../interfaces/index.js';
import type { CommandExecutor } from './command-executor.js';

export abstract class AbstractClientAdapter<TClientInstance = any> {
    constructor(protected clientInstance: TClientInstance) {}

    abstract initialize(
        executor: CommandExecutor,
        handlers: RegisteredCommandHandler[],
        listeners: RegisteredListener<unknown[]>[],
    ): void;
    abstract login(token: string): Promise<void>;
    abstract loadSlashCommands(): Promise<void>;

    abstract getClient(): TClientInstance;
}
