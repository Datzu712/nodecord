---
'@nodecord/core': minor
'@nodecord/djs-adapter': minor
---

## Breaking Change

### `@SlashCommand()` takes the command definition as a plain object

The decorator now receives the definition in the shape the Discord API expects, options included, so nothing has to be translated to register it. A `SlashCommandBuilder` is no longer accepted as is: pass the object, or call `.toJSON()` on the builder.

Before

```ts
@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
```

After

```ts
@SlashCommand({ name: 'ping', description: 'Replies with pong' })

// or, keeping the builder
@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong').toJSON())
```

### `AbstractClientAdapter#loadSlashCommands()` receives the definitions

Custom adapters get the definitions to register as a second argument. `LoadSlashCommandsOptions.restVersion` is gone: the REST version belongs to the options of the underlying client.

```ts
abstract loadSlashCommands(
    options: LoadSlashCommandsOptions,
    commands: RESTPutAPIApplicationCommandsJSONBody,
): Promise<void>;
```

## Bug Fixes

### `loadSlashCommands()` registers the commands

The discord.js adapter threw `Method not implemented.`. It now overwrites the global commands of the application with the ones found in the module tree, so a command that is no longer in a module is removed from Discord.

```ts
await client.loadSlashCommands({ token: process.env.BOT_TOKEN!, clientId: process.env.CLIENT_ID! });
await client.login(process.env.BOT_TOKEN!);
```

## Internal

`discord-api-types` is now a dependency of `@nodecord/core` instead of a dev dependency. Its types are part of the public API, and as a dev dependency a copy of them was bundled into the declarations, frozen at the version the package was built with. The command definition now follows the `discord-api-types` you have installed, and the declaration file goes from 63 kB to 24 kB.
