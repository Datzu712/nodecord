import { CommandHandler, DeferReply, SlashCommand } from '@nodecord/core';
import { SlashCommandBuilder } from 'discord.js';

import { AdminService } from './admin.service.js';

@SlashCommand(new SlashCommandBuilder().setName('admin').setDescription('Admin command'))
export class AdminHandler implements CommandHandler {
    constructor(private readonly adminService: AdminService) {}

    @DeferReply()
    async execute() {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return this.adminService.getStatus();
    }
}
