/* Classify types of data being sent over websockets */
import { KaboomObject } from "./kaboom/index";

// Create and store identifier for objects to share objects' references
export function Classify(value: any, referenceMap: Map<any, number>) {
    if(typeof value != 'object' || value == null) {
        return { value, type: 'value' };
    }

    // Share identifier to object
    const id = referenceMap.get(value);
    if(id !== undefined) return { id, type: 'reference' };

    // Store object in identifier map
    const valueID = referenceMap.size;
    referenceMap.set(value, valueID);

    if(value instanceof KaboomObject) {
        return {
            name: value.__functionName,
            args: Classify(value.__arguments, referenceMap),
            type: 'kaboom',
            id: valueID
        };
    }

    if(Array.isArray(value)) {
        return {
            values: value.map(x => Classify(x, referenceMap)),
            type: 'array',
            id: valueID
        };
    }

    const ret = {
        properties: {},
        type: 'object',
        id: valueID
    };
    for(const prop in value) {
        ret.properties[prop] = Classify(value[prop], referenceMap);
    }
    return ret;
}