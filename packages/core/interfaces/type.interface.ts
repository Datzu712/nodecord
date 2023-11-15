/* eslint-disable @typescript-eslint/ban-types */
export interface Type<TInstance = any> extends Function {
    new (...args: any[]): TInstance;
}
