/* Port client kaboom to server code to send to client */
import {
	sat,
	vec2,
	vec3,
	Vec3,
	Rect,
	Point,
	Polygon,
	Line,
	Circle,
	Color,
	Vec2,
	Mat4,
	Quad,
	RNG,
	quad,
	rgb,
	hsl2rgb,
	rand,
	randi,
	randSeed,
	chance,
	choose,
	clamp,
	lerp,
	map,
	mapc,
	wave,
	testLineLine,
	testRectRect,
	testRectRect2,
	testRectLine,
	testRectPoint,
	testPolygonPoint,
	deg2rad,
	rad2deg,
} from "./math"


export class KaboomObject {
	__functionName: string;
	__arguments: any[];
    __properties: { [key: string]: any };

    constructor(name: string, args: any[], properties: { [key: string]: any } = {}) {
        this.__functionName = name;
        this.__arguments = args;
        this.__properties = properties;

		// Return proxy bc Kaboom properties locked in this.__properties
		return new Proxy(this, {
			get(object, property: string) {
				if(property == '__functionName'
				|| property == '__arguments'
				|| property == '__properties'
				) return object[property];

				return object.__properties[property];
			}
		});
    }
};

const add = (comps: any[]) => {
	// Inherit properties from comps
	const props = {};
	for(const comp of comps) {
		for(const prop in comp.__properties) {
			props[prop] = comp.__properties[prop];
		}
	}

	return new KaboomObject(
		'add',
		[comps],
		props
	);
}

const rect = (width: number, length: number) => new KaboomObject(
    'rect',
    [width, length],
    { width, length }
);

const circle = (radius: number) => new KaboomObject(
    'circle',
    [radius],
    { radius }
);

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

// Object's constructor gets obfuscated with JSON, and Kaboom needs Color constructor,
// so store Color object in server, but send details to recreate object to client
const color = (...args: any) => {
	let color: any = rgb(...args); // sorry static typists
	if(args.length == 1 && args[0] instanceof Color) {
		color = new KaboomObject(
			'rgb',
			[args[0].r, args[0].g, args[0].b],
			args[0]
		);
	}
	return new KaboomObject(
		'color',
		[color],
		{ color }
	);
}

const opacity = (opacity: number) => new KaboomObject(
    'opacity',
    [opacity],
    { opacity }
);

const g = global;

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

		RED: Color.RED,
		GREEN: Color.GREEN,
		BLUE: Color.BLUE,
		YELLOW: Color.YELLOW,
		MAGENTA: Color.MAGENTA,
		CYAN: Color.CYAN,
		WHITE: Color.WHITE,
		BLACK: Color.BLACK,

		sat,
		vec2,
		vec3,
		Vec3,
		Rect,
		Point,
		Polygon,
		Line,
		Circle,
		Vec2,
		Mat4,
		Quad,
		RNG,
		quad,
		rad2deg,
		deg2rad,
		rgb,
		hsl2rgb,
		rand,
		randi,
		randSeed,
		chance,
		choose,
		clamp,
		lerp,
		map,
		mapc,
		wave,
		testLineLine,
		testRectRect,
		testRectRect2,
		testRectLine,
		testRectPoint,
		testPolygonPoint,
/* 
		// misc
		camPos,
		camScale,
		camRot,
		shake,
		toScreen,
		toWorld,
		gravity,

		// math
		Line,
		Rect,
		Circle,
		Polygon,
		Point,
		Vec2,
		Color,
		Mat4,
		Quad,
		RNG,
		rand,
		randi,
		randSeed,
		vec2,
		rgb,
		hsl2rgb,
		quad,
		choose,
		chance,
		lerp,
		map,
		mapc,
		wave,
		deg2rad,
		rad2deg,
		testLineLine,
		testRectRect,
		testRectLine,
		testRectPoint,

		// raw draw
		drawSprite,
		drawText,
		formatText,
		drawRect,
		drawLine,
		drawLines,
		drawTriangle,
		drawCircle,
		drawEllipse,
		drawUVQuad,
		drawPolygon,
		drawFormattedText,
		pushTransform,
		popTransform,
		pushTranslate,
		pushScale,
		pushRotate,

		// debug
		debug,

		// scene
		scene,
		go,

		// level
		addLevel,

		// storage
		getData,
		setData,

		// plugin
		plug,

		// char sets
		ASCII_CHARS,
		CP437_CHARS,

		// dirs
		LEFT: Vec2.LEFT,
		RIGHT: Vec2.RIGHT,
		UP: Vec2.UP,
		DOWN: Vec2.DOWN,
        
		// colors
		RED: Color.RED,
		GREEN: Color.GREEN,
		BLUE: Color.BLUE,
		YELLOW: Color.YELLOW,
		MAGENTA: Color.MAGENTA,
		CYAN: Color.CYAN,
		WHITE: Color.WHITE,
		BLACK: Color.BLACK, */
    }

    if(global) {
        for(const v in obj) {
            g[v] = obj[v];
        }
    }

    return obj;
}
