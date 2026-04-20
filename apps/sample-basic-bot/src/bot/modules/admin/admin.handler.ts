import { SlashCommand } from '@nodecord/core';

import { AdminService } from './admin.service.js';

@SlashCommand({ name: 'ping', description: 'idk' })
export class AdminHandler {
    constructor(private readonly adminService: AdminService) {}

    execute(): string {
        return this.adminService.getStatus();
    }
}
