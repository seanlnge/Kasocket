/* Parse and declassify information coming in from the server  */
import { KaboomCtx } from 'kaboom';

// Used for `instanceof` by mutation proxy
export class ServerUpdate {
    value: any;
    delete: boolean;

    constructor(value: any, deleteProp = false) {
        this.value = value;
        this.delete = deleteProp;
    }
}

// Store objects' identifiers to share object references with server
const objectMap: Map<number, any> = new Map();

/**
 * Parse classified values sent by the server into usable ones 
 * @param object Classified object
 * @param ctx Kaboom context to utilize during kaboom calls in declassification
 * @returns Usable data sent by server
 */
export function Declassify(object: { [key: string]: any }, ctx: KaboomCtx) {
    if(object.type == 'value') return object.value;

    // im sorry this is such a hacky way to do this
    if(object.type == 'kaboomMethod') {
        return new ServerUpdate(object.value);
    }

    // Share stored reference to identifier
    if(object.type == 'reference') {
        const obj = objectMap.get(object.id);
        if(obj === undefined) {
            throw new ReferenceError(`Object with server identifier '${object.id}' was not found`);
        }
        return obj;
    }

    let ref: any;

    // Kaboom objects call Kaboom context
    if(object.type == 'kaboom') {
        ref = ctx[object.name](...Declassify(object.args, ctx));
    }
    
    // Rebuild object from classified properties
    else if(object.type == 'object') {
        const ret = {};
        for(const prop in object.properties) {
            ret[prop] = Declassify(object.properties[prop], ctx);
        }
        ref = ret;
    }
    
    //
    else if(object.type == 'array') {
        ref = object.values.map((x: any) => Declassify(x, ctx));
    }

    // Store reference to object in objectMap and return
    objectMap.set(object.id, ref);
    return ref;
}