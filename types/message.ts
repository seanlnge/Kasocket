export default class Message {
    name: string;
    data: any;
    time: number;
    
    constructor(name: string, data: any) {
        this.name = name;
        this.data = data;
        this.time = Date.now();
    }

    static bundleOperations(operations: { [key: string]: any }[] | { [key: string]: any }) {
        if(!Array.isArray(operations)) operations = [operations];
        return JSON.stringify(new Message('_', operations));
    }

    static fromString(str: string) {
        const parsed = JSON.parse(str);
        return new Message(parsed.name, parsed.data);
    }

    static toString(name: string, data: any) {
        return JSON.stringify(new Message(name, data));
    }
}