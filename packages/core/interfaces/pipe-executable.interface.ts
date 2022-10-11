export interface PipeExecutable<TValue = any, TReturn = any> {
    run(value: TValue): TReturn;
}
