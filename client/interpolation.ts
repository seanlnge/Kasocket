let timer = Date.now();
export class Interpolator {
    timeline: { value: number, sent: number, received: number }[];
    current: number;
    latency: number;
    method: ((current: number, previous: number, time: number) => number);

    constructor(method: ((current: number, previous: number, time: number) => number), initial: number) {
        this.timeline =  [{ value: initial, sent: Date.now(), received: Date.now() }];
        this.current =  this.timeline[0].value;
        this.method = method;
    }

    get value(): number {
        if(!this.timeline[1]) return this.timeline[0].value;

        return this.method(
            this.current,
            this.timeline[1].value,
            Math.min(1, Math.max(0, (Date.now()-this.timeline[0].received) / (this.timeline[0].sent-this.timeline[1].sent)))
        );
    }

    update(value: number, sent: number) {
        this.timeline.unshift({ value, sent, received: Date.now() });
        if(this.timeline.length > 10) this.timeline.pop();
        
        this.current = value;
    }

    static Lerp(initial: number) {
        return new Interpolator((c, p, t) => c*t + p*(1-t), initial);
    }
}

export function Proxybox (obj: { [key: string]: any }): { [key: string]: any } {
    const box = {};
    for(const prop in obj) {
        if(typeof obj[prop] == 'object') {
            box[prop] = Proxybox(obj[prop]);
        } else {
            box[prop] = obj[prop];
        }

        let storer = box[prop];
        Object.defineProperty(box, prop, {
            get() {
                if(storer instanceof Interpolator) {
                    return storer.value;
                }
                return storer;
            },
            set(value) {
                if(typeof value !== 'object') throw new Error('bruh')
                if(storer instanceof Interpolator) {
                    return storer.update(value.value, value.time);
                }
                if(value instanceof Interpolator) {
                    return storer = value;
                }
                storer = value.value;
            }
        });
    }

    return box;
}