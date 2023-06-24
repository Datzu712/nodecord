<p align="center">
  <a href="/" target="blank"><img src="https://media.discordapp.net/attachments/838828747762827338/1122284372184281169/image.png" width="500" alt="nodecord logo" /></a>
</p>

<p align="center"><strong>A powerful Discord API wrapper for Node.js<strong></p>

# Basic bot usage

Commands are a way that users can interact with your bot. We also support slash commands.
```ts
// src/commands/util/ping.command.ts
import { 
    Command, 
    User,
    ICommand,
} from '@nodecord/core';

@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute(@User() user: User) {
        return `Pong ${user.tag}!`;
    }
}
```

Categories are a way to group commands together.
```ts
// src/commands/util/util.category.ts
import { Category } from '@nodecord/core';

import { PingCommand } from './commands/ping.command';

@Category({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand],
})
export class UtilityCategory {}
```

The client module will include all categories, custom events, providers, etc...
```ts
import { ClientModule } from '@nodecord/core';

import { UtilityCategory } from './commands/util/util.category';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}
```

And finally, the main file to start the bot.
```ts
import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import { Partials, type ClientOptions, IntentsBitField } from 'discord.js';
import { resolve } from 'path';

config({ path: resolve(__dirname + '/../.env') });

(async function () {
    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: [
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
    });

    bot.login(process.env.DISCORD_CLIENT_TOKEN);
})();
```

## About the actual status of nodecord
Nodecord is still in development, and is not ready for production use. We are working hard to make it ready for production use, but we need your help! If you want to help us, please join our [discord server](https://discord.gg/BSaERbS) and contact us.