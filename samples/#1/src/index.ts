import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import { Partials, type ClientOptions, GatewayIntentBits } from 'discord.js';
import { resolve } from 'path';

config({ path: resolve(__dirname + '/../.env') });

(async function () {
    const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;

    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
        prefix: ['!'],
    });

    // console.log(bot.commands);
    // await bot.loadSlashCommands(process.env.DISCORD_CLIENT_TOKEN, process.env.DISCORD_CLIENT_ID);
    await bot.login(process.env.DISCORD_CLIENT_TOKEN);
    // const pingCommand = bot.commands.get('ping') as any;
    // console.log(Scanner.isCommand(pingCommand.constructor));
    // console.log(Reflect.getMetadata(COMMAND_WATERMARK, pingCommand.constructor));
})();
