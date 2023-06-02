/**
 * @publicApi
 */
export abstract class AbstractClientAdapter {
    constructor(protected clientInstance: any) {}

    abstract initialize(clientOptions: any): void;
    abstract login(token: string): any;
    abstract on(event: string, listener: (...args: any[]) => void): void;
    abstract once(event: string, listener: (...args: any[]) => void): void;
    abstract emit(event: string, ...args: any[]): void;
}
