import { ClientModule } from '@nodecord/core';

import { UtilityCategory } from './commands/util/util.category';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}

// console.log(Reflect.getMetadata('categories', Client));
