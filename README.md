# Nodecord

A TypeScript framework for building Discord bots.

Nodecord takes the module/provider pattern from frameworks like NestJS and brings it to Discord bot development. Instead of one giant file full of `client.on(...)` calls and globally shared state, you get a proper dependency injection system, scoped modules, and decorator-driven command definitions.

> **Current status:** Core DI, Discord.js adapter, slash command registration, event handling, parameter decorators, and interceptors are working.

---

## Why this exists

Most Discord bot libraries give you a client and leave the rest up to you. That works fine for small bots. It falls apart the moment you need to share services between commands, test a handler without simulating a live interaction, or explain the codebase to someone who joined last week.

Nodecord imposes structure by design: every command and service lives inside a module, modules declare what they provide and what they need, and the framework wires everything together at startup. Dependencies flow through constructors, not through a runtime object that quietly accumulates responsibilities as the project grows.

---

## How it works

### Modules

The entry point to any Nodecord application is a root module. Modules declare their providers (services), handlers (commands), and any other modules they depend on.

```typescript
@Module({
    imports: [LoggerModule],
    providers: [AdminService],
    handlers: [PingCommand, AdminHandler],
})
export class MainModule {}
```

Modules can be marked as `global: true`, which registers their providers into a shared container accessible from anywhere in the application.

```typescript
@Module({
    providers: [LoggerService],
    global: true,
})
export class LoggerModule {}
```

### Services

Any class marked with `@Injectable()` can be registered as a provider and injected into other classes.

```typescript
@Injectable()
export class AdminService {
    constructor(private readonly logger: LoggerService) {}

    getStatus(): string {
        this.logger.log('AdminService.getStatus() called');
        return 'Bot is running';
    }
}
```

### Event listeners

Classes decorated with `@Listener` receive Discord events and are registered as module providers. They must implement `ListenerProvider`.

```typescript
@Listener(Events.ClientReady)
export class ReadyListener implements ListenerProvider {
    constructor(private readonly logger: LoggerService) {}

    handler(): void {
        this.logger.log('Bot is ready!');
    }
}
```

For one-time events, pass `{ once: true }`:

```typescript
@Listener(Events.ClientReady, { once: true })
export class ReadyListener implements ListenerProvider {
    handler(): void {
        console.log('Ready!');
    }
}
```

Listeners for the same event are grouped under a single underlying handler. Mixing `on` and `once` listeners for the same event throws at startup.

Register them in the module's `providers` array:

```typescript
@Module({
    providers: [LoggerService, ReadyListener],
})
export class EventsModule {}
```

---

### Commands

Slash commands are decorated with `@SlashCommand` and receive a `SlashCommandBuilder` (or compatible metadata) as argument. Services get injected through the constructor; Discord-specific context comes through parameter decorators on `execute()`.

```typescript
@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
export class PingCommand {
    constructor(private readonly logger: LoggerService) {}

    execute(@Context() ctx: ExecutionContext): void {
        this.logger.log('PingCommand executed');
        ctx.getRaw<ChatInputCommandInteraction>().reply('pong!');
    }
}
```

#### Parameter decorators

| Decorator | Resolves to |
|-----------|-------------|
| `@Context()` | The `ExecutionContext` instance |
| `@Guild()` | The `Guild` from the interaction, or `null` |
| `@Author()` | The `User` who triggered the interaction |

`ExecutionContext.getRaw<T>()` gives you the underlying discord.js interaction typed as `T`.

#### Automatic reply deferral

Place `@DeferReply()` on `execute()` to have the framework will defer the reply before running the handler. The `ResponseHandler` will edit the deferred reply with the return value of `execute()`, so you can return a string or an `InteractionReplyOptions` object instead of calling `reply()` manually.

```typescript
@SlashCommand(new SlashCommandBuilder().setName('status').setDescription('Shows bot status'))
export class StatusCommand implements CommandHandler {
    @DeferReply()
    execute(): string {
        return 'Bot is online';
    }
}
```

Without `@DeferReply()`, the framework does not defer automatically and the handler is responsible for replying to the interaction directly (typically by using `@Context({ passThrough: true })`).

---

### Interceptors

Interceptors wrap command execution and can observe, transform, or short-circuit the pipeline. They follow a chain-of-responsibility pattern: each interceptor receives a `next` callback that runs the rest of the chain.

```typescript
@Interceptor()
export class LatencyInterceptor implements NodecordInterceptor {
    async intercept(ctx: ExecutionContext, next: () => Promise<unknown>): Promise<unknown> {
        const start = Date.now();
        const result = await next();
        console.log(`Command "${ctx.name}" responded in ${Date.now() - start}ms`);
        return result;
    }
}
```

#### Global interceptors

Register an interceptor as a provider in any module. The framework detects the `@Interceptor()` watermark and applies it to every command automatically.

