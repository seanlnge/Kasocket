/* Classify types of data being sent over websockets */
import { KaboomObject } from "./kaboom/index";

export function Classify(value: any) {
    if(typeof value != 'object' || value == null) return { value, type: 'value' };

    if(value instanceof KaboomObject) {
        return {
            name: value.__functionName,
            args: Classify(value.__arguments),
            type: 'kaboom'
        };
    }

    if(Array.isArray(value)) {
        return { values: value.map(x => Classify(x)), type: 'array' };
    }

    const ret = { properties: {}, type: 'object' };
    for(const prop in value) {
        ret.properties[prop] = Classify(value[prop]);
    }
    return ret;
}