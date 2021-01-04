export class Logger {
    public static log(level: "INFO"|"WARNING"|"ERROR",action: string, object = {}) {
        const dateString: string = new Date(Date.now()).toISOString();
        const objString = Object.keys(object).map(key => {
            const value = object[key];
            return `${key}=${value}`;
        }).join(' ');
        console.log(`${dateString} | ${level} | Action=${action} ${objString}`);
    }
}
