---
'@nodecord/core': minor
---

## New Features

### `@SlashCommand()` officially supports builders

`@SlashCommand()` already accepted anything exposing a `toJSON()` method (e.g. a discord.js `SlashCommandBuilder`), but the exact object passed in was discarded after extracting `name`/`description`. It is now preserved by identity on the compiled handler, so adapters can register the original builder or plain object as-is instead of reconstructing it from framework metadata.

```ts
@SlashCommand(
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong')
        .addStringOption((opt) => opt.setName('target').setDescription('Who to ping')),
)
export class PingCommand implements CommandHandler {
    execute() {}
}
```

### `CommandCatalog`

A read-only view over every command handler compiled from the module tree.

```ts
import { CommandCatalog } from '@nodecord/core';

const catalog = new CommandCatalog(handlers);

catalog.size; // number of commands
catalog.getAll(); // readonly CompiledCommandHandler[]
catalog.getByName('ping'); // CompiledCommandHandler | undefined
```

Two handlers registering the same `name` for the same `applicationCommandType` now throw `DuplicateCommandNameException` as soon as the catalog is built, during `NodecordClient.create()`, before the client ever logs in.

## Breaking Changes

### `InitAdapterOptions` requires `commands`

`NodecordClient` now builds a `CommandCatalog` from the compiled module tree and passes it to `adapter.initialize()`. Custom adapters implementing `AbstractClientAdapter` are unaffected as long as they only read the fields they use (structural typing means destructuring `{ executor, listeners }`, for example, still compiles). What breaks is code that constructs an `InitAdapterOptions` object itself and calls `initialize()` directly, such as a custom test harness: it now has to supply `commands` too.

```ts
// wrong: constructs InitAdapterOptions without the new required field
adapter.initialize({ executor, listeners });

// right
adapter.initialize({ executor, listeners, commands: new CommandCatalog(handlers) });
```

### Duplicate command names now throw at startup

Two handlers registering the same `name` for the same `applicationCommandType` previously booted without complaint, and only the first-compiled handler ever received interactions. `NodecordClient.create()` now throws `DuplicateCommandNameException` in that case, before the client logs in.

```ts
// wrong: both are ChatInput commands named "ping"
@SlashCommand({ name: 'ping', description: 'Replies with pong' })
export class PingCommand implements CommandHandler {}

@SlashCommand({ name: 'ping', description: 'Also replies with pong' })
export class AnotherPingCommand implements CommandHandler {}
```

### Invalid command definitions now throw at decoration time

`@SlashCommand()` now validates its argument as soon as the decorator runs. A missing/empty `name`, a missing/empty `description` (chat input commands only), a `type` other than chat input, or a builder whose `toJSON()` throws or returns a non-object all throw `InvalidCommandDefinitionException` immediately, instead of surfacing later as an opaque compiler error.

```ts
// wrong: no description
@SlashCommand({ name: 'ping' })
export class PingCommand implements CommandHandler {}
```
