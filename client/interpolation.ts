export class Interpolator {
    timeline: { value: number, received: number, deltaTime: number }[];
    current: number;
    method: ((values: number[], time: number) => number);
    offset: number = 0.1; // number of seconds to offset interpolated value

    constructor(method: ((values: number[], time: number) => number), initial: number) {
        this.timeline =  [{ value: initial, received: Date.now()/1000, deltaTime: 50 }];
        this.current =  this.timeline[0].value;
        this.method = method;
    }

    get value(): number {
        if(this.timeline.length == 1) return this.timeline[0].value;

        // Index of first instance in timeline that offset time is in past
        const firstNeg = this.timeline.findIndex(x => x.received < Date.now()/1000 - this.offset);
        if(firstNeg <= 0) return this.timeline[0].value;

        // `tilUpdate` is time until next update occurs in offset timeline
        const tilUpdate = this.timeline[firstNeg-1].received - Date.now()/1000 + this.offset;
        const fromLastDelta = this.timeline[firstNeg-1].deltaTime - tilUpdate;

        // If time since offset last update cycle negative, it hasn't occured yet
        if(fromLastDelta < 0) return this.timeline[firstNeg].value;

        return this.method(
            this.timeline.slice(firstNeg - 1).map(x => x.value),
            fromLastDelta / this.timeline[firstNeg-1].deltaTime
        );
    }

    // New value for interpolator sent by server
    update(value: number, deltaTime: number) {
        this.timeline.unshift({ value, received: Date.now()/1000, deltaTime });
        if(this.timeline.length > 10) this.timeline.pop();
        this.current = value;
    }

    // Average linear interpolator
    static Linear(initial: number) {
        return new Interpolator((v, t) => v[0]*t + v[1]*(1-t), initial);
    }
}

export class Update {
    value: any;
    time: number;
    deltaTime: number;

    constructor(value: any, time: number, deltaTime: number) {
        this.value = value;
        this.time = time;
        this.deltaTime = deltaTime;
    }
}

/**
 * Box an object in nested proxies to watch for updates to apply accordingly
 * @param obj Object to proxybox
 * @returns 
 */
export function Proxybox (obj: { [key: string]: any }): { [key: string]: any } {
    const box = {};
    for(const prop in obj) {
        // Arrays need all indexes proxyboxed
        if(Array.isArray(obj[prop])) box[prop] = obj[prop].map(x => Proxybox(x));

        // Objects need all properties proxyboxed
        else if(typeof obj[prop] == 'object') box[prop] = Proxybox(obj[prop]);

        // Other types literally no one cares about you stupid mfs
        else box[prop] = obj[prop];

        // Stores values because accessing getter proxy from itself is recursive???
        let storer = box[prop];
        Object.defineProperty(box, prop, {
            get() {
                // Return value of mutators
                if(storer instanceof Interpolator) return storer.value;

                // Return normal value
                return storer;
            },
            set(value) {
                // User written code setting value
                if(!(value instanceof Update)) storer = value;

                // Update mutators
                if(storer instanceof Interpolator) return storer.update(value.value, value.deltaTime);

                // Update from server
                storer = value.value;
            }
        });
    }

    return box;
}