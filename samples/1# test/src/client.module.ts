import { ClientModule } from '@nodecord';

import { UtilityCategory } from './commands/util/util.category';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}
