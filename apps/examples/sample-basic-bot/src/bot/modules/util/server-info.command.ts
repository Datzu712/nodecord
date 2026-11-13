import { CommandHandler, DeferReply, Guild, SlashCommand } from '@nodecord/core';
import { Guild as DjsGuild } from 'discord.js';

@SlashCommand({ name: 'server-info', description: 'Shows information about this server' })
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
