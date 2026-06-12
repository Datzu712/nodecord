# @nodecord/core

## 0.1.0

### Minor Changes

- 22e2f7f: ## Breaking Change

    ### Listeners are no longer registered inside the `providers` array of a module

    They should now be registered inside the `listeners` array of a module.

    Before

    ```ts
    @Module({
        providers: [ReadyListener],
    })
    export class BotModule {}
    ```

    After

    ```ts
    @Module({
        listeners: [ReadyListener],
    })
    export class BotModule {}
    ```

    ### Migration

    Move any class decorated with `@Listener()` from `providers` to `listeners` in your `@Module`.

    ## Bug Fixes

    ### `ExecutionContext.getRaw()` removed generic from class-level and added it to the method

    `getRaw()` now accepts a type parameter instead of relying on the class-level generic (as it should have from the start),
    keeping `ExecutionContext` clean as more context types are added.

    ## New Features

    ### Exception handlers

    A new way to catch exceptions thrown during command execution without wrapping
    every `execute()` method in a try/catch.

    #### Module-level

    Apply to every handler in the module:

    ```ts
    @Module({
        providers: [DatabaseErrorHandler],
        handlers: [CreateItemCommand],
    })
    export class ItemsModule {}
    ```

    #### Handler-level

    Apply only to a specific command:

    ```ts
    @SlashCommand(...)
    @UseExceptionHandler(RateLimitErrorHandler)
    export class PingCommand implements CommandHandler { ... }
    ```

    Define a handler with `@OnException()` and implement `ExceptionHandler`:

    ```ts
    @OnException(DatabaseError)
    export class DatabaseErrorHandler implements ExceptionHandler {
        handle(exception: unknown, ctx: ExecutionContext): void {
            ctx.getRaw<ChatInputCommandInteraction>().reply('Something went wrong.');
        }
    }
    ```

- adacfa9: ## Breaking Change

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
