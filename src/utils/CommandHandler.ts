import {DiscordBot} from "../index";
import {ICommand} from "../commands/type/ICommand";
import {GuildMember, TextChannel} from "discord.js";
import {ApplicantCommand} from "../commands/ApplicantCommand";

export class CommandHandler {
    private commands :Map<string, ICommand>;

    constructor() {
        this.commands = new Map<string, ICommand>();

        this.addCommand(new ApplicantCommand());
    }

    private addCommand(command :ICommand) {
        if(!this.commands.has(command.invoke)) {
            this.commands.set(command.invoke.toUpperCase(), command);
        }
    }

    public perform(member :GuildMember, textChannel :TextChannel, message :string) :boolean {
        const [command, ...args] = message.split(" ");
        if(this.commands.has(command.toUpperCase())) {
            const cmdObject = this.commands.get(command.toUpperCase());
            if(!cmdObject.performCommand(member, textChannel, command, args)) {

            }
            return true;
        }
        return false;
    }
}
