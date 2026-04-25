import type { Client as DjsClient, ClientEvents } from 'discord.js';
import type { RegisteredListener } from '@nodecord/core';

export class EventManager {
    private readonly listeners: RegisteredListener<unknown[]>[] = [];

    register(listener: RegisteredListener<any[]>): void {
        this.listeners.push(listener);
    }

    attach(client: DjsClient): void {
        for (const { listener, event } of this.listeners) {
            // todo: avoid duplicate listeners if multiple modules register the same event
            client.on(event as keyof ClientEvents, (...args: unknown[]) => {
                listener.handler(...args);
            });
        }
    }
}
