const fs = require('fs');

export class DataHandler {

    public static data = {};

    public static saveToFile() :void {
        fs.writeFile("./data/data.json", JSON.stringify(this.data), (err) => {
            err ? console.log(err) : null;
        });
    }

    public static readfromFile() :void {
        const string :string = fs.readFileSync("./data/data.json", "utf-8");
        this.data = JSON.parse(string);
    }

}

