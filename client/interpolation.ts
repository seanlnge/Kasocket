export const Time = {
    lastUpdate: Date.now(),
    deltaTime: 0
};

// Create interface to peek into internals of interpolator
export class IValue extends Number {
    deltaTime: number;
    received: number;

    constructor(value: number, deltaTime: number = 0, received: number = Date.now() / 1000) {
        super(value);
        this.deltaTime = deltaTime;
        this.received = received;
    }

    get isInterpolator() {
        return true;
    }
}

export class Interpolator {
    object: { [key: string]: any };
    property: string;
    timeline: IValue[];
    method?: (timeline: IValue[]) => IValue;

    /**
     * Check if object property is already an interpolator
     * @param object Object containing property to check
     * @param property Property to check
     * @returns Whether the property was an interpolator
     */
    static IsInterpolator(object: { [key: string]: any }, property: string) {
        const v = object[property];
        return v instanceof IValue;
    }

    /**
     * Create interpolator to lerp values between updates
     * @param object Object containing property to lerp
     * @param property Property on `object` to lerp
     * @param offset Number of seconds to delay interpolation by
     * @example
     * new Interpolator.Linear(player.pos, 'x');
     * player.pos.x = 240;
     * await sleep(100);
     * player.pos.x = 300;
     * 
     * console.log(player.pos.x); // 240
     * await sleep(25);
     * console.log(player.pos.x); // 255
     * await sleep(25);
     * console.log(player.pos.x); // 270
     * await sleep(50);
     * console.log(player.pos.x); // 300
     */
    static Lerp = (
        object: { [key: string]: any },
        property: string,
        offset: number = 0.1
    ) => new Interpolator(object, property, timeline => {
        if(timeline.length == 1) return timeline[0];

        // Index of first instance in timeline that offset time is in past
        //console.log(timeline.map(x => x.received - Date.now() / 1000 + offset).slice(0, 5))
        const firstNeg = timeline.findIndex(x => x.received < Date.now()/1000 - offset);
        if(firstNeg <= 0) return timeline[0];
        const t1 = timeline[firstNeg-1];

        // `sinceUpdate` is time until next update occurs in offset timeline
        const sinceDeltaChange = Date.now()/1000 - offset - t1.received + t1.deltaTime;

       // console.log(firstNeg,sinceDeltaChange, t1.deltaTime, sinceDeltaChange/t1.deltaTime)
        // If time til next update bigger than deltaTime, interpolation hasn't started
        if(0 > sinceDeltaChange) return timeline[firstNeg];

        // Lerp values
        const t = sinceDeltaChange / t1.deltaTime;

        // @ts-ignore
        return new IValue(t * t1 + (1-t) * timeline[firstNeg]);
    });

    static KeepVelocity = (
        object: { [key: string]: any },
        property: string,
    ) => new Interpolator(object, property, timeline => {
        if(timeline.length == 1) return timeline[0];

        const t = (Date.now() / 1000 - timeline[0].received) / timeline[0].deltaTime;

        // @ts-ignore
        return new IValue(timeline[0] + (timeline[0] - timeline[1]) * t);
    });

    /**
     * Create your own interpolation method to predict values between updates
     * @param object Object containing property to interpolate
     * @param property Property on `object` to interpolate
     * @param method Function called whenever value attempted to be accessed
     * @example
     * new Interpolator(player.pos, 'x', (timeline, deltaTime) => {
     *     console.log(timeline) // [{ value: 3, received: 164083984.392, deltaTime: 0.064 }, ...]
     *     return timeline[0].value; // returns last received update
     * });
     */
    constructor(
        object: { [key: string]: any },
        property: string,
        method: ((timeline: IValue[]) => IValue)
    ) {
        if(typeof object != 'object') {
            throw new Error(`Cannot apply interpolator on the non-object '${object}'`);
        }
        if(typeof object[property] != 'number') {
            throw new Error(`Cannot apply interpolator on the non-number '${object[property]}'`);
        }
        if(!method) throw new Error('No method passed when creating new Interpolator instance');

        this.timeline = [new IValue(
            object[property],
            Time.deltaTime,
            Time.lastUpdate / 1000
        )];
        this.method = method;


        // Create proxy to allow interpolator to intervene when getting property
        Object.defineProperty(object, property, {
            get: function() {
                return this.method(this.timeline);
            }.bind(this),

            // When property value being set, add to timeline
            set: function(value: number) {
                return this.update(value);
            }.bind(this)
        });
    }

    /**
     * Update interpolator with new value
     * @param value Value to update interpolator with
     */
    update(value: number) {
        if(typeof value != 'number') {
            throw new Error(`Cannot apply interpolator on the non-number '${value}'`);
        }

        this.timeline.unshift(new IValue(value, Time.deltaTime, Time.lastUpdate / 1000));
        if(this.timeline.length > 10) this.timeline.pop();

        return true;
    }

    /**
     * Delete interpolator and replace with value
     * @param replacement Value to keep in place of interpolator. Defaults to current interpolated value
     */
    delete(replacement: number = this.object[this.property]) {
        delete this.object[this.property];
        this.object[this.property] = replacement;
    }
}