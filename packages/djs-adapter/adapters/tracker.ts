import { CommandTypes, Logger, type AbstractClientAdapter } from '@nodecord/core';
import { EmbedBuilder, type ChatInputCommandInteraction, type Client } from 'discord.js';

export class EventTracker {
    private logger = new Logger('eventTracker');

    constructor(private adapter: AbstractClientAdapter<Client>) {}

    public listenMainEvents() {
        const clientInstance = this.adapter.getClient();

        this.adapter.on('ready', () =>
            this.logger.log(`Logged in as ${clientInstance.user?.tag} (${clientInstance.user?.id})`),
        );

        if (this.adapter.commands.hasSlashCommands()) {
            this.adapter.on('interactionCreate', (interaction) => {
                if (interaction.isChatInputCommand()) {
                    this.trackSlashCommands(interaction, async () =>
                        this.adapter.commands.execute(interaction, interaction.commandName, CommandTypes.SLASH),
                    );
                }
            });
        }

        if (this.adapter.commands.hasLegacyCommands()) {
            this.adapter.on('messageCreate', (msg) =>
                this.adapter.commands.execute(msg, msg.content, CommandTypes.LEGACY),
            );
        }
    }

    public async trackSlashCommands(interaction: ChatInputCommandInteraction, cmdCallbackReturn: () => Promise<any>) {
        const returnedValue = await cmdCallbackReturn();

        // tengo que mejorarlo lmao
        if (returnedValue) {
            if (typeof returnedValue === 'string') {
                interaction.reply(returnedValue);
            } else if (returnedValue instanceof EmbedBuilder) {
                interaction.reply({ embeds: [returnedValue] });
            }
        }
    }
}
