// Abstract type for a class constructor
export interface Type<T = any> {
    new (...args: any[]): T;
}
