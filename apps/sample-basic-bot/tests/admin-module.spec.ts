import { createMockChatInputInteraction, TestingDjsAdapter } from '@nodecord/djs-adapter/testing';
import { Constructor, NodecordClient, TestingModule } from '@nodecord/core';
import { beforeAll, describe, expect, it } from 'vitest';

import { AdminModule } from '../src/bot/modules/admin/admin.module.js';
import { AdminService } from '../src/bot/modules/admin/admin.service.js';

describe('AdminModule', () => {
    const adminServiceMock = {
        getStatus: () => 'mocked status',
    };
    const adapter = new TestingDjsAdapter();

    beforeAll(() => {
        const testingModule = TestingModule.create(AdminModule)
            .overrideProvider(AdminService, adminServiceMock)
            .build();

        NodecordClient.create({
            module: testingModule,
            adapter,
            options: { logger: false },
        });
    });

    it('should use the mocked AdminService', async () => {
        const interaction = createMockChatInputInteraction({ commandName: 'admin' });
        await adapter.simulateInteraction(interaction);

        expect(interaction.deferReply).toHaveBeenCalledOnce();
        expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Bot status: mocked status' });
    });
});
