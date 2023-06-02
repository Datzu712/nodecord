import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import { Partials, type ClientOptions } from 'discord.js';
config();

(async function () {
    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: 32767,
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
    });

    bot.login(process.env.DISCORD_CLIENT_TOKEN);
    // const pingCommand = bot.commands.get('ping') as any;
    // console.log(Reflect.getMetadata('__commandExecutionArguments__', pingCommand.constructor, 'execute'));
})();
