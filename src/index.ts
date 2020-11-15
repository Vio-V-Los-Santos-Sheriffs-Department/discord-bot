import { Client, Snowflake } from 'discord.js';
import {CommandHandler} from "./utils/CommandHandler";
import {CommandListener} from "./listener/CommandListener";
import {DataHandler} from "./utils/DataHandler";
require('dotenv').config();

export class DiscordBot {
    public static SERVER_ID :Snowflake = process.env.SERVER_ID;
    public static COMMAND_PREFIX :string = process.env.COMMAND_PREFIX;
    public static MAIN_CATEGORY :string = process.env.MAIN_CATEGORY;
    public static ARCHIVE_CATEGORY :string = process.env.ARCHIVE_CATEGORY;
    public static COMMANDS_CHANNEL :string = process.env.COMMANDS_CHANNEL;
    public static FACTION_NAME :string = process.env.FACTION_NAME;
    public static FACTION_ICON :string = process.env.FACTION_ICON;
    public static EMBED_COLOR :string = process.env.EMBED_COLOR;

    private static client :Client;
    private static TOKEN :string = process.env.TOKEN;
    private static commandHandler :CommandHandler;

    static main() :void {
        DataHandler.readfromFile();

        this.client = new Client();
        this.client.login(this.TOKEN);
        this.commandHandler = new CommandHandler();
        this.registerEvents();
    }

    static registerEvents() :void {
        CommandListener.init();
    }


    // getter
    public static getClient() :Client {
        return this.client;
    }

    public static getCommandHandler() :CommandHandler {
        return this.commandHandler;
    }

}


DiscordBot.main();
