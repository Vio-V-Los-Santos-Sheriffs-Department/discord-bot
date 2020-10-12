import {DiscordBot} from "../index";
import {Client, Message, TextChannel} from "discord.js";

export class CommandListener {
    private static client :Client;
    public static init() {
        this.client = DiscordBot.getClient();
        this.client.on('message', this.onCommand);
    }

    private static onCommand(msg :Message) :void {
        const {content, member, channel} = msg;
        if(content.indexOf(DiscordBot.COMMAND_PREFIX, 0) === 0) {
            if(channel instanceof TextChannel) {
                if(!DiscordBot.getCommandHandler().perform(member, channel, content.substr(1))) {

                }
            } else {

            }
        }
    }
}
