export interface ListenerProvider {
    event: string;
    handler: (...args: any[]) => void;
}
