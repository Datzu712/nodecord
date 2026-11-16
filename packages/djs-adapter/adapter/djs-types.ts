import type {
    APIInteractionDataResolvedChannel,
    APIRole,
    Attachment,
    Guild,
    GuildBasedChannel,
    Role,
    User,
} from 'discord.js';

/**
 * The discord.js objects this adapter hands over to the core.
 *
 * Use it to get discord.js types on a context: `InteractionContext<DjsTypes>`.
 */
export interface DjsTypes {
    user: User;
    guild: Guild;
    role: Role | APIRole;
    channel: GuildBasedChannel | APIInteractionDataResolvedChannel;
    attachment: Attachment;
}
