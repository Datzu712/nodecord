import { inject } from 'inversify';
import type { Type } from '../interfaces/common/constructor.js';

export function Inject(token: Type): ParameterDecorator {
    return inject(token);
}
