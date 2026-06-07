/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractLogger, RegisteredListener } from '../interfaces/index.js';
import type { CommandExecutor } from './command-executor.js';

export interface LoadSlashCommandsOptions {
    token: string;
    clientId: string;
    restVersion?: string;
}

export interface InitAdapterOptions {
    executor: CommandExecutor;
    listeners: RegisteredListener<unknown[]>[];
    logger?: AbstractLogger | false;
}

export abstract class AbstractClientAdapter<TClientInstance = any> {
    constructor(protected clientInstance: TClientInstance) {}

    abstract initialize(adapterOptions: InitAdapterOptions): void;
    abstract login(token: string): Promise<void>;
    abstract loadSlashCommands(options: LoadSlashCommandsOptions): Promise<void>;

    abstract getClient(): TClientInstance;
}
