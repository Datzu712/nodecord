export interface ICommandExceptionFilter<T = any> {
    catch(exception: T, host: any): void;
}
