import type { Client as DjsClient, ClientEvents } from 'discord.js';
import type { ListenerProvider, RegisteredListener } from '@nodecord/core';

export class EventManager {
    private readonly buckets = new Map<keyof ClientEvents, { once: boolean; listeners: ListenerProvider[] }>();

    register({ metadata, listener }: RegisteredListener<any[]>): void {
        const key = metadata.event as keyof ClientEvents;
        const once = metadata.once;
        const bucket = this.buckets.get(key);

        if (!bucket) {
            this.buckets.set(key, { once: metadata.once ?? false, listeners: [listener] });
            return;
        }

        if (bucket.once !== once) {
            throw new Error(`Cannot mix 'on' and 'once' listeners for event "${key}".`);
        }

        bucket.listeners.push(listener);
    }

    attach(client: DjsClient): void {
        for (const [event, { once, listeners }] of this.buckets) {
            const method = once ? 'once' : 'on';

            client[method](event, (...args: unknown[]) => {
                for (const listener of listeners) {
                    listener.handler(...args);
                }
            });
        }
    }

    /**
     * Emits an event and awaits all async listeners before returning.
     * Intended exclusively for use in testing via TestingAdapter.simulateInteraction().
     * Do not use this in production code.
     */
    public async emitAsync(event: keyof ClientEvents, ...args: unknown[]): Promise<void> {
        const bucket = this.buckets.get(event);
        if (!bucket) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        await Promise.all(bucket.listeners.map((l) => l.handler(...args)));
    }
}
