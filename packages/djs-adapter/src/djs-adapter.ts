// todo: Change discord.js to @discordjs/rest & @discordjs/ws
import { Client } from 'discord.js';
import { AbstractClientAdapter } from '@nodecord/core';

export class DiscordJsAdapter extends AbstractClientAdapter {
    constructor(instance?: Client) {
        super(instance);
    }

    public initialize(clientOptions: unknown): void {
        clientOptions;
        throw new Error('Method not implemented.');
    }
    public login(token: string) {
        token;
        throw new Error('Method not implemented.');
    }
}
