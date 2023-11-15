import { ClientModule } from '@nodecord/core';

import { UtilityCategory } from './categories/util/util.category';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}

// console.log(Reflect.getMetadata('categories', Client));
