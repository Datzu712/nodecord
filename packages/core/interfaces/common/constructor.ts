/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Constructor<T = any> {
    new (...args: any[]): T;
}

// Alias for backwards compatibility, but `Constructor` is more descriptive and should be preferred in new code.
/** @deprecated Use `Constructor<T>` instead */
export type Type<T = any> = Constructor<T>;
