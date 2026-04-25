interface HelpCommandOutput {
    title: string;
    description: string;
    commands: {
        name: string;
        description: string;
    }[];
}

@Command({
    name: 'help',
    ...someConfigs,
})
export class HelpCommand implements Command<HelpCommandInput, HelpCommandOutput> {
    constructor(
        private readonly someService: SomeService,
        @Inject(otherService) private readonly otherService: OtherService,
    ) {}

    execute(@Ctx() ctx: CommandCtx<HelpCommandInput>, @CustomDecorator() cositas: any): HelpCommandOutput {
        const commands = this.someService.getCommands(ctx.getArgs(), cositas);

        return {
            title: 'Help',
            description: 'Available commands and how to use them.',
            commands,
        };
    }
}
