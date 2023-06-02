// todo: Change discord.js to @discordjs/rest & @discordjs/ws
import { Client } from 'discord.js';
import { AbstractClientAdapter, type ICommand } from '@nodecord/core';

export class DiscordJsAdapter extends AbstractClientAdapter {
    constructor(instance?: Client) {
        super(instance);
    }

    public login(token: string) {
        this.clientInstance.login(token);
    }

    public initialize(commands: ICommand[]) {
        commands;
    }

    public on(event: string, listener: (...args: any[]) => void) {
        this.clientInstance.on(event, listener);
    }

    public once(event: string, listener: (...args: any[]) => void) {
        this.clientInstance.once(event, listener);
    }

    public emit(event: string, ...args: any[]) {
        this.clientInstance.emit(event, ...args);
    }
}
