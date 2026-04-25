
@Module({
    imports: [
        ...otherModules
    ],
    commands: [PingCommand, HelpCommand, ...otherCommands],
    providers: [
        ...middlewares? 
    ]
})
export class BotModule {}