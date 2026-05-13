import type { ExecutionContext } from '../../context/execution-context.js';

/**
 * Class that implements this interface should be decorated with `@Injectable()` decorator so the framework can
 * find it
 */
export interface ParamPipe<T = unknown> {
    /**
     * Transforms the input value and returns the transformed value. If the transformation fails, it should throw an error
     * that will be caught by some exception filter.
     *
     * @param value The value to be transformed
     */
    transform(value: T, ctx: ExecutionContext): T | Promise<T>;
}
