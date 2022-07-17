import { KaboomCtx } from 'kaboom';
import Message from '../types/message';
import { ClientOptions } from '../types/options';
import { Operation } from '../types/operation';
import { Proxybox, Interpolator } from './interpolation';

class Client {
    private ctx: KaboomCtx;
    private ws: WebSocket;
    private events: { [key: string]: ((...args: any[]) => void)[] } = {};
    
    id: string;
    public: any;
    private: any;
    clients: Map<string, { [key: string]: any }>;
    ready: boolean = false;
    
    /**
     * Connect the client to the Kasocket websocket server
     * @param param0 Client options to modify default Kasocket client initialization
     */
    constructor({
        global = true,
        url = `wss://${window.location.hostname}`,
        path = '/multiplayer',
        kaboom = window as unknown as KaboomCtx
    }: ClientOptions = {} as ClientOptions) {
        this.ctx = kaboom;

        // Initialize websocket
        this.clients = new Map();
        this.ws = new WebSocket(url + path);

        // Create proxies for client data
        this.public = this.CreateMutationProxy('public', {});
        this.private = this.CreateMutationProxy('private', {});

        // Initialize data and call events
        this.ws.onmessage = (event: { [key: string]: any }) => {
            const message = Message.fromString(event.data); // sent data in string form
            if(Date.now() - message.time > 1000) return; // timed out
            
            // Handle websocket updates
            if(message.name == '_') {
                for(const operation of message.data as Operation[]) {
                    console.log(operation);
                    this.HandleOperation(operation);
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
            window['Clients'] = this.clients;
            window['Public'] = this.public;
            window['Private'] = this.private;

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
                case 'set': return object[operation.property] = { value: operation.value, time: operation.time };
                case 'delete': return delete object[operation.property];

                default: throw new ReferenceError(`'${operation.instruction}' is not a valid client mutation instruction`);
            }
        }

        // Push data received into new client object
        else if(operation.operation == 'cre') {
            this.clients.set(operation.id, Proxybox(operation.client));
        }

        // Create proxies for initialized client data
        else if(operation.operation == 'init') {
            this.ready = true;
            this.id = operation.id;
            for(const clientID in operation.clients) {
                this.clients.set(clientID, Proxybox(operation.clients[clientID]));
            }

            for(const instance in operation.clientData) {
                this[instance] = this.CreateMutationProxy(
                    instance,
                    operation.clientData[instance]
                );
            }
        }

        else throw new Error(`That is not a valid operation`);
    }

    /**
     * Callback for event listener
     * @callback EventCallback
     * @param data - Data sent from server
     */
    /**
     * Listen to events from server
     * @param type - Event name to listen for
     * @param callback - Called when `type` sent from server
     * @returns Handler for this event
     */
    onMessage(type: string, callback: ((data: any) => void)) {
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

    sendMessage(type: string, data: any) {
        this.ws.send(Message.toString(type, data));
    }

    /**
     * Create a proxy to watch for any object mutation events
     * @param instance Client data instance to watch for mutations
     * @returns Proxied object
     */
    private CreateMutationProxy(instance: string, proxied: { [key: string]: any }) {
        const t = this; // Allow inner scopes to use `ws`, `id`, and `clients`
        
        // Needs to be recursive for nested objects; Property list left to right
        // corresponds to the properties that led to current object
        function recursiveProxy(object: { [key: string]: any }, path: string[]) {
            return new Proxy(object, {
                // Recurse until all objects proxied
                get(object: any, property: any) {
                    if(typeof object[property] != "object" || object[property] == null) {
                        return object[property];
                    }

                    // Create a proxy for nested objects
                    return recursiveProxy(object, [...path, property]);
                },

                // `client.public.asdf = 4;`
                set(object: any, property: any, value: any) {
                    if(object[property] === value) return false; // redundant

                    // Iterative pass through property list to find object
                    let data = t.clients.get(t.id);
                    for(const p of path) {
                        if(!data) throw new ReferenceError(`The property '${p}' does not exist on ${data}`);
                        data = data[p];
                    }

                    if(!data) throw new ReferenceError(`Data does not exist`);

                    // Edit value in list of clients
                    data[property] = { value, time: Date.now() };
                    object[property] = value;
                    
                    // Send changes to server
                    t.ws.send(Message.bundleOperations({
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
                    if(!(property in object)) return false; // redundant

                    
                    // Iterative pass through property list to find object
                    let clientData = t.clients.get(t.id);
                    if(!clientData) throw new ReferenceError('Client data does not exist');
                    let data = clientData[instance];
                    for(const p of path) data = data[p];
                    
                    // Delete value in list of clients
                    delete data[property];
                    delete object[property];

                    // Send changes to server
                    t.ws.send(Message.bundleOperations({
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
}: ClientOptions = {} as ClientOptions) => {
    const ClientObject = new Client({ global, url, path, kaboom });
    return {
        Public: ClientObject.public,
        Private: ClientObject.private,
        Clients: ClientObject.clients,
        OnMessage: ClientObject.onMessage,
        SendMessage: ClientObject.sendMessage
    }
}

export default { Client, connect };