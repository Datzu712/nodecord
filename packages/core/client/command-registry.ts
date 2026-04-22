import type { AbstractCommand } from '../commands/abstract-command.js';

/**
 * In a future we might want to register context menus, select menus, etc...
 */
export class CommandRegistry {
    private readonly commands = new Map<string, AbstractCommand>();

    register(command: AbstractCommand): void {
        this.commands.set(command.name, command);
    }

    get(name: string): AbstractCommand | undefined {
        return this.commands.get(name);
    }

    getAll(): AbstractCommand[] {
        return Array.from(this.commands.values());
    }
}
