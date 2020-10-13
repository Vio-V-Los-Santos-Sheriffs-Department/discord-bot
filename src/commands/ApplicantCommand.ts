import {ICommand} from "./type/ICommand";
import {
    CategoryChannel,
    Client,
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel
} from "discord.js";
import {DataHandler} from "../utils/DataHandler";
import {DiscordBot} from "../index";

export class ApplicantCommand implements ICommand {

    private client :Client;
    private guild :Guild;
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
                            textChannel.send("Der Bewerber wurde erfolgreich registriert!").then(msg => {
                                msg.delete({timeout: 15000});
                            });
                        } else {
                            textChannel.send("Das zweite Argument muss ein gültiger Link sein!").then(msg => {
                                msg.delete({timeout: 15000});
                            });
                        }
                    } else {
                        textChannel.send("!applicant add <NAME> <URL>").then(msg => {
                            msg.delete({timeout: 15000});
                        });
                    }
                    break;

                case "remove": // entferne einen Bewerber entgültig
                    if(args.length === 2) {
                        if(!DataHandler.data.hasOwnProperty(args[1]))
                            textChannel.send("Der angegebene Spieler ist nicht registriert!").then(msg => {
                                msg.delete({timeout: 15000});
                            });

                        this.removeApplicant(args[1]);
                        textChannel.send("Der Bewerber wurde erfolgreich gelöscht!").then(msg => {
                            msg.delete({timeout: 15000});
                        });
                    } else {
                        textChannel.send("!applicant remove <NAME>").then(msg => {
                            msg.delete({timeout: 15000});
                        });
                    }
                    break;

                case "archive": // archivire die Diskusssionschannel und den Abstimmungsstatus
                    if(args.length === 2) {
                        if(!DataHandler.data.hasOwnProperty(args[1]))
                            textChannel.send("Der angegebene Spieler ist nicht registriert!").then(msg => {
                                msg.delete({timeout: 15000});
                            });

                        this.archiveApplicant(args[1]);
                        textChannel.send("Der Bewerber wurde erfolgreich archiviert!").then(msg => {
                            msg.delete({timeout: 15000});
                        });
                    } else {
                        textChannel.send("!applicant archive <NAME>").then(msg => {
                            msg.delete({timeout: 15000});
                        });
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
            const {channelId, messageId, url} = DataHandler.data[name];
            const channel :GuildChannel = await guild.channels.resolve(channelId);
            await channel.setParent(DiscordBot.ARCHIVE_CATEGORY);
            if(channel instanceof TextChannel) {
                const msg = await channel.messages.fetch(messageId);
                const positive = await msg.react("🟢");
                const interview = await msg.react("🔵");
                const negative = await msg.react("🔴");

                const embed = new MessageEmbed()
                    .setColor('#d9aa00')
                    .setTitle(`Bewerbung von ${name}`)
                    .setAuthor("Los Santos County Sheriffs Department","https://app.police-academy.de/media/favicons/android-icon-192x192.png", url)
                    .addFields(
                    {name: 'Annehmen', value: (positive.count - 1), inline: true},
                        {name: 'Gespräch', value: (interview.count - 1), inline: true},
                        {name: 'Ablehnen', value: (negative.count - 1), inline: true}
                    )
                    .setTimestamp(Date.now())
                    .setFooter('Los Santos County Sheriffs Department', "https://app.police-academy.de/media/favicons/android-icon-192x192.png");

                const answer = await channel.send(embed);
                answer.pin();
                msg.reactions.removeAll();
            }

            delete DataHandler.data[name];
            DataHandler.saveToFile();
        }
    }

    private async addApplicant(name :string, post :string) {

        const guild = await this.client.guilds.fetch(DiscordBot.SERVER_ID);

        await this.removeApplicant(name);

        let msg :Message
        const channel :TextChannel = await guild.channels.create(name, {type: "text", parent: DiscordBot.MAIN_CATEGORY});
        await channel.setTopic(post);
        msg = await channel.send(`@everyone Abstimmung! \r Name: ${name} \r Forumsbeitrag: ${post}`);

        await msg.pin();
        msg.react("🟢");
        msg.react("🔵");
        msg.react("🔴");

        DataHandler.data[name] = {
            name,
            channelId: channel.id,
            messageId: msg.id,
            url: post
        };
        DataHandler.saveToFile();
    }

    private isValidUrl(string) :boolean {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }

}
