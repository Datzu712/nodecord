---
'@nodecord/core': minor
'@nodecord/djs-adapter': minor
---

## Breaking Change

### `@Option('a')` gives you the value

A single option no longer resolves to a `{ name, value, type }` wrapper. You get the value the user filled in, or `undefined` if they left it out. A user, role, channel or attachment option arrives as the object the adapter's library resolved for it.

Before

```ts
execute(@Option('query') query: ChatInputOption | undefined) {
    return `Searching for "${query?.value}"`;
}
```

After

```ts
execute(@Option('query') query: string) {
    return `Searching for "${query}"`;
}
```

### `@Option()` and `@Option('a', 'b')` give you a record

Both forms resolve to an object keyed by option name instead of an array of wrappers. It only holds the options the user provided.

Before

```ts
execute(@Option() options: ChatInputOption[]) {
    const query = options.find((opt) => opt.name === 'query')?.value;
}
```

After

```ts
execute(@Option() options: Record<string, unknown>) {
    const query = options.query;
}
```

The wrapper is still there when you need the option type: `ctx.getOptions()` returns `{ name, type, value, resolved }` for each option.

### `@Focused()` gives you the value

Before

```ts
@Autocomplete('tag')
autocompleteTag(@Focused() input: ChatInputOption) {
    return tags.filter((t) => t.value.includes(String(input.value)));
}
```

After

```ts
@Autocomplete('tag')
autocompleteTag(@Focused() input: string) {
    return tags.filter((t) => t.value.includes(input));
}
```

`ctx.getFocusedOption()` still returns the whole option, name included.

### `@Author()` and `@Guild()` hand over the library's own objects

`@Author()`, `@Guild()`, `ctx.getAuthor()` and `ctx.getGuild()` used to return a trimmed copy cast to an API type: four fields for the user, `id` and `name` for the guild. With the discord.js adapter they now return the discord.js `User` and `Guild`, so the type you were already writing is finally true.

Before

```ts
execute(@Guild() guild: Guild | null) {
    return `Members: ${guild?.memberCount}`; // undefined at runtime
}
```

After

```ts
execute(@Guild() guild: Guild | null) {
    return `Members: ${guild?.memberCount}`;
}
```

Code that read snake_case API fields from these objects, or relied on them being plain data, has to change.

On a plain `InteractionContext` the two getters are now typed as `UserLike` (`id`, `username`) and `GuildLike` (`id`), the minimum every adapter guarantees. To read library fields through `ctx`, pass the adapter's types:

```ts
import type { DjsTypes } from '@nodecord/djs-adapter';

intercept(ctx: InteractionContext<DjsTypes>, next: () => Promise<unknown>) {
    console.log(ctx.getGuild()?.name);
    return next();
}
```

### Unknown option names stop startup

Every name passed to `@Option()` or `@Autocomplete()` is checked against the `options` of the `@SlashCommand()` definition while the module tree is compiled. A name the definition does not declare throws `UnknownOptionException` with the code `UNKNOWN_OPTION`, where it used to resolve to `undefined` at runtime.

```ts
@SlashCommand({
    name: 'search',
    description: 'Search something',
    options: [{ type: 3, name: 'query', description: 'The search query' }],
})
export class SearchCommand {
    execute(@Option('qurey') query: string) {} // throws at startup
}
```

### Custom adapters follow the `AdapterTypes` contract

Contexts are generic over `AdapterTypes`, the minimum the core may read from a user, guild, role, channel and attachment. An adapter passes its own types and returns its library's objects from `getAuthor()` and `getGuild()`. `ChatInputOption` gains a `resolved` field for whatever the library resolved for an option.

```ts
class MyChatInputContext extends ChatInputCommandContext<MyTypes> {
    getAuthor(): MyTypes['user'] {
        return this.interaction.user;
    }
}
```

## Features

`@nodecord/djs-adapter` now exports `DjsTypes`.
