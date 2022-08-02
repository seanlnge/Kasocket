var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var Time = {
  lastUpdate: Date.now(),
  deltaTime: 0
};
var IValue = class extends Number {
  constructor(value, deltaTime = 0, received = Date.now() / 1e3) {
    super(value);
    this.deltaTime = deltaTime;
    this.received = received;
  }
  get isInterpolator() {
    return true;
  }
};
__name(IValue, "IValue");
var _Interpolator = class {
  static IsInterpolator(object, property) {
    const v = object[property];
    return v instanceof IValue;
  }
  constructor(object, property, method) {
    if (typeof object != "object") {
      throw new Error(`Cannot apply interpolator on the non-object '${object}'`);
    }
    if (typeof object[property] != "number") {
      throw new Error(`Cannot apply interpolator on the non-number '${object[property]}'`);
    }
    if (!method)
      throw new Error("No method passed when creating new Interpolator instance");
    this.timeline = [new IValue(object[property], Time.deltaTime, Time.lastUpdate / 1e3)];
    this.method = method;
    Object.defineProperty(object, property, {
      get: function() {
        return this.method(this.timeline);
      }.bind(this),
      set: function(value) {
        return this.update(value);
      }.bind(this)
    });
  }
  update(value) {
    if (typeof value != "number") {
      throw new Error(`Cannot apply interpolator on the non-number '${value}'`);
    }
    this.timeline.unshift(new IValue(value, Time.deltaTime, Time.lastUpdate / 1e3));
    if (this.timeline.length > 10)
      this.timeline.pop();
    return true;
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
    return timeline[0];
  const firstNeg = timeline.findIndex((x) => x.received < Date.now() / 1e3 - offset);
  if (firstNeg <= 0)
    return timeline[0];
  const t1 = timeline[firstNeg - 1];
  const sinceDeltaChange = Date.now() / 1e3 - offset - t1.received + t1.deltaTime;
  if (0 > sinceDeltaChange)
    return timeline[firstNeg];
  const t = sinceDeltaChange / t1.deltaTime;
  return new IValue(t * t1 + (1 - t) * timeline[firstNeg]);
}), "Lerp");
Interpolator.KeepVelocity = /* @__PURE__ */ __name((object, property) => new _Interpolator(object, property, (timeline) => {
  if (timeline.length == 1)
    return timeline[0];
  const t = (Date.now() / 1e3 - timeline[0].received) / timeline[0].deltaTime;
  return new IValue(timeline[0] + (timeline[0] - timeline[1]) * t);
}), "KeepVelocity");

