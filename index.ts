import { WebSocket, WebSocketServer } from 'ws';
import { ServerOptions } from './types/options';
import Message from './types/message';
import { Operation, MutateClient, CreateClient, Initialize, ClientMutation, ClientCreation } from './types/operation';

class ClientObject {
    ws: WebSocket;
    id: string;
    public: { [key: string]: any } = {};
    private: { [key: string]: any } = {};

    constructor(
        ws: WebSocket,
        id: string,

        // Not a Map because of JSON performance drawbacks
        data: {
            public: { [key: string]: any }
            private: { [key: string]: any }
        }
    ) {
        data = JSON.parse(JSON.stringify(data));

        this.ws = ws;
        this.id = id;
        this.public = data.public;
        this.private = data.private;
    }

    /**
     * Send a message to this client
     * @param name Message name identifier
     * @param data Data to send to client
     */
    sendMessage(name: string, data: any) {
        const message = Message.toString(name, data);
        this.ws.send(message, err => { if(err) throw err });
    }
}

export const InitialClientData = {
    public: {},
    private: {}
};

export class Server {
    socket: WebSocketServer;
    clients: Map<string, ClientObject> = new Map();

    events: Map<string, ((data: any, client?: ClientObject) => void)[]> = new Map();
    clientUpdates: Map<string, Operation[]> = new Map(); // Map<clientID, indexes in `updates` of updates to send to this client>

    updateInterval: NodeJS.Timer;
    lastFrame: number = Date.now();
    deltaTime: number = 0;

    /**
     * Initialize and create Kasocket server object
     * @param server HTTP server to build websocket server on top of
     * @param param1 Modifications to default method of initializing Kasocket
     * @returns Kasocket server object
     */
    constructor(server: any, {
        path = '/multiplayer',
        uuidMax = 0xffffffff,
        tps = 20
    }: ServerOptions = {} as ServerOptions) {
        this.socket = new WebSocketServer({ server, path });

        // "ws: Websocket & { id: string }? but but but type safety!!11!!1" -🤓
        this.socket.on('connection', (ws: WebSocket & { id: string }) => {
            // Verify no other clients have `pid` before mutating `ws`
            let id: string = '';
            while(!id || this.clients.has(id)) id = Math.floor(Math.random()*uuidMax).toString(16);
            ws.id = id;

            // Create and initialize new client
            const client = new ClientObject(ws, id, InitialClientData);
            this.applyMutationProxy(client);
            this.clients.set(id, client);

            // Create object containing only public data from all clients
            const parsedClients: { [key: string]: ClientObject['public'] } = {};
            for(const [clientID, clientObj] of this.clients) {
                parsedClients[clientID] = clientObj.public;
            }

            // Send connecting user their data
            this.addOperation(Initialize({
                time: Date.now(),
                id,
                clients: parsedClients,
                clientData: {
                    public: client.public,
                    private: client.private
                }
            }), {
                clusivity: 'include',
                users: new Set([id])
            });
            
            // this.socket.clients is a set of WebSocket objects
            this.addOperation(CreateClient({
                time: Date.now(),
                id,
                client: client.public
            }), {
                clusivity: 'exclude',
                users: new Set([id])
            });

            // Call events and handle messages
            ws.on('message', (msgStr: string) => {
                const message = Message.fromString(msgStr);
                if(Date.now() - message.time > 3000) return; // Timed out

                // Messages named with an underscore are reserved for native Kasocket purposes
                if(message.name == '_') {
                    for(const operation of message.data) {
                        this.handleOperation(operation, ws.id, Date.now());
                    }
                }
                
                // Call event listeners
                const eventList = this.events.get(message.name);
                if(!eventList) return;

                for(const event of eventList) {
                    event(message.data, this.clients.get(ws.id));
                }
            });
        });

        this.updateInterval = setInterval(() => this.update(), 1000/tps);
	}

    /**
     * Create event listener for named messages
     * @param name Message name identifier to listen to
     * @param callback Function to call on message receive
     */
    on(name: string, callback: ((data: any, client?: ClientObject) => void)) {
        const eventList = this.events.get(name);
        if(!eventList) {
            this.events.set(name, [callback]);
        } else {
            eventList.push(callback);
        }
    }

    /**
     * Send a message to a specific client
     * @param clientID ID of client to send message to
     * @param name Message name identifier
     * @param data Data to send to client
     */
    sendMessage(clientID: string, name: string, data: any) {
        const client = this.clients.get(clientID);
        if(!client) throw new ReferenceError(`Client '${clientID}' does not exist!`);

        const message = Message.toString(name, data);
        client.ws.send(message, err => { if(err) throw err });
    }

