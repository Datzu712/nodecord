import { describe, expectTypeOf, it } from 'vitest';

import type { ChatInputCommandContext } from '../context/chat-input-command-context.js';
import type { InteractionContext } from '../context/interaction-context.js';
import type { AdapterTypes, GuildLike, UserLike } from '../interfaces/index.js';

interface RichTypes extends AdapterTypes {
    user: UserLike & { send(): void };
}

describe('adapter contract', () => {
    it('an unparameterised context yields the contract types', () => {
        expectTypeOf<InteractionContext['getAuthor']>().returns.toEqualTypeOf<UserLike>();
        expectTypeOf<InteractionContext['getGuild']>().returns.toEqualTypeOf<GuildLike | null>();
    });

    it('a parameterised context yields the adapter types, and the guards keep them', () => {
        expectTypeOf<InteractionContext<RichTypes>['getAuthor']>().returns.toEqualTypeOf<RichTypes['user']>();

        // Never called: only the narrowing inside it is under test.
        const narrow = (ctx: InteractionContext<RichTypes>) => {
            if (ctx.isChatInputCommand()) {
                expectTypeOf(ctx).toExtend<ChatInputCommandContext<RichTypes>>();
            }
        };
        expectTypeOf(narrow).toBeFunction();
    });
});
