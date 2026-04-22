export abstract class AbstractClientAdapter<TClientInstance = any> {
    constructor(protected clientInstance: TClientInstance) {}

    abstract initialize(): void;
    abstract login(token: string): any;
    abstract loadSlashCommands(options: any): Promise<void>;

    abstract getClient(): TClientInstance;
}
