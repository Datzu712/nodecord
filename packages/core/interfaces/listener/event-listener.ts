export interface ListenerProvider<TEventArgs extends unknown[] = unknown[]> {
    handler: (...args: TEventArgs) => void;
}

export interface RegisteredListener<TEventArgs extends unknown[] = unknown[]> {
    event: any;
    listener: ListenerProvider<TEventArgs>;
}
