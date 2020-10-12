import {ICommand} from "./type/ICommand";
import {
    Client,
    Emoji,
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    TextChannel
} from "discord.js";
import {DataHandler} from "../utils/DataHandler";
import {DiscordBot} from "../index";
import {strict} from "assert";

export class ApplicantCommand implements ICommand {

    private client :Client;
    private guild :Guild;
    constructor() {
        this.client = DiscordBot.getClient();
    }

    helpText: string;
    invoke: string = "applicant";

    performCommand(member: GuildMember, textChannel: TextChannel, command: string, args: string[]): boolean {
        if(args.length > 0) {
            switch (args[0]) {
                case "add": // füge einen neuen Bewerber hinzu
                    if(args.length === 2) {
                        this.addApplicant(args[1]);
                    } else {
                        textChannel.send("!applicant add <NAME>");
                    }
                    break;
                case "remove": // entferne einen Bewerber entgültig
                    if(args.length === 2) {
                        this.removeApplicant(args[1]);
                    } else {
                        textChannel.send("!applicant remove <NAME>");
                    }
                    break;
                case "archive": // archivire die Diskusssionschannel und den Abstimmungsstatus
                    if(args.length === 2) {
                        this.archiveApplicant(args[1]);
                    } else {
                        textChannel.send("!applicant remove <NAME>");
                    }
                    break;
            }
        }
        return true;
    }

    private async removeApplicant(name :string) {
        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        if(DataHandler.data.hasOwnProperty(name)) {
            const {channelId} = DataHandler.data[name];
            await guild.channels.resolve(channelId).delete();
            delete DataHandler.data[name];
            DataHandler.saveToFile();
        }
    }

    private async archiveApplicant(name :string) {
        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        if(DataHandler.data.hasOwnProperty(name)) {
            const {channelId, messageId} = DataHandler.data[name];
            const channel :GuildChannel = await guild.channels.resolve(channelId);
            await channel.setParent(DiscordBot.ARCHIVE_CATEGORY);
            if(channel instanceof TextChannel) {
                const msg = await channel.messages.fetch(messageId);
                const positive = await msg.react("🟢");
                const interview = await msg.react("🔵");
                const negative = await msg.react("🔴");

                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`Bewerbung von ${name}`)
                    .addFields(
                    {name: 'Annehmen', value: (positive.count - 1)},
                        {name: 'Gespräch', value: (interview.count - 1)},
                        {name: 'Ablehnen', value: (negative.count - 1)}
                    )
                    .setTimestamp(Date.now())
                    .setFooter('Los Santos County Sheriffs Department');

                channel.send(embed);
                msg.reactions.removeAll();
            }

            delete DataHandler.data[name];
            DataHandler.saveToFile();
        }
    }

    private async addApplicant(name :string) {

        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        await this.removeApplicant(name);

        let msg :Message
        const channel :TextChannel = await guild.channels.create(name, {type: "text"});
        msg = await channel.send("@everyone Abstimmung!");
        msg.react("🟢");
        msg.react("🔵");
        msg.react("🔴");

        await guild.channels.resolve(channel.id).setParent(DiscordBot.MAIN_CATEGORY);

        DataHandler.data[name] = {
            name,
            channelId: channel.id,
            messageId: msg.id
        };
        DataHandler.saveToFile();
    }

}
