var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// kasocket/client/index.ts
var client_exports = {};
__export(client_exports, {
  default: () => client_default
});
module.exports = __toCommonJS(client_exports);

// kasocket/types/message.ts
var Message = class {
  constructor(name, data) {
    this.name = name;
    this.data = data;
    this.time = Date.now();
  }
  static bundleOperations(operations) {
    if (!Array.isArray(operations))
      operations = [operations];
    return JSON.stringify(new Message("_", operations));
  }
  static fromString(str) {
    const parsed = JSON.parse(str);
    return new Message(parsed.name, parsed.data);
  }
  static toString(name, data) {
    return JSON.stringify(new Message(name, data));
  }
};
__name(Message, "Message");

// kasocket/client/interpolation.ts
var timer = Date.now();
var Interpolator = class {
  constructor(method, initial) {
    this.timeline = [{ value: initial, sent: Date.now(), received: Date.now() }];
    this.current = this.timeline[0].value;
    this.method = method;
  }
  get value() {
    if (!this.timeline[1])
      return this.timeline[0].value;
    return this.method(this.current, this.timeline[1].value, Math.min(1, Math.max(0, (Date.now() - this.timeline[0].received) / (this.timeline[0].sent - this.timeline[1].sent))));
  }
  update(value, sent) {
    this.timeline.unshift({ value, sent, received: Date.now() });
    if (this.timeline.length > 10)
      this.timeline.pop();
    this.current = value;
  }
  static Lerp(initial) {
    return new Interpolator((c, p, t) => c * t + p * (1 - t), initial);
  }
};
__name(Interpolator, "Interpolator");
function Proxybox(obj) {
  const box = {};
  for (const prop in obj) {
    if (typeof obj[prop] == "object") {
      box[prop] = Proxybox(obj[prop]);
    } else {
      box[prop] = obj[prop];
    }
    let storer = box[prop];
    Object.defineProperty(box, prop, {
      get() {
        if (storer instanceof Interpolator) {
          return storer.value;
        }
        return storer;
      },
      set(value) {
        if (typeof value !== "object")
          throw new Error("bruh");
        if (storer instanceof Interpolator) {
          return storer.update(value.value, value.time);
        }
        if (value instanceof Interpolator) {
          return storer = value;
        }
        storer = value.value;
      }
    });
  }
  return box;
}
__name(Proxybox, "Proxybox");

// kasocket/client/index.ts
var Client = class {
  constructor({
    global = true,
    url = `wss://${window.location.hostname}`,
    path = "/multiplayer",
    kaboom = window
  } = {}) {
    this.events = {};
    this.ctx = kaboom;
    this.clients = /* @__PURE__ */ new Map();
    this.ws = new WebSocket(url + path);
    this.public = this.CreateMutationProxy("public", {});
    this.private = this.CreateMutationProxy("private", {});
    this.ws.onmessage = (event) => {
      const message = Message.fromString(event.data);
      if (Date.now() - message.time > 1e3)
        return;
      if (message.name == "_") {
        for (const operation of message.data) {
          console.log(operation);
          this.HandleOperation(operation);
        }
      }
      if (message.name in this.events) {
        for (const event2 of this.events[message.name]) {
          event2(message.data);
        }
      }
    };
    if (global) {
      window["Self"] = this;
      window["Clients"] = this.clients;
      window["Public"] = this.public;
      window["Private"] = this.private;
      window["Interpolator"] = Interpolator;
    }
  }
  HandleOperation(operation) {
    if (operation.operation == "mut") {
      const client = this.clients.get(operation.id);
      if (!client)
        throw new ReferenceError(`Client ${operation.id} does not exist`);
      let object = client;
      for (const p of operation.path)
        object = object[p];
      switch (operation.instruction) {
        case "set":
          return object[operation.property] = { value: operation.value, time: operation.time };
        case "delete":
          return delete object[operation.property];
        default:
          throw new ReferenceError(`'${operation.instruction}' is not a valid client mutation instruction`);
      }
    } else if (operation.operation == "cre") {
      this.clients.set(operation.id, Proxybox(operation.client));
    } else if (operation.operation == "init") {
      this.id = operation.id;
      for (const clientID in operation.clients) {
        this.clients.set(clientID, Proxybox(operation.clients[clientID]));
      }
      for (const instance in operation.clientData) {
        this[instance] = this.CreateMutationProxy(instance, operation.clientData[instance]);
      }
    } else
      throw new Error(`That is not a valid operation`);
  }
  onMessage(type, callback) {
    let index;
    if (type in this.events) {
      index = this.events[type].length;
      this.events[type].push(callback);
    } else {
      index = 0;
      this.events[type] = [callback];
    }
    return {
      cancel: () => {
        this.events[type].splice(index, 1);
        if (this.events[type].length == 0)
          delete this.events[type];
      }
    };
  }
  sendMessage(type, data) {
    this.ws.send(Message.toString(type, data));
  }
  CreateMutationProxy(instance, proxied) {
    const t = this;
    function recursiveProxy(object, path) {
      return new Proxy(object, {
        get(object2, property) {
          if (typeof object2[property] != "object" || object2[property] == null) {
            return object2[property];
          }
          return recursiveProxy(object2, [...path, property]);
        },
        set(object2, property, value) {
          if (object2[property] === value)
            return false;
          let data = t.clients.get(t.id);
          for (const p of path) {
            if (!data)
              throw new ReferenceError(`The property '${p}' does not exist on ${data}`);
            data = data[p];
          }
          if (!data)
            throw new ReferenceError(`Data does not exist`);
          data[property] = { value, time: Date.now() };
          object2[property] = value;
          t.ws.send(Message.bundleOperations({
            operation: "mut_cli",
            instruction: "set",
            instance,
            path,
            property,
            value
          }));
          return true;
        },
        deleteProperty(object2, property) {
          if (!(property in object2))
            return false;
          let clientData = t.clients.get(t.id);
          if (!clientData)
            throw new ReferenceError("Client data does not exist");
          let data = clientData[instance];
          for (const p of path)
            data = data[p];
          delete data[property];
          delete object2[property];
          t.ws.send(Message.bundleOperations({
            operation: "mut_cli",
            instruction: "delete",
            instance,
            path,
            property
          }));
          return true;
        }
      });
    }
    __name(recursiveProxy, "recursiveProxy");
    return recursiveProxy(proxied, []);
  }
  getClients() {
    return Object.keys(this.clients).map((id) => __spreadValues({ id }, this.clients.get(id)));
  }
};
__name(Client, "Client");
var connect = /* @__PURE__ */ __name(({
  global = true,
  url = `wss://${window.location.hostname}`,
  path = "/multiplayer",
  kaboom = window
}) => {
  const ClientObject = new Client({ global, url, path, kaboom });
  return {
    Public: ClientObject.public,
    Private: ClientObject.private,
    Clients: ClientObject.clients,
    OnMessage: ClientObject.onMessage,
    SendMessage: ClientObject.sendMessage
  };
}, "connect");
var client_default = { Client, connect };
