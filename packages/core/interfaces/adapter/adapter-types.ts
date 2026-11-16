/** The minimum the core may read from a user. */
export interface UserLike {
    id: string;
    username: string;
}

/** The minimum the core may read from a guild. */
export interface GuildLike {
    id: string;
}

/** The minimum the core may read from a role. */
export interface RoleLike {
    id: string;
}

/** The minimum the core may read from a channel. */
export interface ChannelLike {
    id: string;
}

/** The minimum the core may read from an attachment. */
export interface AttachmentLike {
    id: string;
}

/**
 * The entities an adapter hands over to the core. An adapter supplies its own library's objects, as long as
 * they satisfy these minimums. The core never reads anything beyond them.
 *
 * A field is only added here if Discord sends it in the interaction payload, so that any library can supply it.
 */
export interface AdapterTypes {
    user: UserLike;
    guild: GuildLike;
    role: RoleLike;
    channel: ChannelLike;
    attachment: AttachmentLike;
}
