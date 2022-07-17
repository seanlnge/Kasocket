import { KaboomCtx } from "kaboom"

export type ClientOptions = {
    global: boolean,
    url: string,
    path: string,
    kaboom: KaboomCtx
}

export type ServerOptions = {
    path: string,
    uuidMax: number,
    tps: number
}