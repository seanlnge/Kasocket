export class Interpolator {
    object: { [key: string]: any };
    property: string;
    timeline: { value: number, received: number, deltaTime: number }[];
    method?: ((timeline: { value: number, received: number, deltaTime: number }[]) => number);

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
    static Lerp = (object: { [key: string]: any }, property: string, offset: number = 0.1) => new Interpolator(object, property, timeline => {
        if(timeline.length == 1) return timeline[0].value;

        // Index of first instance in timeline that offset time is in past
        const firstNeg = timeline.findIndex(x => x.received < Date.now()/1000 - offset);
        if(firstNeg <= 0) return timeline[0].value;

        // `tilUpdate` is time until next update occurs in offset timeline
        const tilUpdate = timeline[firstNeg-1].received - Date.now()/1000 + offset;
        const parsedDelta = Math.min(offset, timeline[firstNeg-1].deltaTime);

        // If time till next update is bigger than delta, it hasn't occured yet
        if(tilUpdate > parsedDelta) return timeline[firstNeg].value;

        // Lerp values
        const t = (parsedDelta - tilUpdate) / parsedDelta;
        return t * timeline[firstNeg-1].value + (1-t) * timeline[firstNeg].value;
    });

    static KeepVelocity = (object: { [key: string]: any }, property: string, maxDelta: number = 0.1) => new Interpolator(object, property, timeline => {
        if(timeline.length == 1) return timeline[0].value;
        if(Date.now()/1000 - timeline[0].received > maxDelta) return timeline[0].value;
        const sinceLastUpdate = Date.now() / 1000 - timeline[0].received;
        const t = sinceLastUpdate / timeline[0].deltaTime;
        return timeline[0].value + (timeline[0].value - timeline[1].value) * t;
    });

    /**
     * Create your own interpolation method to predict values between updates
     * @param object Object containing property to interpolate
     * @param property Property on `object` to interpolate
     * @param method Function called whenever value attempted to be accessed
     * @example
     * new Interpolator(player.pos, 'x', timeline => {
     *     console.log(timeline) // [{ value: 3, received: 164083984.392, deltaTime: 0.064 }, ...]
     *     return timeline[0].value; // returns last received update
     * });
     */
    constructor(object: { [key: string]: any }, property: string, method: ((timeline: { value: number, received: number, deltaTime: number }[]) => number)) {
        if(typeof object != 'object') {
            throw new Error(`Cannot apply interpolator on the non-object '${object}'`);
        }
        if(typeof object[property] != 'number') {
            throw new Error(`Cannot apply interpolator on the non-number '${object[property]}'`);
        }
        if(!method) throw new Error('No method passed when creating new Interpolator instance');

        this.timeline = [{
            value: object[property],
            received: Date.now() / 1000,
            deltaTime: 0,
        }];
        this.method = method;

        // Create proxy to allow interpolator to intervene when getting property
        Object.defineProperty(object, property, {
            get: function() {
                return this.method(this.timeline);
            }.bind(this),

            // When property value being set, add to timeline
            set: function(value: number) {
                this.update(value);
                return true;
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

        this.timeline.unshift({
            value,
            received: Date.now()/1000,
            deltaTime: Date.now()/1000 - this.timeline[0].received
        });

        if(this.timeline.length > 10) this.timeline.pop();
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