# Nodecord

A TypeScript framework for building Discord bots.

Nodecord takes the module/provider pattern from frameworks like NestJS and brings it to Discord bot development. Instead of one giant file full of `client.on(...)` calls and globally shared state, you get a proper dependency injection system, scoped modules, and decorator-driven command definitions.

> **Current status:** Core DI, Discord.js adapter, slash command registration, event handling, and parameter decorators are working. See [where things stand](#where-things-stand) before using this in production.

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
│   └── sample-basic-bot/     # Working example: modules, services, commands
├── packages/
│   ├── core/                 # @nodecord/core
│   └── djs-adapter/          # @nodecord/djs-adapter — Discord.js integration
```

The monorepo is managed with [Turborepo](https://turbo.build/) and pnpm workspaces. Both packages ship ESM and CJS outputs with full TypeScript declarations.

---

## Where things stand

**Working now:**

- Module compilation and container hierarchy
- `@Injectable`, `@Module`, `@SlashCommand`, `@Inject`, `@Listener` decorators
- Global vs. scoped module registration
- Provider resolution via `NodecordClient.get<T>()`
- Discord.js adapter with slash command registration and event handling
- Parameter decorators: `@Context()`, `@Guild()`, `@Author()`
- Interceptor support via `@Interceptor`
- Full TypeScript strict mode throughout, dual ESM/CJS output

**Not yet implemented:**

- Context menu command handling
- Pipes on parameter decorators
- More built-in parameter decorators (`@Option()`, etc.)

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
