# Nodecord

A powerful TypeScript framework for building Discord bots.

Nodecord takes the module/provider pattern from frameworks like NestJS and brings it to Discord bot development. Instead of one giant file full of `client.on(...)` calls and globally shared state, you get a proper dependency injection system, scoped modules, and decorator-driven command definitions.

> **Current status:** The core DI system is working. Discord.js integration is being rearchitected. See [where things stand](#where-things-stand) before using this in production.
Your application code has no direct dependency on Discord.js or any other library, that's the adapter's job. Swap the adapter, keep the bot.

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
    providers: [PingService, AdminService],
    handlers: [PingCommand, StatusCommand],
})
export class MainModule {}
```

Modules can be marked as `global: true`, which registers their providers into a shared container accessible from anywhere in the application. Useful for things like a logger or config service.

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
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    getStatus(): string {
        this.logger.log('AdminService.getStatus() called');
        return 'Bot is running';
    }
}
```

A `LoggerService` doesn't know it lives inside a Discord bot. No execution context, no client reference. Just its declared dependencies and its logic. That also makes it straightforward to test without mocking half the framework.

### Commands

Slash commands are decorated with `@Command`. Services get injected through the constructor; Discord-specific context comes through parameter decorators on `execute()`.

```typescript
@Command({ name: 'ping', description: 'Replies with pong' })
export class PingCommand {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    execute(): string {
        this.logger.log('PingCommand executed');
        return 'pong!';
    }
}
```

When a command needs to interact with the incoming message, parameter decorators handle that:

```typescript
@Command({ name: 'say', description: 'Repeats what you say' })
export class SayCommand {
    async execute(@Msg() message: Message): Promise<void> {
        await message.reply(message.content);
    }
}
```

`Message` here is the adapter's abstraction, not a Discord.js type directly. Your command code doesn't know which library is underneath.

Services live in the constructor. Things that change per invocation come in as parameters. The built-in decorators cover the common cases, but you can write your own to pull out whatever the adapter exposes like guild, user, options, anything.

### Bootstrapping (very initial prototype)

```typescript
import { NodecordClient } from '@nodecord/core';
import { MainModule } from './app.module.js';
import { AdminService } from './bot/admin.service.js';

const client = new NodecordClient(MainModule);

const admin = client.resolve(AdminService);
console.log(admin.getStatus());
// THIS IS JUST A EXAMPLE OF THE DI SYSTEM WORKING, NOT HOW YOU'LL ACTUALLY RUN A BOT. 
```

`NodecordClient` compiles the module tree, wires up the DI containers, and exposes `.resolve<T>()` to pull instances out of the dependency graph.

---

## Container model

The framework builds a hierarchy of [Inversify](https://inversify.io/) containers that mirrors the module tree. When a module imports another, its child container delegates resolution to the parent for any providers it doesn't own. Global modules bind directly to a shared root container, making their providers available everywhere without explicit imports in each module.

Each provider and module gets a unique `Symbol` ID generated at decoration time, which prevents metadata collisions when the same class appears in different parts of the tree.

---

## Project structure

```text
nodecord/
├── apps/
│   └── sample-basic-bot/     # Working example: modules, services, commands
├── packages/
│   └── core/                 # @nodecord/core
└── prototype/                # Scratch space for ideas in progress
```

The monorepo is managed with [Turborepo](https://turbo.build/) and pnpm workspaces. `@nodecord/core` is built with tsup and ships both ESM and CJS outputs with full TypeScript declarations.

---

## things stand

**Working now:**

- Module compilation and container hierarchy
- `@Injectable`, `@Module`, `@Command`, `@Inject` decorators
- Global vs. scoped module registration
- Provider resolution via `NodecordClient.resolve<T>()`
- Full TypeScript strict mode throughout, dual ESM/CJS output

**Not yet re-implemented:**

- Discord.js adapter and client lifecycle
- Slash command registration with the Discord API
- Event handling system
- Command execution lifecycle (before/after hooks)
- Middleware/interceptor support (structured pipelines for command execution)
- Prefix command support

If you need something production-ready today, this isn't it yet. If you want to follow the development or contribute, you're early ;)

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
- pnpm 9.X.X
- TypeScript 5.x with `experimentalDecorators` and `emitDecoratorMetadata` enabled

---

## License

MIT
