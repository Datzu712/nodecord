export interface Type<TInstance = any> extends Function {
    new (...args: any[]): TInstance;
}
