import { Interceptor, NodecordInterceptor } from '@nodecord/core';

@Interceptor()
export class LoggerInterceptor implements NodecordInterceptor {
    intercept(context: any, next: () => Promise<any>): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
