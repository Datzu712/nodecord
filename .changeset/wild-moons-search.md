---
'@nodecord/core': major
'@nodecord/djs-adapter': minor
---

## Breaking Change

### Command execution logic moved from the adapter into the core

Previously most of the core features that nodecord exposes were implemented inside the adapter. This approach was wrong: the only concern of an adapter in our ecosystem is to be a compatibility layer between nodecord and a Discord library, so the business logic now lives in `@nodecord/core`.

What moved into the core:

- Command execution and routing (`CommandExecutor`, command flows, `CommandPipelineBuilder`)
- Interceptor pipeline and exception handling
- Parameter resolution (`@Context()`, `@Author()`, `@Guild()`, `@Option()`, `@Focused()`)
- Abstract interaction contexts (`InteractionContext`, `ChatInputCommandContext`, `AutocompleteContext`, `ContextMenuContext`)

What an adapter does now:

- Maps library-specific interactions to the core context classes
- Dispatches events to the core `CommandExecutor`

### Migration

Bot code using the public API (`@SlashCommand`, `@Module`, interceptors, etc.) is not affected. Custom adapter authors must implement the new `AbstractClientAdapter` contract and extend the core context classes instead of providing their own execution logic.

## New Features

### Autocomplete interactions

Slash command handlers can now respond to autocomplete interactions. Decorate a method with `@Autocomplete()`, passing the name(s) of the options it handles, and return an `AutocompleteChoice[]`. The result goes through the interceptor pipeline and is sent automatically via `ctx.respond()`.

```ts
@SlashCommand(...)
export class SearchCommand implements CommandHandler {
    execute() { ... }

    @Autocomplete('tag')
    autocompleteTag(@Focused() input: ChatInputOption, @Option('category') category: string) {
        const choices = [
            { name: 'Library', value: 'library' },
            { name: 'Framework', value: 'framework' },
            { name: 'Tool', value: 'tool' },
        ];

        if (!input.value.toString().trim()) return choices;

        return choices.filter((v) => v.value.includes(input.value.toString().toLowerCase()));
    }
}
```

#### Param decorators available in autocomplete executors

- `@Focused()` — the option currently being typed (`ChatInputOption`)
- `@Option()` — all resolved options (`ChatInputOption[]`)
- `@Option('x')` — a single option by name (`ChatInputOption | undefined`)
- `@Option('a', 'b')` — options filtered by name (`ChatInputOption[]`)

#### `AutocompleteContext`

New abstract context for autocomplete interactions with `getFocusedOption()`, `getOption(name?)`, `getOptions()` and `respond(choices)`. The djs adapter implements it as `DjsAutocompleteContext`.
