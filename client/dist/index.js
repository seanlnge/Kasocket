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

// kasocket/message.ts
var Message = class {
  constructor(name, data) {
    this.name = name;
    this.data = data;
    this.time = Date.now();
  }
  static BundleOperations(deltaTime, operations) {
    if (!Array.isArray(operations))
      operations = [operations];
    return JSON.stringify(new Message("_", { operations, deltaTime }));
  }
  static Parse(str) {
    const parsed = JSON.parse(str);
    return new Message(parsed.name, parsed.data);
  }
  static Create(name, data) {
    return JSON.stringify(new Message(name, data));
  }
};
__name(Message, "Message");

// kasocket/client/interpolation.ts
var _Interpolator = class {
  constructor(object, property, method) {
    if (typeof object != "object") {
      throw new Error(`Cannot apply interpolator on the non-object '${object}'`);
    }
    if (typeof object[property] != "number") {
      throw new Error(`Cannot apply interpolator on the non-number '${object[property]}'`);
    }
    if (!method)
      throw new Error("No method passed when creating new Interpolator instance");
    this.timeline = [{
      value: object[property],
      received: Date.now() / 1e3,
      deltaTime: 0
    }];
    this.method = method;
    Object.defineProperty(object, property, {
      get: function() {
        return this.method(this.timeline);
      }.bind(this),
      set: function(value) {
        this.update(value);
        return true;
      }.bind(this)
    });
  }
  update(value) {
    if (typeof value != "number") {
      throw new Error(`Cannot apply interpolator on the non-number '${value}'`);
    }
    this.timeline.unshift({
      value,
      received: Date.now() / 1e3,
      deltaTime: Date.now() / 1e3 - this.timeline[0].received
    });
    if (this.timeline.length > 10)
      this.timeline.pop();
  }
  delete(replacement = this.object[this.property]) {
    delete this.object[this.property];
    this.object[this.property] = replacement;
  }
};
var Interpolator = _Interpolator;
__name(Interpolator, "Interpolator");
Interpolator.Lerp = /* @__PURE__ */ __name((object, property, offset = 0.1) => new _Interpolator(object, property, (timeline) => {
  if (timeline.length == 1)
    return timeline[0].value;
  const firstNeg = timeline.findIndex((x) => x.received < Date.now() / 1e3 - offset);
  if (firstNeg <= 0)
    return timeline[0].value;
  const tilUpdate = timeline[firstNeg - 1].received - Date.now() / 1e3 + offset;
  const parsedDelta = Math.min(offset, timeline[firstNeg - 1].deltaTime);
  if (tilUpdate > parsedDelta)
    return timeline[firstNeg].value;
  const t = (parsedDelta - tilUpdate) / parsedDelta;
  return t * timeline[firstNeg - 1].value + (1 - t) * timeline[firstNeg].value;
}), "Lerp");
Interpolator.MaintainSpeed = /* @__PURE__ */ __name((object, property, maxDelta = 0.1) => new _Interpolator(object, property, (timeline) => {
  if (timeline.length == 1)
    return timeline[0].value;
  if (Date.now() / 1e3 - timeline[0].received > maxDelta)
    return timeline[0].value;
  const sinceLastUpdate = Date.now() / 1e3 - timeline[0].received;
  const t = sinceLastUpdate / timeline[0].deltaTime;
  return timeline[0].value + (timeline[0].value - timeline[1].value) * t;
}), "MaintainSpeed");

// kasocket/client/serverInterface.ts
var ServerUpdate = class {
  constructor(value) {
    this.value = value;
  }
};
__name(ServerUpdate, "ServerUpdate");
function Declassify(object, ctx) {
  if (object.type == "value")
    return object.value;
  if (object.type == "kaboom") {
    return ctx[object.name](...Declassify(object.args, ctx));
  }
  if (object.type == "object") {
    const ret = {};
    for (const prop in object.properties) {
      ret[prop] = Declassify(object.properties[prop], ctx);
    }
    return ret;
  }
  if (object.type == "array") {
    return object.values.map((x) => Declassify(x, ctx));
  }
}
__name(Declassify, "Declassify");

