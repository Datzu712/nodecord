export interface ListenerProvider<TEventArgs extends unknown[]> {
    handler: (...args: TEventArgs) => void;
}

export interface RegisteredListener<TEventArgs extends unknown[]> {
    event: any;
    listener: ListenerProvider<TEventArgs>;
}
