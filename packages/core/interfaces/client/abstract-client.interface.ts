/**
 * Common client properties of eris and djs
 */
export interface AbstractClient {
    application: object;
    bot: object;
    guilds: Map<string, object>;
    user: object;
}
