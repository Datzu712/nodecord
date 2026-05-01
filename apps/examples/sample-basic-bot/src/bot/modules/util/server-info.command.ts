import { CommandHandler, DeferReply, Guild, SlashCommand } from '@nodecord/core';
import { Guild as DjsGuild, SlashCommandBuilder } from 'discord.js';

@SlashCommand(new SlashCommandBuilder().setName('server-info').setDescription('Shows information about this server'))
export class ServerInfoCommand implements CommandHandler {
    @DeferReply()
    execute(@Guild() guild: DjsGuild | null): string {
        if (!guild) return 'This command can only be used inside a server.';

        return [
            `**${guild.name}**`,
            `Members: ${guild.memberCount}`,
            `Created: <t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        ].join('\n');
    }
}
