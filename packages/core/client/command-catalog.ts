import type { CompiledCommandHandler } from '../interfaces/handler/command-handler.js';
import { DuplicateCommandNameException } from './exceptions/module.js';

/**
 * Read-only view over the command handlers compiled from a module tree.
 *
 * Built once per `NodecordClient` (see `NodecordClient.create()`) and handed to the adapter through
 * `InitAdapterOptions.commands`, so adapters can register commands without depending on `ModuleCompiler`
 * internals.
 */
export class CommandCatalog {
    private readonly handlers: readonly CompiledCommandHandler[];

    /**
     * @throws {DuplicateCommandNameException} when two handlers share the same `metadata.name` and
     * `metadata.applicationCommandType`.
     */
    constructor(handlers: readonly CompiledCommandHandler[]) {
        const snapshot = Object.freeze([...handlers]);
        const seen = new Set<string>();

        for (const handler of snapshot) {
            const key = `${handler.metadata.applicationCommandType}:${handler.metadata.name}`;

            if (seen.has(key)) {
                throw new DuplicateCommandNameException(handler.metadata.name);
            }

            seen.add(key);
        }

        this.handlers = snapshot;
    }

    /**
     * Returns every compiled command handler, as a frozen array snapshot.
     */
    getAll(): readonly CompiledCommandHandler[] {
        return this.handlers;
    }

    /**
     * Looks up a command handler by its `metadata.name`.
     *
     * Uniqueness is only enforced per `name` + `applicationCommandType` pair (see the constructor), so
     * two commands sharing a name across different `applicationCommandType`s (e.g. a `ChatInput` command
     * and a `User` context menu command both named `"ping"`) are both valid. In that case, this returns
     * whichever of them appears first in compile order.
     */
    getByName(name: string): CompiledCommandHandler | undefined {
        return this.handlers.find((handler) => handler.metadata.name === name);
    }

    /**
     * Number of command handlers in the catalog.
     */
    get size(): number {
        return this.handlers.length;
    }
}
