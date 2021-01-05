import {ICommand} from "./type/ICommand";
import {
    Client,
    GuildChannel,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel
} from "discord.js";
import {DataHandler} from "../utils/DataHandler";
import {DiscordBot} from "../index";
import {Logger} from "../utils/Logger";

export class ApplicantCommand implements ICommand {

    private client :Client;
    constructor() {
        this.client = DiscordBot.getClient();
    }

    helpText: string;
    invoke: string = "applicant";

    performCommand(member: GuildMember, textChannel: TextChannel, command: string, args: string[]): boolean {
        if(textChannel.id !== DiscordBot.COMMANDS_CHANNEL) return true;
        if(args.length > 0) {
            switch (args[0]) {
                case "add": // füge einen neuen Bewerber hinzu
                    if(args.length === 3) {
                        if(this.isValidUrl(args[2])) {
                            this.addApplicant(args[1], args[2]);
                            textChannel.send("Der Bewerber wurde erfolgreich registriert!");
                            Logger.log("INFO","CreatedApplication", {
                                "Sender": member.displayName,
                                "ApplicantName": args[1],
                                "ApplicantForumThread": args[2],
                            });
                        } else {
                            textChannel.send("Das zweite Argument muss ein gültiger Link sein!");
                            Logger.log("ERROR", "CreatedApplication", {
                                "Sender": member.displayName,
                                "Error": "Invalid Link",
                                "Input": args[2],
                            });
                        }
                    } else {
                        textChannel.send("!applicant add <NAME> <URL>");
                    }
                    break;
                case "remove": // entferne einen Bewerber entgültig
                    if(args.length === 2) {
                        if(!DataHandler.data.hasOwnProperty(args[1])) {
                            textChannel.send("Der angegebene Spieler ist nicht registriert!");
                            Logger.log("ERROR", "RemoveApplication", {
                                "Sender": member.displayName,
                                "Error": "Invalid Name",
                                "Input": args[1],
                            });
                            return;
                        }

                        this.removeApplicant(args[1]);
                        textChannel.send("Der Bewerber wurde erfolgreich gelöscht!");
                        Logger.log("INFO", "RemoveApplication", {
                            "Sender": member.displayName,
                            "ApplicantName": args[1],
                        });
                    } else {
                        textChannel.send("!applicant remove <NAME>");
                    }
                    break;
                case "archive": // archivire die Diskusssionschannel und den Abstimmungsstatus
                    if(args.length === 2) {
                        if(!DataHandler.data.hasOwnProperty(args[1])) {
                            textChannel.send("Der angegebene Spieler ist nicht registriert!");
                            Logger.log("ERROR", "ArchiveApplication", {
                                "Sender": member.displayName,
                                "Error": "Invalid Name",
                                "Input": args[1],
                            });
                            return;
                        }

                        this.archiveApplicant(args[1]);
                        textChannel.send("Der Bewerber wurde erfolgreich archiviert!");
                        Logger.log("INFO", "ArchiveApplication", {
                            "Sender": member.displayName,
                            "ApplicantName": args[1],
                        });
                    } else {
                        textChannel.send("!applicant archive <NAME>");
                    }
                    break;
                case "stopPoll": // archivire die Diskusssionschannel und den Abstimmungsstatus
                    if(args.length === 2) {
                        if(!DataHandler.data.hasOwnProperty(args[1])) {
                            textChannel.send("Der angegebene Spieler ist nicht registriert!");
                            Logger.log("ERROR", "StopApplicationPoll", {
                                "Sender": member.displayName,
                                "Error": "Invalid Name",
                                "Input": args[1],
                            });
                            return;
                        }

                        this.stopPoll(args[1]);
                        textChannel.send("Der Abstimmung des Bewerbers wurde erfolgreich ausgewertet!");
                        Logger.log("INFO", "StopApplicationPoll", {
                            "Sender": member.displayName,
                            "ApplicantName": args[1],
                        });
                    } else {
                        textChannel.send("!applicant stopPoll <NAME>");
                    }
                    break;
            }
        }
        return true;
    }

    private async removeApplicant(name :string) :Promise<void> {
        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        if(DataHandler.data.hasOwnProperty(name)) {
            const {channelId} = DataHandler.data[name];
            await guild.channels.resolve(channelId).delete();
            delete DataHandler.data[name];
            DataHandler.saveToFile();
        }
    }

    private async archiveApplicant(name :string) :Promise<void> {
        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        if(DataHandler.data.hasOwnProperty(name)) {
            const {channelId} = DataHandler.data[name];
            const channel :GuildChannel = await guild.channels.resolve(channelId);
            await channel.setParent(DiscordBot.ARCHIVE_CATEGORY);

            await this.stopPoll(name);

            delete DataHandler.data[name];
            DataHandler.saveToFile();
        }
    }

    private async stopPoll(name :string) :Promise<void> {
        if(!DataHandler.data[name].poll) return;

        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        if(DataHandler.data.hasOwnProperty(name)) {
            const {channelId, messageId, url} = DataHandler.data[name];
            const channel :GuildChannel = await guild.channels.resolve(channelId);
            if(channel instanceof TextChannel) {
                const msg = await channel.messages.fetch(messageId);
                const positive = await msg.react(DiscordBot.ANSWERS[1]['reaction']);
                const interview = await msg.react(DiscordBot.ANSWERS[2]['reaction']);
                const negative = await msg.react(DiscordBot.ANSWERS[3]['reaction']);

                console.log(name, msg.id, positive.count, interview.count, negative.count);

                const embed = new MessageEmbed()
                    .setColor(DiscordBot.EMBED_COLOR)
                    .setTitle(`Bewerbung von ${name}`)
                    .setAuthor(DiscordBot.FACTION_NAME,DiscordBot.FACTION_ICON, url)
                    .addFields(
                        {name: DiscordBot.ANSWERS[1]['name'], value: (positive.count - 1), inline: true},
                        {name: DiscordBot.ANSWERS[2]['name'], value: (interview.count - 1), inline: true},
                        {name: DiscordBot.ANSWERS[3]['name'], value: (negative.count - 1), inline: true}
                    )
                    .setTimestamp(Date.now())
                    .setFooter(DiscordBot.FACTION_NAME, DiscordBot.FACTION_ICON);

                const answer = await channel.send(embed);
                answer.pin();
                msg.reactions.removeAll();
            }

            DataHandler.data[name].poll = false;
            DataHandler.saveToFile();
        }
    }

    private async addApplicant(name :string, post :string) :Promise<void> {

        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        await this.removeApplicant(name);

        let msg :Message
        const channel :TextChannel = await guild.channels.create(name, {type: "text", parent: DiscordBot.MAIN_CATEGORY, topic: `Forumsbeitrag: ${post}`});
        msg = await channel.send(`${DiscordBot.MENTION_CALLED} Abstimmung! \r Name: ${name} \r Forumsbeitrag: ${post}`);

        await msg.pin();
        msg.react(DiscordBot.ANSWERS[1]['reaction']);
        msg.react(DiscordBot.ANSWERS[2]['reaction']);
        msg.react(DiscordBot.ANSWERS[3]['reaction']);

        DataHandler.data[name] = {
            name,
            channelId: channel.id,
            messageId: msg.id,
            url: post,
            poll: true
        };
        DataHandler.saveToFile();
    }

    private isValidUrl(string) :boolean {
        // TODO crash report
        return true;
    }

}
