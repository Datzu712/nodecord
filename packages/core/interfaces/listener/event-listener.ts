export interface ListenerProvider<TEventArgs extends unknown[] = unknown[]> {
    handler: (...args: TEventArgs) => any;
}

export interface ListenerMetadata {
    id: string;
    event: any;
    once?: boolean;
}

export interface RegisteredListener<TEventArgs extends unknown[] = unknown[]> {
    listener: ListenerProvider<TEventArgs>;
    metadata: ListenerMetadata;
}
