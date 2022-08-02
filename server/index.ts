import { WebSocket, WebSocketServer } from 'ws';
import { KaboomObject } from './kaboom/index';
import Message from '../message';
import { Operation, MutateClient, CreateClient, Initialize, ClientMutation, ClientCreation } from '../operation';
import { Classify } from './clientInterface';
export { Kaboom } from './kaboom/index';

import NanoTimer from 'nanotimer';

class ClientObject {
    ws: WebSocket;
    id: string;
    
    // Not a Map because of JSON performance drawbacks plus ease of adaptability for dx
    public: { [key: string]: any } = {};
    private: { [key: string]: any } = {};

    // Map object references to identifiers to let client keep references
    referenceMap: Map<any, number> = new Map();

    constructor(
        ws: WebSocket,
        id: string,
    ) {
        this.ws = ws;
        this.id = id;
    }

    /**
     * Send a message to this client
     * @param name Message name identifier
     * @param data Data to send to client
     */
    sendMessage(name: string, data: any) {
        const message = Message.Create(name, data);
        this.ws.send(message, err => { if(err) throw err });
    }
}

export class Server {
    socket: WebSocketServer;
    clients: Map<string, ClientObject> = new Map();

    events: Map<string, ((data: any, client?: ClientObject) => void)[]> = new Map();
    clientUpdates: Map<string, Operation[]> = new Map(); // Map<clientID, indexes in `updates` of updates to send to this client>
    connectionEvent: ((client: ClientObject) => void);
    updateEvent: (() => void);

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
    } = {}) {
        this.socket = new WebSocketServer({ server, path, perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },

            clientNoContextTakeover: true,
            serverNoContextTakeover: true,
            serverMaxWindowBits: 10,
            
            concurrencyLimit: 10,
            threshold: 1024
        }});

        this.socket.on('connection', (ws: WebSocket) => {
            let id: string = '';
            while(!id || this.clients.has(id)) id = Math.floor(Math.random()*uuidMax).toString(16);
            const client = new ClientObject(ws, id);
            
            // Apply proxy to listen for mutations to client data instances
            this.applyMutationProxy(client);
            this.clients.set(id, client);

            // Create object containing only public data from all clients
            const parsedClients: { [key: string]: ClientObject['public'] } = {};
            for(const [clientID, clientObj] of this.clients) {
                parsedClients[clientID] = Classify(clientObj.public, client.referenceMap);
            }

            // Send connecting user their data
            this.addOperation(Initialize({
                time: Date.now(),
                id,
                clients: parsedClients,
                clientData: {
                    public: Classify(client.public, client.referenceMap),
                    private: Classify(client.private, client.referenceMap)
                }
            }), {
                clusivity: 'include',
                users: new Set([id])
            });
            
            // this.socket.clients is a set of WebSocket objects
            this.addOperation(CreateClient({
                time: Date.now(),
                id,
                client: Classify(client.public, client.referenceMap)
            }), {
                clusivity: 'exclude',
                users: new Set([id])
            });

            // Run connection event
            if(this.connectionEvent) {
                this.connectionEvent(client);
            }

            // Call events and handle messages
            ws.on('message', (msgStr: string) => {
                const message = Message.Parse(msgStr);
                if(Date.now() - message.time > 3000) return; // Timed out

                // Messages named with an underscore are reserved for native Kasocket purposes
                if(message.name == '_') {
                    for(const operation of message.data.operations) {
                        this.handleOperation(operation, id, Date.now());
                    }
                }
                
                // Call event listeners
                const eventList = this.events.get(message.name);
                if(!eventList) return;

                for(const event of eventList) {
                    event(message.data, this.clients.get(id));
                }
            });
        });

        (new NanoTimer()).setInterval(this.update.bind(this), [], Math.round(1000/tps) + 'm')
	}

    /**
     * Create event listener for client connection
     * @param callback Function to call on client connection
     */
    onConnect(callback: ((client: ClientObject) => void)) {
        this.connectionEvent = callback;
    }

    /**
     * Create event listener for Kasocket update
     * @param callback Function to call on Kasocket update
     */
    onUpdate(callback: (() => void)) {
        this.updateEvent = callback;
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

        const message = Message.Create(name, data);
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

        const message = Message.Create(name, data);
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
            let obj = client[data.instance];
            for(const prop of data.path) {
                obj = obj[prop];

                // Client tampering
                if(obj === undefined) return;
            }

            // Mutate server variables
            if(data.instruction == 'set') obj[data.property] = data.value;
            if(data.instruction == 'delete') delete obj[data.property];

            // Add mutations to update queue
            if(data.instance != 'public') return;
            return this.addOperation(MutateClient({
                time,
                id: senderID,
                instruction: data.instruction,
                instance: 'public',
                path: data.path,
                property: data.property, 
                value: Classify(data.value, client.referenceMap)
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
        for(const [id, _] of this.clients) {
            if(sendTo) {
                const inUsers = sendTo.users.has(id);
                if(sendTo.clusivity == 'include' && !inUsers) continue;
                if(sendTo.clusivity == 'exclude' && inUsers) continue;
            }

            const updateArr = this.clientUpdates.get(id);
            if(!updateArr) {
                this.clientUpdates.set(id, [operation]);
                continue;
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
        // Promise allows timer to carry on with any further updates without a delay from ws
        return new Promise(res => {
            this.deltaTime = (Date.now() - this.lastFrame) / 1000;
            this.lastFrame = Date.now();
            this.updateEvent();

            for(const [id, client] of this.clients) {
                let updateArr = this.clientUpdates.get(id);
                client.ws.send(Message.BundleOperations(this.deltaTime, updateArr || []));
            }
            this.clientUpdates = new Map();

            res(true);
        });
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
            // Only apply recursive proxy onto user-visible properties
            if(obj instanceof KaboomObject) {
                if('__isProxy' in obj.__properties) {
                    obj.__properties.__changePath = path;
                }
                
                else obj.__properties = recurseProxy(
                    obj.__properties,
                    instance,
                    path
                );
            }
            
            // Recurse over properties
            else {
                for(const prop in obj) {
                    if(typeof obj[prop] != 'object') continue;

                    if('__isProxy' in obj[prop]) {
                        obj[prop].__changePath = [...path, prop];
                        continue;
                    }

                    obj[prop] = recurseProxy(
                        obj[prop],
                        instance,
                        [...path, prop]
                    );
                }
            }

            const proxy = new Proxy(obj, {
                has(object: any, property: string) {
                    if(property === '__isProxy') return true;
                    return property in object;
                },

                // Recurse until all objects proxied
                get(object: any, property: any) {
                    if(object instanceof KaboomObject) {
                        // Needed properties for classifying data to send to client
                        if(property == '__functionName'
                        || property == '__arguments'
                        || property == '__properties'
                        || property == '__proxyBind'
                        || property == '__method') {
                            return object[property];
                        }

                        // No need to apply proxy, above makes this a proxy getter
                        return object.__properties[property];
                    }

                    // Create a proxy for nested objects
                    return object[property];
                },

                // `client.public.x = 3`
                set(object, property: string, value) {
                    // Change path of object
                    if(property == '__changePath') {
                        // Redundant
                        if(path.length == value.length && path.every((v, i) => value[i] === v)) {
                            return true;
                        }

                        const v = object instanceof KaboomObject
                            ? object.__properties
                            : object;
                        path = value;

                        // Loop over properties of object
                        for(const prop in v) {
                            if(typeof v[prop] != 'object') continue;
                            v[prop].__changePath = [...path, prop];
                        }
                        return true;
                    }

                    if(!(object instanceof KaboomObject) || property != '__method') {
                        // Redundant
                        if(object[property] === value) return true;

                        // Do not send function change to client
                        if(typeof value == 'function') {
                            object[property] = value;
                            return true;
                        }

                        // Create a proxy for nested objects
                        if(typeof value == 'object') {
                            if('__isProxy' in value) {
                                value.__changePath = [...path, property]
                            }

                            else value = recurseProxy(
                                value,
                                instance,
                                [...path, property]
                            );
                        }


                        object[property] = value;
                        value = Classify(value, client.referenceMap);
                    }

                    t.addOperation(MutateClient({
                        id: client.id,
                        path,
                        instruction: 'set',
                        instance,
                        property,
                        value,
                        time: Date.now(),
                    }), instance == 'private' ? {
                        clusivity: 'include',
                        users: new Set([client.id])
                    } : undefined);

                    return true;
                },

                // `delete client.public.bullets`
                deleteProperty(object, property: string) {
                    if(!(property in object)) return true; // redundant
                    delete object[property];

                    t.addOperation(MutateClient({
                        id: client.id,
                        path,
                        instruction: 'delete',
                        instance,
                        property,
                        time: Date.now(),
                    }), instance == 'private' ? {
                        clusivity: 'include',
                        users: new Set([client.id])
                    } : undefined);

                    return true;
                }
            });

            // Bind object methods to modify proxy instead of self
            if(proxy instanceof KaboomObject) proxy.__proxyBind();
            return proxy;
        }

        client.public = recurseProxy(client.public, 'public', []);
        client.private = recurseProxy(client.private, 'private', []);
    }
};