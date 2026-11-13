/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { AbstractLogger, RegisteredListener } from '../interfaces/index.js';
import type { CommandExecutor } from './command-executor.js';

export interface LoadSlashCommandsOptions {
    token: string;
    clientId: string;
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
    abstract loadSlashCommands(
        options: LoadSlashCommandsOptions,
        commands: RESTPutAPIApplicationCommandsJSONBody,
    ): Promise<void>;

    abstract getClient(): TClientInstance;
}
