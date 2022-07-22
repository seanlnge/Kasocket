import { KaboomCtx } from 'kaboom';
import { Operation } from '../operation';
import Message from '../message';
import { Interpolator } from './interpolation';
import { Declassify, ServerUpdate } from './serverInterface';

class Client {
    private ws: WebSocket;
    private events: { [key: string]: ((...args: any[]) => void)[] } = {};
    
    ctx: KaboomCtx;
    id: string;
    public: any;
    private: any;
    clients: Map<string, { [key: string]: any }>;
    ready: boolean = false;

    lastUpdate: number = Date.now();
    deltaTime: number = 0;

    connectEvent: ((client: { [key: string]: any }, id: string) => void);
    clientEvent: ((client: { [key: string]: any }, id: string) => void);
    updateEvent: (() => void);
    
    /**
     * Connect the client to the Kasocket websocket server
     * @param param0 Client options to modify default Kasocket client initialization
     */
    constructor({
        global = true,
        url = `wss://${window.location.hostname}`,
        path = '/multiplayer',
        kaboom = window as unknown as KaboomCtx
    } = {}) {
        this.ctx = kaboom;

        // Initialize websocket
        this.clients = new Map();
        this.ws = new WebSocket(url + path);

        // Create proxies for client data
        this.public = this.CreateMutationProxy('public', {});
        this.private = this.CreateMutationProxy('private', {});

        // Initialize data and call events
        this.ws.onmessage = (event: { [key: string]: any }) => {
            const message = Message.Parse(event.data); // sent data in string form
            if(Date.now() - message.time > 1000) return; // timed out
            
            // Handle websocket updates
            if(message.name == '_') {
                this.deltaTime = (Date.now() - this.lastUpdate) / 1000;
                this.lastUpdate = Date.now();

                const newClients: Map<string, { [key: string]: any }> = new Map();
                let init = false;

                for(const operation of message.data.operations as Operation[]) {
                    this.HandleOperation(operation);

                    // Add to event queue. Needs to happen after all operations handled since
                    // clients prone to mutation in server 'onConnect' event 
                    if(operation.operation == 'cre') {
                        newClients.set(operation.id, operation.client);
                    } else if(operation.operation == 'init') {
                        init = true;
                    }
                }

                // Client just connected
                if(init && this.connectEvent) {
                    const client = this.clients.get(this.id) as { [key: string]: any };
                    this.connectEvent(client, this.id);
                }

                // New client connected
                if(this.clientEvent) {
                    for(const [id, client] of newClients) {
                        this.clientEvent(client, id);
                    }
                }

                // Call event listener if provided
                if(this.updateEvent) {
                    this.updateEvent()
                }
            }

            // Check for message name in events
            if(message.name in this.events) {
                for(const event of this.events[message.name]) {
                    event(message.data);
                }
            }
        };

        // Set globals
        if(global) {
            window['Self'] = this;
            window['Interpolator'] = Interpolator;
        }
    }

    /**
     * Mutate an object in client
     * @param operation Operation object sent by server
     * @returns Corresponding Javascript evaluation for mutating client
     */
    private HandleOperation(operation: Operation) {
        // Mutate data inside `this.clients` object
        if(operation.operation == 'mut') {
            const client = this.clients.get(operation.id);
            if(!client) throw new ReferenceError(`Client ${operation.id} does not exist`);

            // Iteratively look through client to find mutation location
            let object = client;
            for(const p of operation.path) object = object[p];

            switch(operation.instruction) {
                case 'set': {
                    const declass = Declassify(operation.value, this.ctx);
                    if(operation.id == this.id) {
                        return object[operation.property] = new ServerUpdate(declass);
                    } else {
                        return object[operation.property] = declass;
                    }
                }
                case 'delete': {
                    return delete object[operation.property];
                }

                default: throw new ReferenceError(`'${operation.instruction}' is not a valid client mutation instruction`);
            }
        }

        // Push data received into new client object
        else if(operation.operation == 'cre') {
            this.clients.set(operation.id, Declassify(operation.client, this.ctx));
        }

        // Initialize self
        else if(operation.operation == 'init') {
            this.ready = true;
            this.id = operation.id;
            for(const clientID in operation.clients) {
                this.clients.set(clientID, Declassify(operation.clients[clientID], this.ctx));
            }

            for(const instance in operation.clientData) {
                this[instance] = this.CreateMutationProxy(
                    instance,
                    Declassify(operation.clientData[instance], this.ctx)
                );
            }

            // Set self client as reference to public as to not duplicate references in properties
            // For instance, if `public != this.clients.get(this.id)`, an update from the server
            // would need to edit both public and client, and if both public and client shared a 
            // reference to a kaboom object, they might update an interpolator unnecessarily

            // trust me the bug that occured from me not doing this was painfully convoluted
            this.clients.set(this.id, this.public);
        }

        else throw new Error(`That is not a valid operation`);
    }

