import { inject } from 'inversify';
import type { Type } from '../interfaces/common/type.js';

export function Inject(token: Type): ParameterDecorator {
    return inject(token);
}
