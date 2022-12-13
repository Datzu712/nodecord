import type { ClientModuleMetadata } from '../../interfaces';
import { MAIN_MODULE_WATERMARK } from '../../constants';

export function ClientModule(metadata: ClientModuleMetadata): ClassDecorator {
    return (target: object) => {
        for (const property in metadata) {
            if (Object.prototype.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property as keyof typeof metadata], target);
            }
        }
        Reflect.defineMetadata(MAIN_MODULE_WATERMARK, true, target);
    };
}
