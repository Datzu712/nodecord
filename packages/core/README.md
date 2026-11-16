# @nodecord/core

[![npm](https://img.shields.io/npm/v/@nodecord/core)](https://www.npmjs.com/package/@nodecord/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-nodecord.pages.dev-blue)](https://nodecord.pages.dev/)

The framework core of [Nodecord](https://github.com/Datzu712/nodecord), a TypeScript framework for building Discord bots around modules, dependency injection, and decorators.

This package holds the parts that do not depend on any Discord library: module compilation, the container hierarchy, the decorators, the command execution pipeline, interceptors, and exception handlers. To actually talk to Discord you also need an adapter, normally [`@nodecord/djs-adapter`](https://www.npmjs.com/package/@nodecord/djs-adapter).

## Install

```bash
pnpm add @nodecord/core @nodecord/djs-adapter discord.js
```

Nodecord uses TypeScript's legacy decorators and reads constructor types from decorator metadata, so both options have to be enabled:

```jsonc
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    },
}
```

You do not need to install or import `reflect-metadata` yourself. It arrives as a transitive dependency of Inversify and the polyfill is installed when this package is first imported.

Requires Node.js 20 or newer.

## Quick start

A module declares what it provides, which commands it owns, and which other modules it needs.

```typescript
import { Module } from '@nodecord/core';

@Module({
    imports: [LoggerModule],
    providers: [PingService],
    handlers: [PingCommand],
})
export class BotModule {}
```

A command is a class decorated with `@SlashCommand`. Services arrive through the constructor, Discord data through parameter decorators on `execute()`.

```typescript
import { Author, CommandHandler, SlashCommand } from '@nodecord/core';
import { User } from 'discord.js';

@SlashCommand({ name: 'ping', description: 'Replies with pong' })
export class PingCommand implements CommandHandler {
    constructor(private readonly pingService: PingService) {}

    execute(@Author() author: User): string {
        return `Pong! Hello, ${author.username}!`;
    }
}
```

Bootstrapping compiles the module tree, wires the containers, and initializes the adapter:

```typescript
import { NodecordClient } from '@nodecord/core';
import { GatewayIntentBits, type ClientOptions } from 'discord.js';

import { BotModule } from './bot.module.js';

const client = NodecordClient.create<ClientOptions>({
    module: BotModule,
    options: {
        intents: [GatewayIntentBits.Guilds],
    },
});

await client.loadSlashCommands({
    token: process.env.BOT_TOKEN!,
    clientId: process.env.CLIENT_ID!,
});

await client.login(process.env.BOT_TOKEN!);
```

`adapter` is optional. Pass an adapter instance, an adapter class, or leave it out and `DiscordJsAdapter` is used.

Use `client.get(SomeService)` to pull an instance out of the dependency graph.

## What this package exports

| Decorator                | Applies to  | Purpose                                                  |
| ------------------------ | ----------- | -------------------------------------------------------- |
| `@Module()`              | class       | Declares imports, providers, handlers, and listeners     |
| `@Injectable()`          | class       | Marks a class as resolvable by the container             |
| `@Inject()`              | constructor | Injects a specific token                                 |
| `@SlashCommand()`        | class       | Registers a slash command handler                        |
| `@Listener()`            | class       | Registers a Discord event listener                       |
| `@Autocomplete('opt')`   | method      | Handles autocomplete for one option of the command       |
| `@Interceptor()`         | class       | Wraps command execution                                  |
| `@UseInterceptors()`     | class       | Attaches interceptors to a single handler                |
| `@OnException()`         | class       | Registers an exception handler for given exception types |
| `@UseExceptionHandler()` | class       | Attaches exception handlers to a single handler          |
| `@DeferReply()`          | method      | Defers the reply before running the handler              |

Parameter decorators, valid on both `execute()` and `@Autocomplete()` methods:

| Decorator               | Resolves to                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `@Context()` / `@Ctx()` | The `InteractionContext` for the current interaction            |
| `@Author()`             | The user who triggered the interaction                          |
| `@Guild()`              | The guild the interaction came from, or `null`                  |
| `@Option('a')`          | The value of that option, or `undefined` if it was not provided |
| `@Option('a', 'b')`     | A record of the provided ones among them, keyed by name         |
| `@Option()`             | A record of every provided option, keyed by name                |
| `@Focused()`            | What the user has typed in the option being autocompleted       |

Each one hands over the library's own object, so type the parameter with the library's types: with the discord.js adapter, `@Author()` is a discord.js `User`.

Also exported: `NodecordClient`, `TestingModule`, `ConsoleLogger`, the context classes (`InteractionContext`, `ChatInputCommandContext`, `AutocompleteContext`, `ContextMenuContext`), `AbstractClientAdapter` and the `AdapterTypes` contract for writing your own adapter, and the framework exception types.

## Documentation

Full guides live at [nodecord.pages.dev](https://nodecord.pages.dev/). Questions go to the [Discord server](https://discord.com/invite/BSaERbS).

## Status

The API is still moving. Modules, DI, slash commands, listeners, parameter decorators, autocomplete, interceptors, exception handlers, and the testing utilities work today. Buttons, modals, select menus, and context menu commands are not implemented yet.

## License

MIT
