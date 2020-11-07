const fs = require('fs');

export class DataHandler {

    public static data = {};

    public static saveToFile() :void {
        if (!fs.existsSync('./data'))
            fs.mkdirSync('./data');
        fs.writeFile("./data/data.json", JSON.stringify(this.data), (err) => {
            err ? console.log(err) : null;
        });
    }

    public static readfromFile() :void {
        try {
            const string :string = fs.readFileSync("./data/data.json", "utf-8");
            this.data = JSON.parse(string);
            console.log(this.data);
        } catch (_) {
            console.log("data.json file does not exist!");
        }
    }

}

