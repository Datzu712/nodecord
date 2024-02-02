import { SlashCommand, ICommand, LibClient } from '@nodecord/core';
import { type Client, EmbedBuilder } from 'discord.js';
import { statsSlashOption } from './options/stats.options';

@SlashCommand({
    name: 'stats',
    options: statsSlashOption,
    global: true,
})
export class StatsSlashCommand implements ICommand {
    execute(@LibClient() client: Client) {
        return new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: `Stats de ${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(
                `**Membres:** ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\n**Serveurs:** ${
                    client.guilds.cache.size
                }\n**Ping:** ${client.ws.ping}ms`,
            )
            .setFooter({ text: `ID: ${client.user.id}` })
            .setTimestamp();
    }
}
