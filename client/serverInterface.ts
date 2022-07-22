/* Parse and declassify information coming in from the server  */
import { KaboomCtx } from 'kaboom';

// Used for `instanceof` by mutation proxy
export class ServerUpdate {
    value: any;
    constructor(value) {
        this.value = value;
    }
}

/**
 * Parse classified values sent by the server into usable ones 
 * @param object Classified object
 * @param ctx Kaboom context to utilize during kaboom calls in declassification
 * @returns Usable data sent by server
 */
export function Declassify(object: { [key: string]: any }, ctx: KaboomCtx) {
    if(object.type == 'value') return object.value;

    if(object.type == 'kaboom') {
        return ctx[object.name](...Declassify(object.args, ctx));
    }

    if(object.type == 'object') {
        const ret = {};
        for(const prop in object.properties) {
            ret[prop] = Declassify(object.properties[prop], ctx);
        }
        return ret;
    }

    if(object.type == 'array') {
        return object.values.map(x => Declassify(x, ctx));
    }
}