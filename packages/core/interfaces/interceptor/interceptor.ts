export interface NodecordInterceptor {
    intercept(executionCo: any, next: () => Promise<any>): Promise<any>;
}