```typescript
@Module({
    imports: [LoggerModule, UtilModule],
    providers: [ReadyListener, LatencyInterceptor],
})
export class MainModule {}
```

#### Scoped interceptors

Use `@UseInterceptors()` on a command class to attach interceptors that only run for that command. Scoped interceptors run after global ones.

```typescript
@SlashCommand(new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'))
@UseInterceptors(CommandAuditInterceptor)
export class PingCommand implements CommandHandler {
    execute(): string {
        return 'Pong!';
    }
}
```

### Testing

`@nodecord/djs-adapter` ships a `/testing` subpath with utilities for testing commands without connecting to Discord.

`TestingDjsAdapter` is a drop-in replacement for `DiscordJsAdapter` that skips `login()` and `loadSlashCommands()`. Use `simulateInteraction()` to push a mock interaction through the full pipeline module compilation, DI, interceptors, and response handling exactly as it would run in production.

```typescript
import { NodecordClient } from '@nodecord/core';
import { TestingDjsAdapter, createMockChatInputInteraction } from '@nodecord/djs-adapter/testing';
import { MainModule } from './app.module.js';

const adapter = new TestingDjsAdapter();
NodecordClient.create({ module: MainModule, adapter, options: { logger: false } });

const interaction = createMockChatInputInteraction({
    commandName: 'status',
    user: { id: '1', username: 'john doe' } as any,
});

await adapter.simulateInteraction(interaction);

expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Bot is online' });
```

`createMockChatInputInteraction` returns a real `ChatInputCommandInteraction` instance (via `Object.create`) so `instanceof` checks and discord.js type guards work correctly. Pass overrides to control `commandName`, `user`, `guild`, and any other property.

---

### Bootstrapping

```typescript
import { NodecordClient } from '@nodecord/core';
import { type ClientOptions, GatewayIntentBits } from 'discord.js'; 
import { MainModule } from './app.module.js';

const client = NodecordClient.create<ClientOptions>({
    module: MainModule,
    options: {
        intents: [GatewayIntentBits.Guilds],
    },
});

await client.loadSlashCommands();
await client.login(process.env.BOT_TOKEN);
```

`NodecordClient.create()` compiles the module tree, wires up the DI containers, and initializes the adapter. Call `client.get(ServiceClass)` to pull instances out of the dependency graph.

---

## Container model

The framework builds a hierarchy of [Inversify](https://inversify.io/) containers that mirrors the module tree. When a module imports another, its child container delegates resolution to the parent for any providers it doesn't own. Global modules bind directly to a shared root container, making their providers available everywhere without explicit imports in each module.

Each provider and module gets a unique ID generated at decoration time, which prevents metadata collisions when the same class appears in different parts of the tree.

---

## Project structure

```text
nodecord/
├── apps/
│   └── sample-basic-bot/          # Working example: modules, services, commands, tests
├── packages/
│   ├── core/                      # @nodecord/core
│   └── djs-adapter/               # @nodecord/djs-adapter
│       └── testing/               # TestingDjsAdapter, createMockChatInputInteraction
```

The monorepo is managed with [Turborepo](https://turbo.build/) and pnpm workspaces. Both packages ship ESM and CJS outputs with full TypeScript declarations.

Tests are written with [Vitest](https://vitest.dev/) and run directly via `pnpm vitest` from the repo root, outside of Turborepo. There's a single `vitest.config.ts` at the root that covers all packages. Turbo cache isn't needed for tests at this stage, and keeping one config avoids scattering `vitest.config.ts` files across every package.

---

### Where is the npm package?

Not published yet! The API is still in development and I want to get more of the core features implemented before doing a release.

## Current Status

**Working now:**

- Module compilation and container hierarchy
- `@Injectable`, `@Module`, `@SlashCommand`, `@Inject`, `@Listener` decorators
- Global vs. scoped module registration
- Provider resolution via `NodecordClient.get<T>()`
- Parameter decorators: `@Context()`, `@Guild()`, `@Author()`
- Interceptors: global (`@Interceptor`), scoped (`@UseInterceptors`), and interaction-type filtering
- Automatic reply deferral via `@DeferReply()`
- Testing utilities: `TestingDjsAdapter` and `createMockChatInputInteraction` for testing commands without a live Discord connection
- Full TypeScript strict mode throughout, dual ESM/CJS output

**Not yet implemented:**

- Interaction flows (buttons, modals, select menus, and autocomplete co-located with their parent slash command)
- Context menu command handling
- Pipes on parameter decorators
- More built-in parameter decorators (`@Option()`, etc.)
- Robust error handling

---

## Getting started

```bash
pnpm install
pnpm build
```

To run the sample bot:

```bash
pnpm turbo watch dev --filter=sample-basic-bot
```

---

## Requirements

- Node.js 20+
- pnpm 9+
- TypeScript 5.x with `experimentalDecorators` and `emitDecoratorMetadata` enabled

---

## License

MIT
