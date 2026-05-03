---
'@nodecord/djs-adapter': minor
'@nodecord/core': major
---

## Breaking Change

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

**Module-level**

Apply to every handler in the module:

```ts
@Module({
    providers: [DatabaseErrorHandler],
    handlers: [CreateItemCommand],
})
export class ItemsModule {}
```

**Handler-level**

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
