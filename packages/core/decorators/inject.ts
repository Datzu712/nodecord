import { inject } from 'inversify';
import type { Constructor } from '../interfaces/common/constructor.js';

export function Inject(token: Constructor): ParameterDecorator {
    return inject(token);
}
