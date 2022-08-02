import { KaboomCtx } from 'kaboom';
import { Operation } from '../operation';
import Message from '../message';
import { Interpolator, IValue, Time } from './interpolation';
import { Declassify, ServerUpdate } from './serverInterface';

class Client {
    private ws: WebSocket;
    private events: { [key: string]: ((...args: any[]) => void)[] } = {};
    
    ctx: KaboomCtx;
    id: string;

    public: any = this.CreateMutationProxy('public', {});
    private: any = this.CreateMutationProxy('private', {});
    clients: Map<string, { [key: string]: any }> = new Map();

    // Variables for when client is ready to receive and send messages
    isReady: boolean = false;
    ready = new Promise(res => this.readyResolve = res);
    private readyResolve: (value: any) => void;
    private readyQueue: string[] = [];

    lastUpdate: number = Date.now();
    deltaTime: number = 0;

    connectEvent: ((client: { [key: string]: any }, id: string) => void);
    clientEvent: ((client: { [key: string]: any }, id: string) => void);
    updateEvent: (() => void);

    // Client created listeners for 
    mutationListeners: Map<
        { [key: string]: any }, // Object
        Map<string, <T>(prev: T, curr: T) => void> // Object property -> event listener
    > = new Map();
    
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
        this.ws = new WebSocket(url + path);

