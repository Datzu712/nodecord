import { SlashCommand } from '@nodecord/core';
import { SlashCommandBuilder } from 'discord.js';

import { AdminService } from './admin.service.js';

@SlashCommand(new SlashCommandBuilder().setName('admin').setDescription('Admin command'))
export class AdminHandler {
    constructor(private readonly adminService: AdminService) {}

    execute(): string {
        return this.adminService.getStatus();
    }
}
