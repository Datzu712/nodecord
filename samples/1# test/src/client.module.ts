import { ClientModule } from '@nodecord';

import { UtilityCategory } from './commands';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}