        // Initialize data and call events
        this.ws.onmessage = (event: { [key: string]: any }) => {
            const message = Message.Parse(event.data); // sent data in string form
            if(Date.now() - message.time > 1000) return; // timed out
            
            // Handle websocket updates
            if(message.name == '_') {
                this.deltaTime = Time.deltaTime = (Date.now() - this.lastUpdate) / 1000;
                this.lastUpdate = Time.lastUpdate = Date.now();

                // Run client/connect events after all other updates ran
                const newClients: Map<string, { [key: string]: any }> = new Map();
                let init = false;

                for(const operation of message.data.operations as Operation[]) {
                    //console.log(operation)
                    this.handleOperation(operation);

                    // Add to event queue. Needs to happen after all operations handled since
                    // clients prone to mutation in server 'onConnect' event 
                    if(operation.operation == 'cre') {
                        newClients.set(operation.id, this.clients.get(operation.id) || {});
                    } else if(operation.operation == 'init') {
                        newClients.set(operation.id, this.public);
                        init = true;
                    }
                }

                // Client just connected
                if(init) {
                    this.isReady = true;
                    this.readyResolve(true);

                    for(const msg of this.readyQueue) this.ws.send(msg);

                    if(this.connectEvent) {
                        this.connectEvent({
                            public: this.public,
                            private: this.private
                        }, this.id);
                    }
                }

                // New client connected
                if(this.clientEvent) {
                    for(const [id, client] of newClients) this.clientEvent(client, id);
                }

                // Call event listener if provided
                if(this.updateEvent) this.updateEvent();
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

    private queue(message: string) {
        if(this.isReady) {
            this.ws.send(message);
        } else {
            this.readyQueue.push(message);
        }
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
    send = (name: string, data: any) => this.queue(Message.Create(name, data));

    /**
     * Create event listener for server connection
     * @param callback Function to call once connected to server
     */
    onConnect = (
        callback: ((client: { [key: string]: any }) => void)
    ) => this.connectEvent = callback;

    /**
     * Create event listener for new client connections
     * @param callback Function to call when a new client connects
     */
    onNewClient = (
        callback: ((client: { [key: string]: any }) => void)
    ) => this.clientEvent = callback;

    /**
     * Create event listener for server updates
     * @param callback Function to call when server updates
     */
    onServerUpdate = (callback: (() => void)) => this.updateEvent = callback;

    /**
     * Create event listener for Kaboom client mutations
     * @param object Object containing property to listen to
     * @param property Property on object to listen to
     * @param callback Called when property mutated
     * @returns Mutation listener canceller
     */
    addMutationListener(
        object: { [key: string]: any },
        property: string,
        callback: <T>(prev: T, curr: T) => void
    ): { cancel: () => void } {
        // If object not in listener map, set it and add property
        const obj = this.mutationListeners.get(object);
        if(!obj) this.mutationListeners.set(object, new Map().set(property, callback));

        // Property must not be in listener map
        const prop = obj?.get(property);
        if(!prop) obj?.set(property, callback);
        else throw new ReferenceError('Multiple mutation listeners cannot be applied to the same object property');

        return { cancel: () => obj?.delete(property) };
    }

    /**
     * Mutate an object in client
     * @param operation Operation object sent by server
     * @returns Corresponding Javascript evaluation for mutating client
     */
    private handleOperation(operation: Operation) {
        // Mutate data inside `this.clients` object
        if(operation.operation == 'mut') {
            const client = this.clients.get(operation.id);
            if(!client) throw new ReferenceError(`Client ${operation.id} does not exist`);

            // Iteratively look through client to find mutation location
            let object = client;
            for(const i in operation.path) {
                object = object[operation.path[i]];

                if(object === undefined) {
                    const path = operation.instance + '.' + operation.path.slice(0, parseInt(i)).join('.');
                    const prop = Object.keys(operation.path).length - 1 != parseInt(i)
                        ? operation.path[parseInt(i)]
                        : operation.property;
                    throw new ReferenceError(`Property '${prop}' does not exist on 'client.${path}'`);
                }
            }

            // Initialize values for mutation listener
            const mutLis = this.mutationListeners.get(object)?.get(operation.property);
            const mutLisPrev = object[operation.property];

            // Get length mutation listener
            let lenLis: (<T>(prev: T, curr: T) => void) | undefined;
            if(Array.isArray(object)) lenLis = this.mutationListeners.get(object)?.get('length');

            switch(operation.instruction) {
                case 'set': {
                    // Call any mutation listeners
                    let declass = Declassify(operation.value, this.ctx);

                    // Call a method on kaboom objects such as .destroy(), sorry for hack
                    if(declass instanceof ServerUpdate) {
                        object[operation.property][declass.value.name](...declass.value.args);
                        return;
                    }

                    // Server update so that self doesn't send mutation event to server
                    if(operation.id == this.id) {
                        object[operation.property] = new ServerUpdate(declass);
                    } else {
                        object[operation.property] = declass;
                    }

                    // Call mutation listener event if prompted
                    if(mutLis) mutLis(mutLisPrev, object[operation.property]);
                    if(lenLis) lenLis(object.length-1, object.length);
                    return;
                }
                case 'delete': {
                    // Server update so that self doesn't send mutation event to server
                    if(operation.id == this.id) {
                        object[operation.property] = new ServerUpdate(undefined, true);
                    } else {
                        delete object[operation.property];
                    }

                    // Call mutation listener event if prompted
                    if(mutLis) mutLis(mutLisPrev, undefined);
                    if(lenLis) lenLis(object.length+1, object.length);
                    return;
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
     * Create a proxy to watch for any object mutation events
     * @param instance Client data instance to watch for mutations
     * @returns Proxied object
     */
    private CreateMutationProxy(instance: string, proxied: { [key: string]: any }) {
        const t = this; // idk how to bind to proxy lol

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
                    if(typeof object[property] != 'object'
                    || object[property] === null
                    || object[property] instanceof IValue) {
                        return object[property];
                    }

                    // Don't recreate proxy if it already exists
                    if('__isProxy' in object[property]) return object[property];

                    // Create a proxy for nested objects
                    return object[property] = recursiveProxy(object[property], [...path, property]);
                },

                // `client.public.asdf = 4;`
                set(object: any, property: string, value: any) {
                    if(object[property] === value) return true;

                    // Instruction from server, dont send mutation request
                    if(value instanceof ServerUpdate) {
                        if(value.delete === true) {
                            delete object[property];
                        } else {
                            object[property] = value.value;
                        }
                        return true;
                    }
                    
                    // Initialize values for mutation listener
                    const mutLis = t.mutationListeners.get(object)?.get(property);
                    const mutLisPrev = object[property];

                    // Edit value in list of clients
                    object[property] = value;

                    if(mutLis) mutLis(mutLisPrev, value);
                    
                    // Send changes to server
                    t.queue(Message.BundleOperations(t.deltaTime, {
                        operation: 'mut_cli',
                        instruction: 'set',
                        instance,
                        path,
                        property,
                        value
                    }));

                    return true;
                },

                // `delete client.public.asdf;`
                deleteProperty(object: any, property: any) {
                    if(!(property in object)) return true; // redundant

                    // Initialize values for mutation listener
                    const mutLis = t.mutationListeners.get(object)?.get(property);
                    const mutLisPrev = object[property];

                    // Delete value in list of clients
                    delete object[property];

                    if(mutLis) mutLis(mutLisPrev, undefined);

                    // Send changes to server
                    t.queue(Message.BundleOperations(t.deltaTime, {
                        operation: 'mut_cli',
                        instruction: 'delete',
                        instance,
                        path,
                        property
                    }));
                    return true;
                }
            });
        }
        return recursiveProxy(proxied, []);
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