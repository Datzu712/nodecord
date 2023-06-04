import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import { Partials, type ClientOptions, IntentsBitField } from 'discord.js';
import { resolve } from 'path';

config({ path: resolve(__dirname + '/../.env') });

(async function () {
    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: [
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
    });

    // console.log(bot.commands);
    bot.login(process.env.DISCORD_CLIENT_TOKEN);
    // const pingCommand = bot.commands.get('ping') as any;
    // console.log(Scanner.isCommand(pingCommand.constructor));
    // console.log(Reflect.getMetadata(COMMAND_WATERMARK, pingCommand.constructor));
})();
