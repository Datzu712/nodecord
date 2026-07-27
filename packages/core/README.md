# @nodecord/core

[![npm](https://img.shields.io/npm/v/@nodecord/core)](https://www.npmjs.com/package/@nodecord/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://img.shields.io/badge/docs-datzu712.github.io%2Fnodecord-blue)](https://datzu712.github.io/nodecord/)

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
import { SlashCommandBuilder, User } from 'discord.js';

@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
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

| Decorator               | Resolves to                                           |
| ----------------------- | ----------------------------------------------------- |
| `@Context()` / `@Ctx()` | The `InteractionContext` for the current interaction  |
| `@Author()`             | The user who triggered the interaction                |
| `@Guild()`              | The guild the interaction came from, or `null`        |
| `@Option()`             | Every option, as `ChatInputOption[]`                  |
| `@Option('a')`          | That single option, as `ChatInputOption \| undefined` |
| `@Option('a', 'b')`     | Those options, as `ChatInputOption[]`                 |
| `@Focused()`            | The option currently being autocompleted              |

Also exported: `NodecordClient`, `TestingModule`, `ConsoleLogger`, the context classes (`InteractionContext`, `ChatInputCommandContext`, `AutocompleteContext`, `ContextMenuContext`), `AbstractClientAdapter` for writing your own adapter, and the framework exception types.

## Documentation

Full guides live at [datzu712.github.io/nodecord](https://datzu712.github.io/nodecord/). Questions go to the [Discord server](https://discord.com/invite/BSaERbS).

## Status

The API is still moving. Modules, DI, slash commands, listeners, parameter decorators, autocomplete, interceptors, exception handlers, and the testing utilities work today. Buttons, modals, select menus, and context menu commands are not implemented yet.

## License

MIT
