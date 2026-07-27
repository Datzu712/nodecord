# @nodecord/djs-adapter

[![npm](https://img.shields.io/npm/v/@nodecord/djs-adapter)](https://www.npmjs.com/package/@nodecord/djs-adapter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-nodecord.pages.dev-blue)](https://nodecord.pages.dev/)

The [discord.js](https://discord.js.org/) adapter for [Nodecord](https://github.com/Datzu712/nodecord).

[`@nodecord/core`](https://www.npmjs.com/package/@nodecord/core) holds the framework itself and knows nothing about discord.js. This package is the layer between the two: it owns the discord.js client, translates incoming interactions into the framework's context objects, dispatches events, and registers slash commands against the Discord API.

It also ships a `/testing` subpath for running commands through the real pipeline without connecting to Discord.

## Install

```bash
pnpm add @nodecord/core @nodecord/djs-adapter discord.js
```

`discord.js` v14 and `@nodecord/core` are peer dependencies. See the [core readme](https://www.npmjs.com/package/@nodecord/core) for the required TypeScript compiler options.

## Usage

Most of the time you do not reference this package directly. `NodecordClient.create()` falls back to `DiscordJsAdapter` when no adapter is given, and the options you pass go straight to the discord.js `Client` constructor:

```typescript
import { NodecordClient } from '@nodecord/core';
import { GatewayIntentBits, type ClientOptions } from 'discord.js';

const client = NodecordClient.create<ClientOptions>({
    module: BotModule,
    options: {
        intents: [GatewayIntentBits.Guilds],
    },
});
```

Import it explicitly when you need to hand over a discord.js client you built yourself:

```typescript
import { DiscordJsAdapter } from '@nodecord/djs-adapter';
import { Client, GatewayIntentBits } from 'discord.js';

const djsClient = new Client({ intents: [GatewayIntentBits.Guilds] });

const client = NodecordClient.create({
    module: BotModule,
    adapter: new DiscordJsAdapter(djsClient),
});
```

## Testing

The `/testing` subpath runs the full pipeline, meaning module compilation, DI, the interceptor chain, command dispatch, and response handling, while skipping `login()` and `loadSlashCommands()`. `simulateInteraction()` pushes a mock interaction through it.

```typescript
import { NodecordClient } from '@nodecord/core';
import { TestingDjsAdapter, createMockChatInputInteraction } from '@nodecord/djs-adapter/testing';

const adapter = new TestingDjsAdapter();

NodecordClient.create({
    module: BotModule,
    adapter,
    options: { logger: false },
});

const interaction = createMockChatInputInteraction({ commandName: 'status' });
await adapter.simulateInteraction(interaction);
```

To swap out infrastructure dependencies, combine it with `TestingModule` from the core package:

```typescript
import { TestingModule } from '@nodecord/core';

NodecordClient.create({
    module: TestingModule.create(BotModule).overrideProvider(DatabaseService, mockDatabaseService).build(),
    adapter,
    options: { logger: false },
});
```

`overrideProvider(cls, mock)` replaces the binding for `cls` across the whole module tree.

## Exports

| Entry point                     | Exports                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `@nodecord/djs-adapter`         | `DiscordJsAdapter`                                                       |
| `@nodecord/djs-adapter/testing` | `TestingDjsAdapter`, `createMockChatInputInteraction`, `MockInteraction` |

Both entry points ship ESM and CJS builds with TypeScript declarations.

## Documentation

Full guides live at [nodecord.pages.dev](https://nodecord.pages.dev/). Questions go to the [Discord server](https://discord.com/invite/BSaERbS).

## License

MIT
