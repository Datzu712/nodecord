async function main() {
    const bot = NodecordClient<AdapterOptions>(BotModule, {
        ...config,
    });

    await bot.start();
}
