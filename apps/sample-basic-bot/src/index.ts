import 'reflect-metadata';
import 'dotenv/config';

import { NodecordClient } from '@nodecord/core';
import { Partials, type ClientOptions, GatewayIntentBits } from 'discord.js';

import { MainModule } from './app.module.js';
import { AdminService } from './bot/modules/admin/admin.service.js';

async function bootstrap() {
    const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;

    const client = NodecordClient.create<ClientOptions>({
        module: MainModule,
        options: {
            intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
        },
    });

    const admin = client.get(AdminService);
    console.log(admin.getStatus());

    await client.loadSlashCommands();
    console.log('Slash commands loaded');

    await client.login(process.env.BOT_TOKEN!);
}

void bootstrap();