    /**
     * Send a message to all listening clients
     * @param name Client-side identifier for listening to message
     * @param data Data to send to clients
     */
    broadcast(name: string, data: any) {
        if(name == '_') {
            throw new Error(`Websocket messages named '_' are reserved for native Kasocket operations`);
        }

        const message = Message.toString(name, data);
        for(const client of this.clients.values()) {
            client.ws.send(message);
        }
    }

    /**
     * Handle a Kasocket reserved operation
     * @param data Data sent by client
     * @returns Corresponding Javascript evaluation for operation
     */
    private handleOperation(data: { operation: string, [key: string]: any }, senderID: string, time: number) {
        // Mutate client public data share
        if(data.operation == 'mut_cli') {
            // Get object to mutate
            const client = this.clients.get(senderID);
            if(!client) throw new ReferenceError(`Client ${senderID} does not exist`);
            let obj = client.public;
            for(const prop of data.path) obj = obj[prop];

            // Mutate server variables
            if(data.instruction == 'set') obj[data.property] = data.value;
            if(data.instruction == 'delete') delete obj[data.property];

            // Add mutations to update queue
            if(data.instance === 'private') return;
            return this.addOperation(MutateClient({
                time,
                id: senderID,
                instruction: data.instruction,
                path: data.path,
                property: data.property, 
                value: data.value
            }), {
                clusivity: 'exclude',
                users: new Set([senderID])
            });
        }

        throw new ReferenceError(`'${data.operation}' is not a valid Kasocket server operation`);
    }

    /**
     * Add operation to send off in next update
     * @param operation Operation object to include
     * @param sendTo List of people to send operation to, if empty, send to all
     */
    addOperation(
        operation: Operation,
        sendTo?: {
            clusivity: 'include' | 'exclude', // o_O https://english.stackexchange.com/a/390333,
            users: Set<string>
        }
    ) {
        for(const clientID of this.clients.keys()) {
            if(sendTo) {
                const inUsers = sendTo.users.has(clientID);
                if(sendTo.clusivity == 'include' && !inUsers) continue;
                if(sendTo.clusivity == 'exclude' && inUsers) continue;
            }

            const updateArr = this.clientUpdates.get(clientID);
            if(!updateArr) {
                this.clientUpdates.set(clientID, [operation]);
                return;
            }

            // Check for redundancies and overwrites in operations
            // An O(n^2) begging to be optimized
            for(let i=0; i<updateArr.length; i++) {
                const op = updateArr[i];
                if(op.id != operation.id) continue;
                if(op.operation != operation.operation) continue;

                // If mutating, verify same object being mutated
                if(op.operation == 'mut') {
                    const nop = operation as ClientMutation;
                    if(op.instruction != nop.instruction) continue;
                    if(op.path.length != nop.path.length) continue;
                    if(op.property != nop.property) continue;
                    if(op.path.some((v, i) => nop.path[i] != v)) continue;
                }
                
                // If creating client, verify that they're not already being created
                else if(op.operation == 'cre') {
                    const nop = operation as ClientCreation;
                    if(op.client != nop.client) continue;
                }

                updateArr.splice(i, 1);
            }
            updateArr.push(operation);
        }
    }

    /**
     * Send all unsent updates to clients, runs `tps` times a second by default
     */
    update() {
        this.deltaTime = (Date.now() - this.lastFrame) / 1000;
        this.lastFrame = Date.now();

        for(const [id, client] of this.clients) {
            let updateArr = this.clientUpdates.get(id);
            //if(!updateArr) continue;
            client.ws.send(Message.bundleOperations(this.deltaTime, updateArr || []));
        }
        this.clientUpdates = new Map();
    }

    /**
     * Apply proxy for mutations that sends appropriate operation to clients
     * @param client Client object to apply mutation proxies to
     */
    private applyMutationProxy(client: ClientObject) {
        const t = this;

        function recurseProxy(
            obj: { [key: string]: any },
            instance: 'public' | 'private',
            path: string[]
        ): { [key: string]: any } {
            return new Proxy(obj, {
                set(object, property: string, value) {
                    object[property] = value;

                    t.addOperation(MutateClient({
                        id: client.id,
                        path,
                        instruction: 'set',
                        property,
                        value,
                        time: Date.now(),
                    }), instance == 'private' ? {
                        clusivity: 'include',
                        users: new Set([client.id])
                    } : undefined);

                    return true;
                }
            });
        }

        client.public = recurseProxy(client.public, 'public', []);
        client.private = recurseProxy(client.private, 'private', []);
    }
};