    /**
     * Listen to events from server
     * @param type - Event name to listen for
     * @param callback - Called when `type` sent from server
     * @returns Handler for this event
     */
    on(type: string, callback: ((data: any) => void)) {
        let index: number;
        if(type in this.events) {
            index = this.events[type].length;
            this.events[type].push(callback);
        } else {
            index = 0;
            this.events[type] = [callback];
        }

        return {
            cancel: () => {
                this.events[type].splice(index, 1);
                if(this.events[type].length == 0) delete this.events[type];
            }
        }
    }

    /**
     * Send some data with a name to server
     * @param name Message identifier
     * @param data Any data to send to server
     */
    send(name: string, data: any) {
        this.ws.send(Message.Create(name, data));
    }

    /**
     * Create event listener for server connection
     * @param callback Function to call once connected to server
     */
    onConnect(callback: ((client: { [key: string]: any }) => void)) {
        this.connectEvent = callback;
    }

    /**
     * Create event listener for new client connections
     * @param callback Function to call when a new client connects
     */
    onClientConnect(callback: ((client: { [key: string]: any }) => void)) {
        this.clientEvent = callback;
    }

    /**
     * Create event listener for server updates
     * @param callback Function to call when server updates
     */
    onServerUpdate(callback: (() => void)) {
        this.updateEvent = callback;
    }

    /**
     * Create a proxy to watch for any object mutation events
     * @param instance Client data instance to watch for mutations
     * @returns Proxied object
     */
    private CreateMutationProxy(instance: string, proxied: { [key: string]: any }) {
        // Needs to be recursive for nested objects; Property list left to right
        // corresponds to the properties that led to current object
        function recursiveProxy(object: { [key: string]: any }, path: string[]) {
            return new Proxy(object, {
                // Utils for checking if proxy
                has(object: any, property: string) {
                    if(property == '__isProxy') return true;
                    return property in object;
                },

                // Recurse until all objects proxied
                get(object: any, property: string) {
                    // If not object, don't create proxy
                    if(typeof object[property] != 'object' || object[property] === null) {
                        return object[property];
                    }

                    // Don't recreate proxy if it already exists
                    if('__isProxy' in object) return object[property];

                    // Create a proxy for nested objects
                    return recursiveProxy(object[property], [...path, property]);
                },

                // `client.public.asdf = 4;`
                set: function(object: any, property: string, value: any) {
                    if(object[property] === value) return false; // redundant

                    // Instruction from server, dont send mutation request
                    if(value instanceof ServerUpdate) {
                        object[property] = value.value;
                        return true;
                    }

                    // Edit value in list of clients
                    object[property] = value;
                    
                    // Send changes to server
                    this.ws.send(Message.BundleOperations(this.deltaTime, {
                        operation: 'mut_cli',
                        instruction: 'set',
                        instance,
                        path,
                        property,
                        value
                    }));
                    return true;
                }.bind(this),

                // `delete client.public.asdf;`
                deleteProperty: function(object: any, property: any) {
                    if(!(property in object)) return false; // redundant

                    // Delete value in list of clients
                    delete object[property];

                    // Send changes to server
                    this.ws.send(Message.BundleOperations(this.deltaTime, {
                        operation: 'mut_cli',
                        instruction: 'delete',
                        instance,
                        path,
                        property
                    }));
                    return true;
                }.bind(this)
            });
        }
        return recursiveProxy.bind(this)(proxied, []);
    }

    getClients() {
        return Object.keys(this.clients).map(id => ({ id, ...this.clients.get(id) }));
    }
}

/**
 * Connect the client to the Kasocket websocket server
 * @param param0 Client options to modify default Kasocket client initialization
 * @returns Kasocket client object
 */
const connect = ({
    global = true,
    url = `wss://${window.location.hostname}`,
    path = '/multiplayer',
    kaboom = window as unknown as KaboomCtx
} = {}) => {
    const ClientObject = new Client({ global, url, path, kaboom });
    return {
        Public: ClientObject.public,
        Private: ClientObject.private,
        Clients: ClientObject.clients,
        OnMessage: ClientObject.on,
        SendMessage: ClientObject.send
    }
}

export default { Client, connect };