import { createMockChatInputInteraction, TestingDjsAdapter, TestingModule } from '@nodecord/djs-adapter/testing';
import { beforeAll, describe, expect, it } from 'vitest';

import { AdminModule } from '../src/bot/modules/admin/admin.module.js';
import { AdminService } from '../src/bot/modules/admin/admin.service.js';

describe('AdminModule', () => {
    const adminServiceMock = {
        getStatus: () => 'mocked status',
    };
    let testingModule: TestingModule;
    let adapter: TestingDjsAdapter;

    beforeAll(() => {
        testingModule = TestingModule.create(AdminModule).overrideProvider(AdminService, adminServiceMock).compile();
        adapter = testingModule.getAdapter();
    });

    it('should use the mocked AdminService', async () => {
        const interaction = createMockChatInputInteraction({ commandName: 'admin' });
        await adapter.simulateInteraction(interaction);
        expect(interaction.deferReply).toHaveBeenCalledOnce();
        expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Bot status: mocked status' });
    });
});
