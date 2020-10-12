import { Client, Snowflake } from 'discord.js';
import {CommandHandler} from "./utils/CommandHandler";
import {CommandListener} from "./listener/CommandListener";
import {DataHandler} from "./utils/DataHandler";

export class DiscordBot {
    public static SERVER_ID :Snowflake = '716839607743807549';
    public static COMMAND_PREFIX :string = '!';
    public static MAIN_CATEGORY :string = '765172656148054027';
    public static ARCHIVE_CATEGORY :string = '765172698677772309';

    private static client :Client;
    private static TOKEN :string = 'NjM2MjE4ODI4MDkwNjM4MzM2.Xa8a9A.JV1rkJO5v9O0hFEemrMCy3kMwnc';
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
