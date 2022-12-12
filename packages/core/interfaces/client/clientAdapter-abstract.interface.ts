/**
 * @publicApi
 */
export abstract class AbstractClientAdapter {
    /**
     * @param { any } clientInstance - The client instance (djs or biscuit client)
     */
    constructor(protected clientInstance: any) {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public abstract initialize(clientOptions: unknown): void;

    public abstract login(token: string): any;
}
