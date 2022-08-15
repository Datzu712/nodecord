import { ClientModule } from '@nodecord/common';

import { UtilityCategory } from './modules';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}