// kasocket/client/serverInterface.ts
var ServerUpdate = class {
  constructor(value, deleteProp = false) {
    this.value = value;
    this.delete = deleteProp;
  }
};
__name(ServerUpdate, "ServerUpdate");
var objectMap = /* @__PURE__ */ new Map();
function Declassify(object, ctx) {
  if (object.type == "value")
    return object.value;
  if (object.type == "kaboomMethod") {
    return new ServerUpdate(object.value);
  }
  if (object.type == "reference") {
    const obj = objectMap.get(object.id);
    if (obj === void 0) {
      throw new ReferenceError(`Object with server identifier '${object.id}' was not found`);
    }
    return obj;
  }
  let ref;
  if (object.type == "kaboom") {
    ref = ctx[object.name](...Declassify(object.args, ctx));
  } else if (object.type == "object") {
    const ret = {};
    for (const prop in object.properties) {
      ret[prop] = Declassify(object.properties[prop], ctx);
    }
    ref = ret;
  } else if (object.type == "array") {
    ref = object.values.map((x) => Declassify(x, ctx));
  }
  objectMap.set(object.id, ref);
  return ref;
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
    this.public = this.CreateMutationProxy("public", {});
    this.private = this.CreateMutationProxy("private", {});
    this.clients = /* @__PURE__ */ new Map();
    this.isReady = false;
    this.ready = new Promise((res) => this.readyResolve = res);
    this.readyQueue = [];
    this.lastUpdate = Date.now();
    this.deltaTime = 0;
    this.mutationListeners = /* @__PURE__ */ new Map();
    this.send = /* @__PURE__ */ __name((name, data) => this.queue(Message.Create(name, data)), "send");
    this.onConnect = /* @__PURE__ */ __name((callback) => this.connectEvent = callback, "onConnect");
    this.onNewClient = /* @__PURE__ */ __name((callback) => this.clientEvent = callback, "onNewClient");
    this.onServerUpdate = /* @__PURE__ */ __name((callback) => this.updateEvent = callback, "onServerUpdate");
    this.ctx = kaboom;
    this.ws = new WebSocket(url + path);
    this.ws.onmessage = (event) => {
      const message = Message.Parse(event.data);
      if (Date.now() - message.time > 1e3)
        return;
      if (message.name == "_") {
        this.deltaTime = Time.deltaTime = (Date.now() - this.lastUpdate) / 1e3;
        this.lastUpdate = Time.lastUpdate = Date.now();
        const newClients = /* @__PURE__ */ new Map();
        let init = false;
        for (const operation of message.data.operations) {
          this.handleOperation(operation);
          if (operation.operation == "cre") {
            newClients.set(operation.id, this.clients.get(operation.id) || {});
          } else if (operation.operation == "init") {
            newClients.set(operation.id, this.public);
            init = true;
          }
        }
        if (init) {
          this.isReady = true;
          this.readyResolve(true);
          for (const msg of this.readyQueue)
            this.ws.send(msg);
          if (this.connectEvent) {
            this.connectEvent({
              public: this.public,
              private: this.private
            }, this.id);
          }
        }
        if (this.clientEvent) {
          for (const [id, client] of newClients)
            this.clientEvent(client, id);
        }
        if (this.updateEvent)
          this.updateEvent();
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
  queue(message) {
    if (this.isReady) {
      this.ws.send(message);
    } else {
      this.readyQueue.push(message);
    }
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
  addMutationListener(object, property, callback) {
    const obj = this.mutationListeners.get(object);
    if (!obj)
      this.mutationListeners.set(object, (/* @__PURE__ */ new Map()).set(property, callback));
    const prop = obj == null ? void 0 : obj.get(property);
    if (!prop)
      obj == null ? void 0 : obj.set(property, callback);
    else
      throw new ReferenceError("Multiple mutation listeners cannot be applied to the same object property");
    return { cancel: () => obj == null ? void 0 : obj.delete(property) };
  }
  handleOperation(operation) {
    var _a, _b;
    if (operation.operation == "mut") {
      const client = this.clients.get(operation.id);
      if (!client)
        throw new ReferenceError(`Client ${operation.id} does not exist`);
      let object = client;
      for (const i in operation.path) {
        object = object[operation.path[i]];
        if (object === void 0) {
          const path = operation.instance + "." + operation.path.slice(0, parseInt(i)).join(".");
          const prop = Object.keys(operation.path).length - 1 != parseInt(i) ? operation.path[parseInt(i)] : operation.property;
          throw new ReferenceError(`Property '${prop}' does not exist on 'client.${path}'`);
        }
      }
      const mutLis = (_a = this.mutationListeners.get(object)) == null ? void 0 : _a.get(operation.property);
      const mutLisPrev = object[operation.property];
      let lenLis;
      if (Array.isArray(object))
        lenLis = (_b = this.mutationListeners.get(object)) == null ? void 0 : _b.get("length");
      switch (operation.instruction) {
        case "set": {
          let declass = Declassify(operation.value, this.ctx);
          if (declass instanceof ServerUpdate) {
            object[operation.property][declass.value.name](...declass.value.args);
            return;
          }
          if (operation.id == this.id) {
            object[operation.property] = new ServerUpdate(declass);
          } else {
            object[operation.property] = declass;
          }
          if (mutLis)
            mutLis(mutLisPrev, object[operation.property]);
          if (lenLis)
            lenLis(object.length - 1, object.length);
          return;
        }
        case "delete": {
          if (operation.id == this.id) {
            object[operation.property] = new ServerUpdate(void 0, true);
          } else {
            delete object[operation.property];
          }
          if (mutLis)
            mutLis(mutLisPrev, void 0);
          if (lenLis)
            lenLis(object.length + 1, object.length);
          return;
        }
        default:
          throw new ReferenceError(`'${operation.instruction}' is not a valid client mutation instruction`);
      }
    } else if (operation.operation == "cre") {
      this.clients.set(operation.id, Declassify(operation.client, this.ctx));
    } else if (operation.operation == "init") {
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
  CreateMutationProxy(instance, proxied) {
    const t = this;
    function recursiveProxy(object, path) {
      return new Proxy(object, {
        has(object2, property) {
          if (property == "__isProxy")
            return true;
          return property in object2;
        },
        get(object2, property) {
          if (typeof object2[property] != "object" || object2[property] === null || object2[property] instanceof IValue) {
            return object2[property];
          }
          if ("__isProxy" in object2[property])
            return object2[property];
          return object2[property] = recursiveProxy(object2[property], [...path, property]);
        },
        set(object2, property, value) {
          var _a;
          if (object2[property] === value)
            return true;
          if (value instanceof ServerUpdate) {
            if (value.delete === true) {
              delete object2[property];
            } else {
              object2[property] = value.value;
            }
            return true;
          }
          const mutLis = (_a = t.mutationListeners.get(object2)) == null ? void 0 : _a.get(property);
          const mutLisPrev = object2[property];
          object2[property] = value;
          if (mutLis)
            mutLis(mutLisPrev, value);
          t.queue(Message.BundleOperations(t.deltaTime, {
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
          var _a;
          if (!(property in object2))
            return true;
          const mutLis = (_a = t.mutationListeners.get(object2)) == null ? void 0 : _a.get(property);
          const mutLisPrev = object2[property];
          delete object2[property];
          if (mutLis)
            mutLis(mutLisPrev, void 0);
          t.queue(Message.BundleOperations(t.deltaTime, {
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
