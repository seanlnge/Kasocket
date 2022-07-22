const g = global;

/* This file for sending kaboom objects and erquests over websocket */
export function Kaboom({
    global = true
} = {}) {
    const obj = {
        add,
        rect,
        circle,
        pos,
        rotate,
        scale,
        color,
        opacity,

        rgb,
        hsl2rgb,
        RED: rgb(255, 0, 0),
        GREEN: rgb(0, 255, 0),
        BLUE: rgb(0, 0, 255),
        YELLOW: rgb(255, 255, 0),
        MAGENTA: rgb(255, 0, 255),
        CYAN: rgb(0, 255, 255),
        WHITE: rgb(255, 255, 255),
        BLACK: rgb(0, 0, 0),
    }

    if(global) {
        for(const v in obj) {
            g[v] = obj[v];
        }
    }

    return obj;
}

export class KaboomObject {
    name: string;
    args: any[];
    properties: { [key: string]: any };

    constructor(name: string, args: any[], properties: { [key: string]: any }) {
        this.name = name;
        this.args = args;
        this.properties = properties;
    }
};

const add = (comps: any[]) => new KaboomObject('add', [comps], {});
const rect = (width: number, length: number) => new KaboomObject('rect', [width, length], {});
const circle = (radius: number) => new KaboomObject('circle', [radius], {});

const pos = (x: number, y: number) => new KaboomObject(
    'pos',
    [x, y],
    { pos: { x, y } }
);

const rotate = (angle: number) => new KaboomObject(
    'rotate',
    [angle],
    { angle }
);

const scale = (x: number, y: number) => new KaboomObject(
    'scale',
    [x, y],
    { scale: { x, y } }
);

const color = (...args: any) => new KaboomObject(
    'color',
    args,
    { color: args }
);

const opacity = (opacity: number) => new KaboomObject(
    'opacity',
    [opacity],
    { opacity }
);

const rgb = (r: number, g: number, b: number) => new KaboomObject('rgb', [r, g, b], {});
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const hsl2rgb = (h: number, s: number, l: number) => {
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2/3 - t) * 6
        return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = hue2rgb(p, q, h + 1 / 3)
    const g = hue2rgb(p, q, h)
    const b = hue2rgb(p, q, h - 1 / 3)

    return rgb(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}