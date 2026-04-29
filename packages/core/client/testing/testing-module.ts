import { TESTING_OVERRIDES_METADATA } from '../../constants/testing.js';
import { Constructor } from '../../interfaces/index.js';

export class TestingModule {
    private readonly overrides = new Map<Constructor, unknown>();

    private constructor(private readonly moduleClass: Constructor) {}

    static create(moduleClass: Constructor): TestingModule {
        return new TestingModule(moduleClass);
    }

    overrideProvider<T>(cls: Constructor<T>, mock: T): this {
        this.overrides.set(cls, mock);
        return this;
    }

    build(): Constructor {
        Reflect.defineMetadata(TESTING_OVERRIDES_METADATA, this.overrides, this.moduleClass);

        return this.moduleClass;
    }
}
