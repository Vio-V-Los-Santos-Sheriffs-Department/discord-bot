import {GuildMember, TextChannel} from "discord.js";

export interface ICommand {
    performCommand(member :GuildMember, textChannel :TextChannel, command :string, args :string[]) :boolean;
    invoke :string;
    helpText :string;
}
