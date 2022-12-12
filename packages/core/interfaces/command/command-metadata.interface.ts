/**
 * Base interface for command metadata.
 * You can extend this interface to add your own metadata. (TODO)
 */
export interface CommandMetadata {
    name: string;
    aliases: string[];
    category: object;
}
