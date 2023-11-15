# @nodecord/core

<p align="center">
  <a href="/" target="blank"><img src="https://media.discordapp.net/attachments/838828747762827338/1122284372184281169/image.png" width="500" alt="nodecord logo" /></a>
</p>

<p align="center"><strong>A powerful Discord API wrapper for Node.js<strong></p>

## Basic bot usage

### Commands

Commands are a way that users can interact with your bot. We also support slash commands.

> *Message-based commands*

```ts
// src/categories/util/commands/ping.command.ts
import { Command, ICommand, Msg } from '@nodecord/core';
import type { Message } from 'discord.js';

@Command({
    name: 'ping',
    aliases: ['p'],
})
export class PingCommand implements ICommand {
    execute(@Msg() message: Message) {
        message.channel.send('Pong!');
    }
}

```

> *Slash commands*

```ts
// src/categories/util/slashCommands/ping.command.ts
import { SlashCommand, ICommand, Interaction } from '@nodecord/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { pingSlashOptions } from './options/ping.options';

@SlashCommand({
    name: 'ping',
    aliases: ['p'],
    options: pingSlashOptions,
})
export class PingSlashCommand implements ICommand {
    execute(@Interaction() interaction: ChatInputCommandInteraction) {
        interaction.reply('Pong!');
    }
}

```

### Categories

Nodecord groups commands by categories. A category is a group of commands that have something in common. For example, a category called "utility" could have commands like "ping", "help", "invite", etc...

```ts
// src/categories/util/util.category.ts
import { Category } from '@nodecord/core';

import { PingCommand } from './commands/ping.command';
import { PingSlashCommand } from './slashCommands/ping.command';

@Category({
    metadata: {
        name: 'util',
    },
    commands: [PingCommand, PingSlashCommand],
})
export class UtilityCategory {}

```

### Client Module

The client module will include all categories, etc...

```ts
import { ClientModule } from '@nodecord/core';

import { UtilityCategory } from './categories/util/util.category';

@ClientModule({
    categories: [UtilityCategory],
})
export class Client {}
```

And finally, the main file to start the bot.

```ts
import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { Partials, type ClientOptions, GatewayIntentBits } from 'discord.js';

(async function () {
    const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;

    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
        prefix: ['!'],
    });

    await bot.loadSlashCommands(yourBotToken, yourBotId);
    await bot.login(yourBotToken);
})();
```

## Help

Nodecord is still in development, and we're striving to make it production-ready. Currently, only the 'Legacy Commands' and slash commands are functional. If you'd like to assist us, please join our [Discord server](https://discord.gg/BSaERbS) and contact us.

### todo

- [ ] Add custom decorators
- [ ] Add some kind of middleware for commands
- [ ] Add custom events
- [ ] Add param decorators for commands
- [ ] Add support for other libraries
- [ ] Command response based on command return
- [ ] Commands debugging

There are many more things to do, but we're working on it.
