export abstract class AbstractCommand {
    abstract readonly name: string;
    abstract readonly description: string;

    abstract execute(...args: unknown[]): unknown | Promise<unknown>;
}