// kasocket/client/index.ts
var Client = class {
  constructor({
    global = true,
    url = `wss://${window.location.hostname}`,
    path = "/multiplayer",
    kaboom = window
  } = {}) {
    this.events = {};
    this.ready = false;
    this.lastUpdate = Date.now();
    this.deltaTime = 0;
    this.ctx = kaboom;
    this.clients = /* @__PURE__ */ new Map();
    this.ws = new WebSocket(url + path);
    this.public = this.CreateMutationProxy("public", {});
    this.private = this.CreateMutationProxy("private", {});
    this.ws.onmessage = (event) => {
      const message = Message.Parse(event.data);
      if (Date.now() - message.time > 1e3)
        return;
      if (message.name == "_") {
        this.deltaTime = (Date.now() - this.lastUpdate) / 1e3;
        this.lastUpdate = Date.now();
        const newClients = /* @__PURE__ */ new Map();
        let init = false;
        for (const operation of message.data.operations) {
          this.HandleOperation(operation);
          if (operation.operation == "cre") {
            newClients.set(operation.id, operation.client);
          } else if (operation.operation == "init") {
            init = true;
          }
        }
        if (init && this.connectEvent) {
          const client = this.clients.get(this.id);
          this.connectEvent(client, this.id);
        }
        if (this.clientEvent) {
          for (const [id, client] of newClients) {
            this.clientEvent(client, id);
          }
        }
        if (this.updateEvent) {
          this.updateEvent();
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
        case "set": {
          const declass = Declassify(operation.value, this.ctx);
          if (operation.id == this.id) {
            return object[operation.property] = new ServerUpdate(declass);
          } else {
            return object[operation.property] = declass;
          }
        }
        case "delete": {
          return delete object[operation.property];
        }
        default:
          throw new ReferenceError(`'${operation.instruction}' is not a valid client mutation instruction`);
      }
    } else if (operation.operation == "cre") {
      this.clients.set(operation.id, Declassify(operation.client, this.ctx));
    } else if (operation.operation == "init") {
      this.ready = true;
      this.id = operation.id;
      for (const clientID in operation.clients) {
        this.clients.set(clientID, Declassify(operation.clients[clientID], this.ctx));
      }
      for (const instance in operation.clientData) {
        this[instance] = this.CreateMutationProxy(instance, Declassify(operation.clientData[instance], this.ctx));
      }
      this.clients.set(this.id, this.public);
    } else
      throw new Error(`That is not a valid operation`);
  }
  on(type, callback) {
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
  send(name, data) {
    this.ws.send(Message.Create(name, data));
  }
  onConnect(callback) {
    this.connectEvent = callback;
  }
  onClientConnect(callback) {
    this.clientEvent = callback;
  }
  onServerUpdate(callback) {
    this.updateEvent = callback;
  }
  CreateMutationProxy(instance, proxied) {
    function recursiveProxy(object, path) {
      return new Proxy(object, {
        has(object2, property) {
          if (property == "__isProxy")
            return true;
          return property in object2;
        },
        get(object2, property) {
          if (typeof object2[property] != "object" || object2[property] === null) {
            return object2[property];
          }
          if ("__isProxy" in object2)
            return object2[property];
          return recursiveProxy(object2[property], [...path, property]);
        },
        set: function(object2, property, value) {
          if (object2[property] === value)
            return false;
          if (value instanceof ServerUpdate) {
            object2[property] = value.value;
            return true;
          }
          object2[property] = value;
          this.ws.send(Message.BundleOperations(this.deltaTime, {
            operation: "mut_cli",
            instruction: "set",
            instance,
            path,
            property,
            value
          }));
          return true;
        }.bind(this),
        deleteProperty: function(object2, property) {
          if (!(property in object2))
            return false;
          delete object2[property];
          this.ws.send(Message.BundleOperations(this.deltaTime, {
            operation: "mut_cli",
            instruction: "delete",
            instance,
            path,
            property
          }));
          return true;
        }.bind(this)
      });
    }
    __name(recursiveProxy, "recursiveProxy");
    return recursiveProxy.bind(this)(proxied, []);
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
} = {}) => {
  const ClientObject = new Client({ global, url, path, kaboom });
  return {
    Public: ClientObject.public,
    Private: ClientObject.private,
    Clients: ClientObject.clients,
    OnMessage: ClientObject.on,
    SendMessage: ClientObject.send
  };
}, "connect");
var client_default = { Client, connect };
