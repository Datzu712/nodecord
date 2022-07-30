/* eslint-disable @typescript-eslint/no-explicit-any */
// type any is provisional.
export interface NodecordClientConfig {
    logger: any;
    intents: any;
    partials: any;
    defaultPrefix: string;
}

export interface NodecordClient {
    readonly commands: any;
    readonly events: any;
    readonly categories: any;

    /**
     * Init the client.
     *
     * @param {object} config - client configuration
     * @returns {Promise<void>}
     */
    init(config: NodecordClientConfig): Promise<void>;

    /**
     * Login to the client.
     *
     * @param {string} token - token to login with
     * @returns {Promise<void>} promise that resolves when login is complete
     */
    login(token: string): Promise<void>;

    /**
     * Logout of the client.
     * @returns {Promise<void>} promise that resolves when logout is complete
     */
    logout(): Promise<void>;

    /**
     * Get the original client instance (may be djs or eris client).
     * @returns {*} base client instance
     */
    getOriginalClient(): any;
}
