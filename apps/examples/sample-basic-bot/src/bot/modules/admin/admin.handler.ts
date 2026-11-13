import { CommandHandler, DeferReply, SlashCommand } from '@nodecord/core';
import { AdminService } from './admin.service.js';

@SlashCommand({ name: 'admin', description: 'Admin command' })
export class AdminHandler implements CommandHandler {
    constructor(private readonly adminService: AdminService) {}

    @DeferReply()
    async execute() {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return `Bot status: ${this.adminService.getStatus()}`;
    }
}
