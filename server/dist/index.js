var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module2) {
    "use strict";
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    __name(emitClose, "emitClose");
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    __name(duplexOnEnd, "duplexOnEnd");
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    __name(duplexOnError, "duplexOnError");
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex(__spreadProps(__spreadValues({}, options), {
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      }));
      ws.on("message", /* @__PURE__ */ __name(function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      }, "message"));
      ws.once("error", /* @__PURE__ */ __name(function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      }, "error"));
      ws.once("close", /* @__PURE__ */ __name(function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      }, "close"));
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", /* @__PURE__ */ __name(function error(err2) {
          called = true;
          callback(err2);
        }, "error"));
        ws.once("close", /* @__PURE__ */ __name(function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        }, "close"));
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", /* @__PURE__ */ __name(function open() {
            duplex._final(callback);
          }, "open"));
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", /* @__PURE__ */ __name(function finish() {
            callback();
          }, "finish"));
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", /* @__PURE__ */ __name(function open() {
            duplex._write(chunk, encoding, callback);
          }, "open"));
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    __name(createWebSocketStream2, "createWebSocketStream");
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module2) {
    "use strict";
    module2.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength)
        return target.slice(0, offset);
      return target;
    }
    __name(concat, "concat");
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    __name(_mask, "_mask");
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    __name(_unmask, "_unmask");
    function toArrayBuffer(buf) {
      if (buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    __name(toArrayBuffer, "toArrayBuffer");
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    __name(toBuffer, "toBuffer");
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    __name(Limiter, "Limiter");
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw(__spreadProps(__spreadValues({}, this._options.zlibInflateOptions), {
            windowBits
          }));
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw(__spreadProps(__spreadValues({}, this._options.zlibDeflateOptions), {
            windowBits
          }));
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin)
            data2 = data2.slice(0, data2.length - 4);
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    __name(PerMessageDeflate, "PerMessageDeflate");
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    __name(deflateOnData, "deflateOnData");
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    __name(inflateOnData, "inflateOnData");
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
    __name(inflateOnError, "inflateOnError");
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module2) {
    "use strict";
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    __name(isValidStatusCode, "isValidStatusCode");
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    __name(_isValidUTF8, "_isValidUTF8");
    module2.exports = {
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var Receiver2 = class extends Writable {
      constructor(options = {}) {
        super();
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._state = GET_INFO;
        this._loop = false;
      }
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = buf.slice(n);
          return buf.slice(0, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = buf.slice(n);
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      startLoop(cb) {
        let err;
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              err = this.getInfo();
              break;
            case GET_PAYLOAD_LENGTH_16:
              err = this.getPayloadLength16();
              break;
            case GET_PAYLOAD_LENGTH_64:
              err = this.getPayloadLength64();
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              err = this.getData(cb);
              break;
            default:
              this._loop = false;
              return;
          }
        } while (this._loop);
        cb(err);
      }
      getInfo() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          this._loop = false;
          return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (!this._fragmented) {
            this._loop = false;
            return error(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            this._loop = false;
            return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            this._loop = false;
            return error(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          }
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (this._payloadLength > 125) {
            this._loop = false;
            return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          }
        } else {
          this._loop = false;
          return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            this._loop = false;
            return error(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          }
        } else if (this._masked) {
          this._loop = false;
          return error(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          return this.haveLength();
      }
      getPayloadLength16() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        return this.haveLength();
      }
      getPayloadLength64() {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          this._loop = false;
          return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        return this.haveLength();
      }
      haveLength() {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            this._loop = false;
            return error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7)
          return this.controlMessage(data);
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        return this.dataMessage();
      }
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              return cb(error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
            }
            this._fragments.push(buf);
          }
          const er = this.dataMessage();
          if (er)
            return cb(er);
          this.startLoop(cb);
        });
      }
      dataMessage() {
        if (this._fin) {
          const messageLength = this._messageLength;
          const fragments = this._fragments;
          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragmented = 0;
          this._fragments = [];
          if (this._opcode === 2) {
            let data;
            if (this._binaryType === "nodebuffer") {
              data = concat(fragments, messageLength);
            } else if (this._binaryType === "arraybuffer") {
              data = toArrayBuffer(concat(fragments, messageLength));
            } else {
              data = fragments;
            }
            this.emit("message", data, true);
          } else {
            const buf = concat(fragments, messageLength);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              this._loop = false;
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("message", buf, false);
          }
        }
        this._state = GET_INFO;
      }
      controlMessage(data) {
        if (this._opcode === 8) {
          this._loop = false;
          if (data.length === 0) {
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else if (data.length === 1) {
            return error(RangeError, "invalid payload length 1", true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              return error(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            }
            const buf = data.slice(2);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("conclude", code, buf);
            this.end();
          }
        } else if (this._opcode === 9) {
          this.emit("ping", data);
        } else {
          this.emit("pong", data);
        }
        this._state = GET_INFO;
      }
    };
    __name(Receiver2, "Receiver");
    module2.exports = Receiver2;
    function error(ErrorCtor, message, prefix, statusCode, errorCode) {
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, error);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
    __name(error, "error");
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var Sender2 = class {
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            randomFillSync(mask, 0, 4);
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(buf, options), cb);
        }
      }
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(data, options), cb);
        }
      }
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender2.frame(data, options), cb);
        }
      }
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(Sender2.frame(data, {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1: false
          }), cb);
        }
      }
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(Sender2.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while data was being compressed");
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const params = this._queue[i];
              const callback = params[params.length - 1];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(Sender2.frame(buf, options), cb);
          this.dequeue();
        });
      }
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    __name(Sender2, "Sender");
    module2.exports = Sender2;
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      get target() {
        return this[kTarget];
      }
      get type() {
        return this[kType];
      }
    };
    __name(Event, "Event");
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      get code() {
        return this[kCode];
      }
      get reason() {
        return this[kReason];
      }
      get wasClean() {
        return this[kWasClean];
      }
    };
    __name(CloseEvent, "CloseEvent");
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      get error() {
        return this[kError];
      }
      get message() {
        return this[kMessage];
      }
    };
    __name(ErrorEvent, "ErrorEvent");
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      get data() {
        return this[kData];
      }
    };
    __name(MessageEvent, "MessageEvent");
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      addEventListener(type, listener, options = {}) {
        let wrapper;
        if (type === "message") {
          wrapper = /* @__PURE__ */ __name(function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            listener.call(this, event);
          }, "onMessage");
        } else if (type === "close") {
          wrapper = /* @__PURE__ */ __name(function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            listener.call(this, event);
          }, "onClose");
        } else if (type === "error") {
          wrapper = /* @__PURE__ */ __name(function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            listener.call(this, event);
          }, "onError");
        } else if (type === "open") {
          wrapper = /* @__PURE__ */ __name(function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            listener.call(this, event);
          }, "onOpen");
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = listener;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    __name(push, "push");
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    __name(parse, "parse");
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(Object.keys(params).map((k) => {
            let values = params[k];
            if (!Array.isArray(values))
              values = [values];
            return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    __name(format, "format");
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket3 = class extends EventEmitter {
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = WebSocket3.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._isServer = true;
        }
      }
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      get isPaused() {
        return this._paused;
      }
      get onclose() {
        return null;
      }
      get onerror() {
        return null;
      }
      get onopen() {
        return null;
      }
      get onmessage() {
        return null;
      }
      get protocol() {
        return this._protocol;
      }
      get readyState() {
        return this._readyState;
      }
      get url() {
        return this._url;
      }
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        socket.setTimeout(0);
        socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = WebSocket3.OPEN;
        this.emit("open");
      }
      emitClose() {
        if (!this._socket) {
          this._readyState = WebSocket3.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = WebSocket3.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      close(code, data) {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this.readyState === WebSocket3.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = WebSocket3.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
      }
      pause() {
        if (this.readyState === WebSocket3.CONNECTING || this.readyState === WebSocket3.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      ping(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      pong(data, mask, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      resume() {
        if (this.readyState === WebSocket3.CONNECTING || this.readyState === WebSocket3.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      send(data, options, cb) {
        if (this.readyState === WebSocket3.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket3.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = __spreadValues({
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true
        }, options);
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      terminate() {
        if (this.readyState === WebSocket3.CLOSED)
          return;
        if (this.readyState === WebSocket3.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this._socket) {
          this._readyState = WebSocket3.CLOSING;
          this._socket.destroy();
        }
      }
    };
    __name(WebSocket3, "WebSocket");
    Object.defineProperty(WebSocket3, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket3, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket3, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket3, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket3.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket3.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket3.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket3.prototype.addEventListener = addEventListener;
    WebSocket3.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket3;
    function initAsClient(websocket, address, protocols, options) {
      const opts = __spreadProps(__spreadValues({
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10
      }, options), {
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      });
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
        websocket._url = address.href;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
        websocket._url = address;
      }
      const isSecure = parsedUrl.protocol === "wss:";
      const isUnixSocket = parsedUrl.protocol === "ws+unix:";
      let invalidURLMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isUnixSocket) {
        invalidURLMessage = `The URL's protocol must be one of "ws:", "wss:", or "ws+unix:"`;
      } else if (isUnixSocket && !parsedUrl.pathname) {
        invalidURLMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidURLMessage = "The URL contains a fragment identifier";
      }
      if (invalidURLMessage) {
        const err = new SyntaxError(invalidURLMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = __spreadValues({
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      }, opts.headers);
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isUnixSocket) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalSecure = isSecure;
          websocket._originalHost = parsedUrl.host;
          const headers = options && options.headers;
          options = __spreadProps(__spreadValues({}, options), { headers: {} });
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = parsedUrl.host === websocket._originalHost;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket3.CONNECTING)
          return;
        req = websocket._req = null;
        if (res.headers.upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      req.end();
    }
    __name(initAsClient, "initAsClient");
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket3.CLOSING;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    __name(emitErrorAndClose, "emitErrorAndClose");
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    __name(netConnect, "netConnect");
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    __name(tlsConnect, "tlsConnect");
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket3.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    __name(abortHandshake, "abortHandshake");
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
        cb(err);
      }
    }
    __name(sendAfterClose, "sendAfterClose");
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    __name(receiverOnConclude, "receiverOnConclude");
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    __name(receiverOnDrain, "receiverOnDrain");
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    __name(receiverOnError, "receiverOnError");
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    __name(receiverOnFinish, "receiverOnFinish");
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    __name(receiverOnMessage, "receiverOnMessage");
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      websocket.pong(data, !websocket._isServer, NOOP);
      websocket.emit("ping", data);
    }
    __name(receiverOnPing, "receiverOnPing");
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    __name(receiverOnPong, "receiverOnPong");
    function resume(stream) {
      stream.resume();
    }
    __name(resume, "resume");
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket3.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    __name(socketOnClose, "socketOnClose");
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    __name(socketOnData, "socketOnData");
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket3.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    __name(socketOnEnd, "socketOnEnd");
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket3.CLOSING;
        this.destroy();
      }
    }
    __name(socketOnError, "socketOnError");
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    __name(parse, "parse");
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var https = require("https");
    var net = require("net");
    var tls = require("tls");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket3 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      constructor(options, callback) {
        super();
        options = __spreadValues({
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket3
        }, options);
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(options.port, options.host, options.backlog, callback);
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (req.headers.upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!key || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    __name(WebSocketServer2, "WebSocketServer");
    module2.exports = WebSocketServer2;
    function addListeners(server, map2) {
      for (const event of Object.keys(map2))
        server.on(event, map2[event]);
      return /* @__PURE__ */ __name(function removeListeners() {
        for (const event of Object.keys(map2)) {
          server.removeListener(event, map2[event]);
        }
      }, "removeListeners");
    }
    __name(addListeners, "addListeners");
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    __name(emitClose, "emitClose");
    function socketOnError() {
      this.destroy();
    }
    __name(socketOnError, "socketOnError");
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = __spreadValues({
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message)
      }, headers);
      socket.once("finish", socket.destroy);
      socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
    }
    __name(abortHandshake, "abortHandshake");
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
    __name(abortHandshakeOrEmitwsClientError, "abortHandshakeOrEmitwsClientError");
  }
});

// node_modules/nanotimer/lib/nanotimer.js
var require_nanotimer = __commonJS({
  "node_modules/nanotimer/lib/nanotimer.js"(exports, module2) {
    function NanoTimer2(log) {
      var version = process.version;
      var major = version.split(".")[0];
      major = major.split("v")[1];
      var minor = version.split(".")[1];
      if (major == 0 && minor < 10) {
        console.log("Error: Please update to the latest version of node! This library requires 0.10.x or later");
        process.exit(0);
      }
      this.intervalT1 = null;
      this.timeOutT1 = null;
      this.intervalCount = 1;
      this.deferredInterval = false;
      this.deferredTimeout = false;
      this.deferredTimeoutRef = null;
      this.deferredIntervalRef = null;
      this.timeoutCallbackRef = null;
      this.intervalCallbackRef = null;
      this.timeoutImmediateRef = null;
      this.intervalImmediateRef = null;
      this.intervalErrorChecked = false;
      this.intervalType = "";
      this.timeoutTriggered = false;
      if (log) {
        this.logging = true;
      }
    }
    __name(NanoTimer2, "NanoTimer");
    NanoTimer2.prototype.time = function(task, args, format, callback) {
      if (callback) {
        var t1 = process.hrtime();
        if (args) {
          args.push(function() {
            var time = process.hrtime(t1);
            if (format == "s") {
              callback(time[0] + time[1] / 1e9);
            } else if (format == "m") {
              callback(time[0] * 1e3 + time[1] / 1e6);
            } else if (format == "u") {
              callback(time[0] * 1e6 + time[1] / 1e3);
            } else if (format == "n") {
              callback(time[0] * 1e9 + time[1]);
            } else {
              callback(time);
            }
          });
          task.apply(null, args);
        } else {
          task(function() {
            var time = process.hrtime(t1);
            if (format == "s") {
              callback(time[0] + time[1] / 1e9);
            } else if (format == "m") {
              callback(time[0] * 1e3 + time[1] / 1e6);
            } else if (format == "u") {
              callback(time[0] * 1e6 + time[1] / 1e3);
            } else if (format == "n") {
              callback(time[0] * 1e9 + time[1]);
            } else {
              callback(time);
            }
          });
        }
      } else {
        var t1 = process.hrtime();
        if (args) {
          task.apply(null, args);
        } else {
          task();
        }
        var t2 = process.hrtime(t1);
        if (format == "s") {
          return t2[0] + t2[1] / 1e9;
        } else if (format == "m") {
          return t2[0] * 1e3 + t2[1] / 1e6;
        } else if (format == "u") {
          return t2[0] * 1e6 + t2[1] / 1e3;
        } else if (format == "n") {
          return t2[0] * 1e9 + t2[1];
        } else {
          return process.hrtime(t1);
        }
      }
    };
    NanoTimer2.prototype.setInterval = function(task, args, interval, callback) {
      if (!this.intervalErrorChecked) {
        if (!task) {
          console.log("A task function must be specified to setInterval");
          process.exit(1);
        } else {
          if (typeof task != "function") {
            console.log("Task argument to setInterval must be a function reference");
            process.exit(1);
          }
        }
        if (!interval) {
          console.log("An interval argument must be specified");
          process.exit(1);
        } else {
          if (typeof interval != "string") {
            console.log("Interval argument to setInterval must be a string specified as an integer followed by 's' for seconds, 'm' for milli, 'u' for micro, and 'n' for nanoseconds. Ex. 2u");
            process.exit(1);
          }
        }
        if (callback) {
          if (typeof callback != "function") {
            console.log("Callback argument to setInterval must be a function reference");
            process.exit(1);
          } else {
            this.intervalCallbackRef = callback;
          }
        }
        this.intervalType = interval[interval.length - 1];
        if (this.intervalType == "s") {
          this.intervalTime = interval.slice(0, interval.length - 1) * 1e9;
        } else if (this.intervalType == "m") {
          this.intervalTime = interval.slice(0, interval.length - 1) * 1e6;
        } else if (this.intervalType == "u") {
          this.intervalTime = interval.slice(0, interval.length - 1) * 1e3;
        } else if (this.intervalType == "n") {
          this.intervalTime = interval.slice(0, interval.length - 1);
        } else {
          console.log("Error with argument: " + interval + ': Incorrect interval format. Format is an integer followed by "s" for seconds, "m" for milli, "u" for micro, and "n" for nanoseconds. Ex. 2u');
          process.exit(1);
        }
        this.intervalErrorChecked = true;
      }
      var thisTimer = this;
      if (this.intervalTime > 0) {
        if (this.intervalT1 == null) {
          this.intervalT1 = process.hrtime();
        }
        if (this.intervalTime * this.intervalCount > 8e15) {
          this.intervalT1 = process.hrtime();
          this.intervalCount = 1;
        }
        this.difArray = process.hrtime(this.intervalT1);
        this.difTime = this.difArray[0] * 1e9 + this.difArray[1];
        if (this.difTime < this.intervalTime * this.intervalCount) {
          if (this.intervalTime > 25e6) {
            if (this.deferredInterval == false) {
              this.deferredInterval = true;
              var msDelay = (this.intervalTime - 25e6) / 1e6;
              this.deferredIntervalRef = setTimeout(function() {
                thisTimer.setInterval(task, args, interval, callback);
              }, msDelay);
            } else {
              this.deferredIntervalRef = null;
              this.intervalImmediateRef = setImmediate(function() {
                thisTimer.setInterval(task, args, interval, callback);
              });
            }
          } else {
            this.intervalImmediateRef = setImmediate(function() {
              thisTimer.setInterval(task, args, interval, callback);
            });
          }
        } else {
          this.intervalImmediateRef = null;
          if (this.logging) {
            console.log("nanotimer log: cycle time at - " + this.difTime);
          }
          if (args) {
            task.apply(null, args);
          } else {
            task();
          }
          if (this.intervalT1) {
            this.intervalCount++;
            this.deferredInterval = false;
            this.intervalImmediateRef = setImmediate(function() {
              thisTimer.setInterval(task, args, interval, callback);
            });
          }
        }
      } else {
        if (this.intervalT1 == null) {
          this.intervalT1 = process.hrtime();
        }
        if (args) {
          task.apply(null, args);
        } else {
          task();
        }
        if (this.intervalT1) {
          this.intervalImmediateRef = setImmediate(function() {
            thisTimer.setInterval(task, args, interval, callback);
          });
        }
      }
    };
    NanoTimer2.prototype.setTimeout = function(task, args, delay, callback) {
      if (!task) {
        console.log("A task function must be specified to setTimeout");
        process.exit(1);
      } else {
        if (typeof task != "function") {
          console.log("Task argument to setTimeout must be a function reference");
          process.exit(1);
        }
      }
      if (!delay) {
        console.log("A delay argument must be specified");
        process.exit(1);
      } else {
        if (typeof delay != "string") {
          console.log("Delay argument to setTimeout must be a string specified as an integer followed by 's' for seconds, 'm' for milli, 'u' for micro, and 'n' for nanoseconds. Ex. 2u");
          process.exit(1);
        }
      }
      if (callback) {
        if (typeof callback != "function") {
          console.log("Callback argument to setTimeout must be a function reference");
          process.exit(1);
        } else {
          this.timeoutCallbackRef = callback;
        }
      }
      var thisTimer = this;
      if (this.timeoutTriggered) {
        this.timeoutTriggered = false;
      }
      var delayType = delay[delay.length - 1];
      if (delayType == "s") {
        var delayTime = delay.slice(0, delay.length - 1) * 1e9;
      } else if (delayType == "m") {
        var delayTime = delay.slice(0, delay.length - 1) * 1e6;
      } else if (delayType == "u") {
        var delayTime = delay.slice(0, delay.length - 1) * 1e3;
      } else if (delayType == "n") {
        var delayTime = delay.slice(0, delay.length - 1);
      } else {
        console.log("Error with argument: " + delay + ': Incorrect delay format. Format is an integer followed by "s" for seconds, "m" for milli, "u" for micro, and "n" for nanoseconds. Ex. 2u');
        process.exit(1);
      }
      if (this.timeOutT1 == null) {
        this.timeOutT1 = process.hrtime();
      }
      var difArray = process.hrtime(this.timeOutT1);
      var difTime = difArray[0] * 1e9 + difArray[1];
      if (difTime < delayTime) {
        if (delayTime > 25e6) {
          if (this.deferredTimeout == false) {
            this.deferredTimeout = true;
            var msDelay = (delayTime - 25e6) / 1e6;
            this.deferredTimeoutRef = setTimeout(function() {
              thisTimer.setTimeout(task, args, delay, callback);
            }, msDelay);
          } else {
            this.deferredTimeoutRef = null;
            this.timeoutImmediateRef = setImmediate(function() {
              thisTimer.setTimeout(task, args, delay, callback);
            });
          }
        } else {
          this.timeoutImmediateRef = setImmediate(function() {
            thisTimer.setTimeout(task, args, delay, callback);
          });
        }
      } else {
        this.timeoutTriggered = true;
        this.timeoutImmediateRef = null;
        this.timeOutT1 = null;
        this.deferredTimeout = false;
        if (this.logging == true) {
          console.log("nanotimer log: actual wait - " + difTime);
        }
        if (args) {
          task.apply(null, args);
        } else {
          task();
        }
        if (callback) {
          var data = { "waitTime": difTime };
          callback(data);
        }
      }
    };
    NanoTimer2.prototype.clearInterval = function() {
      if (this.deferredIntervalRef) {
        clearTimeout(this.deferredIntervalRef);
        this.deferredInterval = false;
      }
      if (this.intervalImmediateRef) {
        clearImmediate(this.intervalImmediateRef);
      }
      this.intervalT1 = null;
      this.intervalCount = 1;
      this.intervalErrorChecked = false;
      if (this.intervalCallbackRef) {
        this.intervalCallbackRef();
      }
    };
    NanoTimer2.prototype.clearTimeout = function() {
      if (this.timeoutTriggered == false) {
        if (this.deferredTimeoutRef) {
          clearTimeout(this.deferredTimeoutRef);
          if (this.timeOutT1) {
            var difArray = process.hrtime(this.timeOutT1);
            var difTime = difArray[0] * 1e9 + difArray[1];
          }
          this.deferredTimeout = false;
        }
        if (this.timeoutImmediateRef) {
          clearImmediate(this.timeoutImmediateRef);
        }
        this.timeOutT1 = null;
        if (this.timeoutCallbackRef) {
          var data = { "waitTime": difTime };
          this.timeoutCallbackRef(data);
        }
      }
    };
    NanoTimer2.prototype.hasTimeout = function() {
      return this.timeOutT1 != null;
    };
    module2.exports = NanoTimer2;
  }
});

// kasocket/server/index.ts
var server_exports = {};
__export(server_exports, {
  Kaboom: () => Kaboom,
  Server: () => Server
});
module.exports = __toCommonJS(server_exports);

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// kasocket/server/kaboom/math.ts
function deg2rad(deg) {
  return deg * Math.PI / 180;
}
__name(deg2rad, "deg2rad");
function rad2deg(rad) {
  return rad * 180 / Math.PI;
}
__name(rad2deg, "rad2deg");
function clamp(val, min, max) {
  if (min > max) {
    return clamp(val, max, min);
  }
  return Math.min(Math.max(val, min), max);
}
__name(clamp, "clamp");
function lerp(a, b, t) {
  return a + (b - a) * t;
}
__name(lerp, "lerp");
function map(v, l1, h1, l2, h2) {
  return l2 + (v - l1) / (h1 - l1) * (h2 - l2);
}
__name(map, "map");
function mapc(v, l1, h1, l2, h2) {
  return clamp(map(v, l1, h1, l2, h2), l2, h2);
}
__name(mapc, "mapc");
var _Vec2 = class {
  constructor(x = 0, y = x) {
    this.x = 0;
    this.y = 0;
    this.x = x;
    this.y = y;
  }
  static fromAngle(deg) {
    const angle = deg2rad(deg);
    return new _Vec2(Math.cos(angle), Math.sin(angle));
  }
  clone() {
    return new _Vec2(this.x, this.y);
  }
  add(...args) {
    const p2 = vec2(...args);
    return new _Vec2(this.x + p2.x, this.y + p2.y);
  }
  sub(...args) {
    const p2 = vec2(...args);
    return new _Vec2(this.x - p2.x, this.y - p2.y);
  }
  scale(...args) {
    const s = vec2(...args);
    return new _Vec2(this.x * s.x, this.y * s.y);
  }
  dist(...args) {
    const p2 = vec2(...args);
    return Math.sqrt((this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y));
  }
  len() {
    return this.dist(new _Vec2(0, 0));
  }
  unit() {
    const len = this.len();
    return len === 0 ? new _Vec2(0) : this.scale(1 / len);
  }
  normal() {
    return new _Vec2(this.y, -this.x);
  }
  dot(p2) {
    return this.x * p2.x + this.y * p2.y;
  }
  angle(...args) {
    const p2 = vec2(...args);
    return rad2deg(Math.atan2(this.y - p2.y, this.x - p2.x));
  }
  lerp(p2, t) {
    return new _Vec2(lerp(this.x, p2.x, t), lerp(this.y, p2.y, t));
  }
  isZero() {
    return this.x === 0 && this.y === 0;
  }
  toFixed(n) {
    return new _Vec2(Number(this.x.toFixed(n)), Number(this.y.toFixed(n)));
  }
  eq(other) {
    return this.x === other.x && this.y === other.y;
  }
  toString() {
    return `vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
};
var Vec2 = _Vec2;
__name(Vec2, "Vec2");
Vec2.LEFT = new _Vec2(-1, 0);
Vec2.RIGHT = new _Vec2(1, 0);
Vec2.UP = new _Vec2(0, -1);
Vec2.DOWN = new _Vec2(0, 1);
function vec2(...args) {
  if (args.length === 1) {
    if (args[0] instanceof Vec2) {
      return vec2(args[0].x, args[0].y);
    } else if (Array.isArray(args[0]) && args[0].length === 2) {
      return vec2(...args[0]);
    }
  }
  return new Vec2(...args);
}
__name(vec2, "vec2");
var Vec3 = class {
  constructor(x, y, z) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  xy() {
    return vec2(this.x, this.y);
  }
};
__name(Vec3, "Vec3");
var vec3 = /* @__PURE__ */ __name((x, y, z) => new Vec3(x, y, z), "vec3");
var _Color = class {
  constructor(r, g2, b) {
    this.r = 255;
    this.g = 255;
    this.b = 255;
    this.r = clamp(r, 0, 255);
    this.g = clamp(g2, 0, 255);
    this.b = clamp(b, 0, 255);
  }
  static fromArray(arr) {
    return new _Color(arr[0], arr[1], arr[2]);
  }
  clone() {
    return new _Color(this.r, this.g, this.b);
  }
  lighten(a) {
    return new _Color(this.r + a, this.g + a, this.b + a);
  }
  darken(a) {
    return this.lighten(-a);
  }
  invert() {
    return new _Color(255 - this.r, 255 - this.g, 255 - this.b);
  }
  mult(other) {
    return new _Color(this.r * other.r / 255, this.g * other.g / 255, this.b * other.b / 255);
  }
  eq(other) {
    return this.r === other.r && this.g === other.g && this.b === other.b;
  }
  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
  static fromHSL(h, s, l) {
    if (s == 0) {
      return rgb(255 * l, 255 * l, 255 * l);
    }
    const hue2rgb = /* @__PURE__ */ __name((p2, q2, t) => {
      if (t < 0)
        t += 1;
      if (t > 1)
        t -= 1;
      if (t < 1 / 6)
        return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2)
        return q2;
      if (t < 2 / 3)
        return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    }, "hue2rgb");
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g2 = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return new _Color(Math.round(r * 255), Math.round(g2 * 255), Math.round(b * 255));
  }
};
var Color = _Color;
__name(Color, "Color");
Color.RED = rgb(255, 0, 0);
Color.GREEN = rgb(0, 255, 0);
Color.BLUE = rgb(0, 0, 255);
Color.YELLOW = rgb(255, 255, 0);
Color.MAGENTA = rgb(255, 0, 255);
Color.CYAN = rgb(0, 255, 255);
Color.WHITE = rgb(255, 255, 255);
Color.BLACK = rgb(0, 0, 0);
function rgb(...args) {
  if (args.length === 0) {
    return new Color(255, 255, 255);
  } else if (args.length === 1) {
    if (args[0] instanceof Color) {
      return args[0].clone();
    } else if (Array.isArray(args[0]) && args[0].length === 3) {
      return Color.fromArray(args[0]);
    }
  }
  return new Color(...args);
}
__name(rgb, "rgb");
var hsl2rgb = /* @__PURE__ */ __name((h, s, l) => Color.fromHSL(h, s, l), "hsl2rgb");
var Quad = class {
  constructor(x, y, w, h) {
    this.x = 0;
    this.y = 0;
    this.w = 1;
    this.h = 1;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  scale(other) {
    return new Quad(this.x + this.w * other.x, this.y + this.h * other.y, this.w * other.w, this.h * other.h);
  }
  clone() {
    return new Quad(this.x, this.y, this.w, this.h);
  }
  eq(other) {
    return this.x === other.x && this.y === other.y && this.w === other.w && this.h === other.h;
  }
  toString() {
    return `quad(${this.x}, ${this.y}, ${this.w}, ${this.h})`;
  }
};
__name(Quad, "Quad");
function quad(x, y, w, h) {
  return new Quad(x, y, w, h);
}
__name(quad, "quad");
var Mat4 = class {
  constructor(m) {
    this.m = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
    if (m) {
      this.m = m;
    }
  }
  static translate(p) {
    return new Mat4([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      p.x,
      p.y,
      0,
      1
    ]);
  }
  static scale(s) {
    return new Mat4([
      s.x,
      0,
      0,
      0,
      0,
      s.y,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]);
  }
  static rotateX(a) {
    a = deg2rad(-a);
    return new Mat4([
      1,
      0,
      0,
      0,
      0,
      Math.cos(a),
      -Math.sin(a),
      0,
      0,
      Math.sin(a),
      Math.cos(a),
      0,
      0,
      0,
      0,
      1
    ]);
  }
  static rotateY(a) {
    a = deg2rad(-a);
    return new Mat4([
      Math.cos(a),
      0,
      Math.sin(a),
      0,
      0,
      1,
      0,
      0,
      -Math.sin(a),
      0,
      Math.cos(a),
      0,
      0,
      0,
      0,
      1
    ]);
  }
  static rotateZ(a) {
    a = deg2rad(-a);
    return new Mat4([
      Math.cos(a),
      -Math.sin(a),
      0,
      0,
      Math.sin(a),
      Math.cos(a),
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]);
  }
  translate(p) {
    return this.mult(Mat4.translate(p));
  }
  scale(s) {
    return this.mult(Mat4.scale(s));
  }
  rotateX(a) {
    return this.mult(Mat4.rotateX(a));
  }
  rotateY(a) {
    return this.mult(Mat4.rotateY(a));
  }
  rotateZ(a) {
    return this.mult(Mat4.rotateZ(a));
  }
  mult(other) {
    const out = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] = this.m[0 * 4 + j] * other.m[i * 4 + 0] + this.m[1 * 4 + j] * other.m[i * 4 + 1] + this.m[2 * 4 + j] * other.m[i * 4 + 2] + this.m[3 * 4 + j] * other.m[i * 4 + 3];
      }
    }
    return new Mat4(out);
  }
  multVec4(p) {
    return {
      x: p.x * this.m[0] + p.y * this.m[4] + p.z * this.m[8] + p.w * this.m[12],
      y: p.x * this.m[1] + p.y * this.m[5] + p.z * this.m[9] + p.w * this.m[13],
      z: p.x * this.m[2] + p.y * this.m[6] + p.z * this.m[10] + p.w * this.m[14],
      w: p.x * this.m[3] + p.y * this.m[7] + p.z * this.m[11] + p.w * this.m[15]
    };
  }
  multVec3(p) {
    const p4 = this.multVec4({
      x: p.x,
      y: p.y,
      z: p.z,
      w: 1
    });
    return vec3(p4.x, p4.y, p4.z);
  }
  multVec2(p) {
    return vec2(p.x * this.m[0] + p.y * this.m[4] + 0 * this.m[8] + 1 * this.m[12], p.x * this.m[1] + p.y * this.m[5] + 0 * this.m[9] + 1 * this.m[13]);
  }
  invert() {
    const out = [];
    const f00 = this.m[10] * this.m[15] - this.m[14] * this.m[11];
    const f01 = this.m[9] * this.m[15] - this.m[13] * this.m[11];
    const f02 = this.m[9] * this.m[14] - this.m[13] * this.m[10];
    const f03 = this.m[8] * this.m[15] - this.m[12] * this.m[11];
    const f04 = this.m[8] * this.m[14] - this.m[12] * this.m[10];
    const f05 = this.m[8] * this.m[13] - this.m[12] * this.m[9];
    const f06 = this.m[6] * this.m[15] - this.m[14] * this.m[7];
    const f07 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
    const f08 = this.m[5] * this.m[14] - this.m[13] * this.m[6];
    const f09 = this.m[4] * this.m[15] - this.m[12] * this.m[7];
    const f10 = this.m[4] * this.m[14] - this.m[12] * this.m[6];
    const f11 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
    const f12 = this.m[4] * this.m[13] - this.m[12] * this.m[5];
    const f13 = this.m[6] * this.m[11] - this.m[10] * this.m[7];
    const f14 = this.m[5] * this.m[11] - this.m[9] * this.m[7];
    const f15 = this.m[5] * this.m[10] - this.m[9] * this.m[6];
    const f16 = this.m[4] * this.m[11] - this.m[8] * this.m[7];
    const f17 = this.m[4] * this.m[10] - this.m[8] * this.m[6];
    const f18 = this.m[4] * this.m[9] - this.m[8] * this.m[5];
    out[0] = this.m[5] * f00 - this.m[6] * f01 + this.m[7] * f02;
    out[4] = -(this.m[4] * f00 - this.m[6] * f03 + this.m[7] * f04);
    out[8] = this.m[4] * f01 - this.m[5] * f03 + this.m[7] * f05;
    out[12] = -(this.m[4] * f02 - this.m[5] * f04 + this.m[6] * f05);
    out[1] = -(this.m[1] * f00 - this.m[2] * f01 + this.m[3] * f02);
    out[5] = this.m[0] * f00 - this.m[2] * f03 + this.m[3] * f04;
    out[9] = -(this.m[0] * f01 - this.m[1] * f03 + this.m[3] * f05);
    out[13] = this.m[0] * f02 - this.m[1] * f04 + this.m[2] * f05;
    out[2] = this.m[1] * f06 - this.m[2] * f07 + this.m[3] * f08;
    out[6] = -(this.m[0] * f06 - this.m[2] * f09 + this.m[3] * f10);
    out[10] = this.m[0] * f11 - this.m[1] * f09 + this.m[3] * f12;
    out[14] = -(this.m[0] * f08 - this.m[1] * f10 + this.m[2] * f12);
    out[3] = -(this.m[1] * f13 - this.m[2] * f14 + this.m[3] * f15);
    out[7] = this.m[0] * f13 - this.m[2] * f16 + this.m[3] * f17;
    out[11] = -(this.m[0] * f14 - this.m[1] * f16 + this.m[3] * f18);
    out[15] = this.m[0] * f15 - this.m[1] * f17 + this.m[2] * f18;
    const det = this.m[0] * out[0] + this.m[1] * out[4] + this.m[2] * out[8] + this.m[3] * out[12];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] *= 1 / det;
      }
    }
    return new Mat4(out);
  }
  clone() {
    return new Mat4(this.m);
  }
  toString() {
    return this.m.toString();
  }
};
__name(Mat4, "Mat4");
function wave(lo, hi, t, f = Math.sin) {
  return lo + (f(t) + 1) / 2 * (hi - lo);
}
__name(wave, "wave");
var A = 1103515245;
var C = 12345;
var M = 2147483648;
var RNG = class {
  constructor(seed) {
    this.seed = seed;
  }
  gen() {
    this.seed = (A * this.seed + C) % M;
    return this.seed / M;
  }
  genNumber(a, b) {
    return a + this.gen() * (b - a);
  }
  genVec2(a, b) {
    return new Vec2(this.genNumber(a.x, b.x), this.genNumber(a.y, b.y));
  }
  genColor(a, b) {
    return new Color(this.genNumber(a.r, b.r), this.genNumber(a.g, b.g), this.genNumber(a.b, b.b));
  }
  genAny(...args) {
    if (args.length === 0) {
      return this.gen();
    } else if (args.length === 1) {
      if (typeof args[0] === "number") {
        return this.genNumber(0, args[0]);
      } else if (args[0] instanceof Vec2) {
        return this.genVec2(vec2(0, 0), args[0]);
      } else if (args[0] instanceof Color) {
        return this.genColor(rgb(0, 0, 0), args[0]);
      }
    } else if (args.length === 2) {
      if (typeof args[0] === "number" && typeof args[1] === "number") {
        return this.genNumber(args[0], args[1]);
      } else if (args[0] instanceof Vec2 && args[1] instanceof Vec2) {
        return this.genVec2(args[0], args[1]);
      } else if (args[0] instanceof Color && args[1] instanceof Color) {
        return this.genColor(args[0], args[1]);
      }
    }
  }
};
__name(RNG, "RNG");
var defRNG = new RNG(Date.now());
function randSeed(seed) {
  if (seed != null) {
    defRNG.seed = seed;
  }
  return defRNG.seed;
}
__name(randSeed, "randSeed");
function rand(...args) {
  return defRNG.genAny(...args);
}
__name(rand, "rand");
function randi(...args) {
  return Math.floor(rand(...args));
}
__name(randi, "randi");
function chance(p) {
  return rand() <= p;
}
__name(chance, "chance");
function choose(list) {
  return list[randi(list.length)];
}
__name(choose, "choose");
function testRectRect2(r1, r2) {
  return r1.pos.x + r1.width >= r2.pos.x && r1.pos.x <= r2.pos.x + r2.width && r1.pos.y + r1.height >= r2.pos.y && r1.pos.y <= r2.pos.y + r2.height;
}
__name(testRectRect2, "testRectRect2");
function testRectRect(r1, r2) {
  return r1.pos.x + r1.width > r2.pos.x && r1.pos.x < r2.pos.x + r2.width && r1.pos.y + r1.height > r2.pos.y && r1.pos.y < r2.pos.y + r2.height;
}
__name(testRectRect, "testRectRect");
function testLineLineT(l1, l2) {
  if (l1.p1.x === l1.p2.x && l1.p1.y === l1.p2.y || l2.p1.x === l2.p2.x && l2.p1.y === l2.p2.y) {
    return null;
  }
  const denom = (l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x) - (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y);
  if (denom === 0) {
    return null;
  }
  const ua = ((l2.p2.x - l2.p1.x) * (l1.p1.y - l2.p1.y) - (l2.p2.y - l2.p1.y) * (l1.p1.x - l2.p1.x)) / denom;
  const ub = ((l1.p2.x - l1.p1.x) * (l1.p1.y - l2.p1.y) - (l1.p2.y - l1.p1.y) * (l1.p1.x - l2.p1.x)) / denom;
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }
  return ua;
}
__name(testLineLineT, "testLineLineT");
function testLineLine(l1, l2) {
  const t = testLineLineT(l1, l2);
  if (!t)
    return null;
  return vec2(l1.p1.x + t * (l1.p2.x - l1.p1.x), l1.p1.y + t * (l1.p2.y - l1.p1.y));
}
__name(testLineLine, "testLineLine");
function testRectLine(r, l) {
  if (testRectPoint(r, Point.fromVec2(l.p1)) || testRectPoint(r, Point.fromVec2(l.p2))) {
    return true;
  }
  const pts = r.points();
  return !!testLineLine(l, new Line(pts[0], pts[1])) || !!testLineLine(l, new Line(pts[1], pts[2])) || !!testLineLine(l, new Line(pts[2], pts[3])) || !!testLineLine(l, new Line(pts[3], pts[0]));
}
__name(testRectLine, "testRectLine");
function testRectPoint(r, pt) {
  return pt.x > r.pos.x && pt.x < r.pos.x + r.width && pt.y > r.pos.y && pt.y < r.pos.y + r.height;
}
__name(testRectPoint, "testRectPoint");
function testPolygonPoint(poly, pt) {
  let c = false;
  const p = poly.pts;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if (p[i].y > pt.y != p[j].y > pt.y && pt.x < (p[j].x - p[i].x) * (pt.y - p[i].y) / (p[j].y - p[i].y) + p[i].x) {
      c = !c;
    }
  }
  return c;
}
__name(testPolygonPoint, "testPolygonPoint");
var Line = class {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }
  transform(m) {
    return new Line(m.multVec2(this.p1), m.multVec2(this.p2));
  }
  bbox() {
    return Rect.fromPoints(this.p1, this.p2);
  }
};
__name(Line, "Line");
var Rect = class {
  constructor(pos2, width, height) {
    this.pos = pos2;
    this.width = width;
    this.height = height;
  }
  static fromPoints(p1, p2) {
    return new Rect(p1.clone(), p2.x - p1.x, p2.y - p1.y);
  }
  center() {
    return new Vec2(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
  }
  points() {
    return [
      this.pos,
      this.pos.add(this.width, 0),
      this.pos.add(this.width, this.height),
      this.pos.add(0, this.height)
    ];
  }
  transform(m) {
    return new Polygon(this.points().map((pt) => m.multVec2(pt)));
  }
  bbox() {
    return new Rect(this.pos.clone(), this.width, this.height);
  }
};
__name(Rect, "Rect");
var Circle = class {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }
  transform(tr) {
    return new Ellipse(this.center, this.radius, this.radius).transform(tr);
  }
  bbox() {
    return Rect.fromPoints(this.center.sub(vec2(this.radius)), this.center.add(vec2(this.radius)));
  }
};
__name(Circle, "Circle");
var Ellipse = class {
  constructor(center, rx, ry) {
    this.center = center;
    this.radiusX = rx;
    this.radiusY = ry;
  }
  transform(tr) {
    return new Ellipse(tr.multVec2(this.center), tr.m[0] * this.radiusX, tr.m[5] * this.radiusY);
  }
  bbox() {
    return Rect.fromPoints(this.center.sub(vec2(this.radiusX, this.radiusY)), this.center.add(vec2(this.radiusX, this.radiusY)));
  }
};
__name(Ellipse, "Ellipse");
var Polygon = class {
  constructor(pts) {
    if (pts.length < 3) {
      throw new Error("Polygons should have at least 3 vertices");
    }
    this.pts = pts;
  }
  transform(m) {
    return new Polygon(this.pts.map((pt) => m.multVec2(pt)));
  }
  bbox() {
    const p1 = vec2(Number.MAX_VALUE);
    const p2 = vec2(-Number.MAX_VALUE);
    for (const pt of this.pts) {
      p1.x = Math.min(p1.x, pt.x);
      p2.x = Math.max(p2.x, pt.x);
      p1.y = Math.min(p1.y, pt.y);
      p2.y = Math.max(p2.y, pt.y);
    }
    return Rect.fromPoints(p1, p2);
  }
};
__name(Polygon, "Polygon");
var Point = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static fromVec2(p) {
    return new Point(p.x, p.y);
  }
  toVec2() {
    return new Vec2(this.x, this.y);
  }
  transform(tr) {
    return Point.fromVec2(tr.multVec2(this.toVec2()));
  }
  bbox() {
    return new Rect(this.toVec2(), 0, 0);
  }
};
__name(Point, "Point");
function sat(p1, p2) {
  let overlap = Number.MAX_VALUE;
  let displacement = vec2(0);
  for (const poly of [p1, p2]) {
    for (let i = 0; i < poly.pts.length; i++) {
      const a = poly.pts[i];
      const b = poly.pts[(i + 1) % poly.pts.length];
      const axisProj = b.sub(a).normal().unit();
      let min1 = Number.MAX_VALUE;
      let max1 = -Number.MAX_VALUE;
      for (let j = 0; j < p1.pts.length; j++) {
        const q = p1.pts[j].dot(axisProj);
        min1 = Math.min(min1, q);
        max1 = Math.max(max1, q);
      }
      let min2 = Number.MAX_VALUE;
      let max2 = -Number.MAX_VALUE;
      for (let j = 0; j < p2.pts.length; j++) {
        const q = p2.pts[j].dot(axisProj);
        min2 = Math.min(min2, q);
        max2 = Math.max(max2, q);
      }
      const o = Math.min(max1, max2) - Math.max(min1, min2);
      if (o < 0) {
        return null;
      }
      if (o < Math.abs(overlap)) {
        const o1 = max2 - min1;
        const o2 = min2 - max1;
        overlap = Math.abs(o1) < Math.abs(o2) ? o1 : o2;
        displacement = axisProj.scale(overlap);
      }
    }
  }
  return displacement;
}
__name(sat, "sat");

// kasocket/server/kaboom/index.ts
var KaboomObject = class {
  constructor(name, args, properties) {
    this.__functionName = name;
    this.__arguments = args;
    for (const prop in properties) {
      if (typeof properties[prop] == "function") {
        properties[prop] = properties[prop].bind(this);
      }
    }
    this.__properties = properties;
    return new Proxy(this, {
      get(object, property) {
        if (property == "__functionName" || property == "__arguments" || property == "__properties" || property == "__proxyBind" || property == "__method") {
          return object[property];
        }
        return object.__properties[property];
      }
    });
  }
  __proxyBind() {
    for (const prop in this.__properties) {
      if (typeof this.__properties[prop] != "function")
        continue;
      this.__properties[prop] = this.__properties[prop].bind(this);
    }
  }
};
__name(KaboomObject, "KaboomObject");
var add = /* @__PURE__ */ __name((comps) => {
  const props = {
    destroy() {
      this.__method = { name: "destroy", args: [] };
    }
  };
  for (const comp of comps) {
    for (const prop in comp.__properties) {
      props[prop] = comp.__properties[prop];
    }
  }
  return new KaboomObject("add", [comps], props);
}, "add");
var rect = /* @__PURE__ */ __name((width, length) => new KaboomObject("rect", [width, length], { width, length }), "rect");
var circle = /* @__PURE__ */ __name((radius) => new KaboomObject("circle", [radius], { radius }), "circle");
var pos = /* @__PURE__ */ __name((x, y) => new KaboomObject("pos", [x, y], { pos: { x, y } }), "pos");
var rotate = /* @__PURE__ */ __name((angle) => new KaboomObject("rotate", [angle], { angle }), "rotate");
var scale = /* @__PURE__ */ __name((x, y) => new KaboomObject("scale", [x, y], { scale: { x, y } }), "scale");
var color = /* @__PURE__ */ __name((...args) => {
  const prototype = args.length == 1 && args[0] instanceof Color ? args[0] : rgb(...args);
  const kobj = new KaboomObject("rgb", [prototype.r, prototype.g, prototype.b], prototype);
  return new KaboomObject("color", [kobj], { color: kobj });
}, "color");
var opacity = /* @__PURE__ */ __name((opacity2) => new KaboomObject("opacity", [opacity2], { opacity: opacity2 }), "opacity");
var g = global;
function Kaboom({
  global: global2 = true
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
    testPolygonPoint
  };
  if (global2) {
    for (const v in obj) {
      g[v] = obj[v];
    }
  }
  return obj;
}
__name(Kaboom, "Kaboom");

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

// kasocket/operation.ts
var MutateClient = /* @__PURE__ */ __name((mutation) => __spreadValues({
  operation: "mut"
}, mutation), "MutateClient");
var CreateClient = /* @__PURE__ */ __name((creation) => __spreadValues({
  operation: "cre"
}, creation), "CreateClient");
var Initialize = /* @__PURE__ */ __name((init) => __spreadValues({
  operation: "init"
}, init), "Initialize");

// kasocket/server/clientInterface.ts
function Classify(value, referenceMap) {
  if (typeof value != "object" || value == null) {
    return { value, type: "value" };
  }
  const id = referenceMap.get(value);
  if (id !== void 0)
    return { id, type: "reference" };
  const valueID = referenceMap.size;
  referenceMap.set(value, valueID);
  if (value instanceof KaboomObject) {
    return {
      name: value.__functionName,
      args: Classify(value.__arguments, referenceMap),
      type: "kaboom",
      id: valueID
    };
  }
  if (Array.isArray(value)) {
    return {
      values: value.map((x) => Classify(x, referenceMap)),
      type: "array",
      id: valueID
    };
  }
  const ret = {
    properties: {},
    type: "object",
    id: valueID
  };
  for (const prop in value) {
    ret.properties[prop] = Classify(value[prop], referenceMap);
  }
  return ret;
}
__name(Classify, "Classify");

// kasocket/server/index.ts
var import_nanotimer = __toESM(require_nanotimer());
var ClientObject = class {
  constructor(ws, id) {
    this.public = {};
    this.private = {};
    this.referenceMap = /* @__PURE__ */ new Map();
    this.ws = ws;
    this.id = id;
  }
  sendMessage(name, data) {
    const message = Message.Create(name, data);
    this.ws.send(message, (err) => {
      if (err)
        throw err;
    });
  }
};
__name(ClientObject, "ClientObject");
var Server = class {
  constructor(server, {
    path = "/multiplayer",
    uuidMax = 4294967295,
    tps = 20
  } = {}) {
    this.clients = /* @__PURE__ */ new Map();
    this.events = /* @__PURE__ */ new Map();
    this.clientUpdates = /* @__PURE__ */ new Map();
    this.lastFrame = Date.now();
    this.deltaTime = 0;
    this.socket = new import_websocket_server.default({ server, path, perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024
    } });
    this.socket.on("connection", (ws) => {
      let id = "";
      while (!id || this.clients.has(id))
        id = Math.floor(Math.random() * uuidMax).toString(16);
      const client = new ClientObject(ws, id);
      this.applyMutationProxy(client);
      this.clients.set(id, client);
      const parsedClients = {};
      for (const [clientID, clientObj] of this.clients) {
        parsedClients[clientID] = Classify(clientObj.public, client.referenceMap);
      }
      this.addOperation(Initialize({
        time: Date.now(),
        id,
        clients: parsedClients,
        clientData: {
          public: Classify(client.public, client.referenceMap),
          private: Classify(client.private, client.referenceMap)
        }
      }), {
        clusivity: "include",
        users: /* @__PURE__ */ new Set([id])
      });
      this.addOperation(CreateClient({
        time: Date.now(),
        id,
        client: Classify(client.public, client.referenceMap)
      }), {
        clusivity: "exclude",
        users: /* @__PURE__ */ new Set([id])
      });
      if (this.connectionEvent) {
        this.connectionEvent(client);
      }
      ws.on("message", (msgStr) => {
        const message = Message.Parse(msgStr);
        if (Date.now() - message.time > 3e3)
          return;
        if (message.name == "_") {
          for (const operation of message.data.operations) {
            this.handleOperation(operation, id, Date.now());
          }
        }
        const eventList = this.events.get(message.name);
        if (!eventList)
          return;
        for (const event of eventList) {
          event(message.data, this.clients.get(id));
        }
      });
    });
    new import_nanotimer.default().setInterval(this.update.bind(this), [], Math.round(1e3 / tps) + "m");
  }
  onConnect(callback) {
    this.connectionEvent = callback;
  }
  onUpdate(callback) {
    this.updateEvent = callback;
  }
  on(name, callback) {
    const eventList = this.events.get(name);
    if (!eventList) {
      this.events.set(name, [callback]);
    } else {
      eventList.push(callback);
    }
  }
  sendMessage(clientID, name, data) {
    const client = this.clients.get(clientID);
    if (!client)
      throw new ReferenceError(`Client '${clientID}' does not exist!`);
    const message = Message.Create(name, data);
    client.ws.send(message, (err) => {
      if (err)
        throw err;
    });
  }
  broadcast(name, data) {
    if (name == "_") {
      throw new Error(`Websocket messages named '_' are reserved for native Kasocket operations`);
    }
    const message = Message.Create(name, data);
    for (const client of this.clients.values()) {
      client.ws.send(message);
    }
  }
  handleOperation(data, senderID, time) {
    if (data.operation == "mut_cli") {
      const client = this.clients.get(senderID);
      if (!client)
        throw new ReferenceError(`Client ${senderID} does not exist`);
      let obj = client[data.instance];
      for (const prop of data.path) {
        obj = obj[prop];
        if (obj === void 0)
          return;
      }
      if (data.instruction == "set")
        obj[data.property] = data.value;
      if (data.instruction == "delete")
        delete obj[data.property];
      if (data.instance != "public")
        return;
      return this.addOperation(MutateClient({
        time,
        id: senderID,
        instruction: data.instruction,
        instance: "public",
        path: data.path,
        property: data.property,
        value: Classify(data.value, client.referenceMap)
      }), {
        clusivity: "exclude",
        users: /* @__PURE__ */ new Set([senderID])
      });
    }
    throw new ReferenceError(`'${data.operation}' is not a valid Kasocket server operation`);
  }
  addOperation(operation, sendTo) {
    for (const [id, _] of this.clients) {
      if (sendTo) {
        const inUsers = sendTo.users.has(id);
        if (sendTo.clusivity == "include" && !inUsers)
          continue;
        if (sendTo.clusivity == "exclude" && inUsers)
          continue;
      }
      const updateArr = this.clientUpdates.get(id);
      if (!updateArr) {
        this.clientUpdates.set(id, [operation]);
        continue;
      }
      for (let i = 0; i < updateArr.length; i++) {
        const op = updateArr[i];
        if (op.id != operation.id)
          continue;
        if (op.operation != operation.operation)
          continue;
        if (op.operation == "mut") {
          const nop = operation;
          if (op.instruction != nop.instruction)
            continue;
          if (op.path.length != nop.path.length)
            continue;
          if (op.property != nop.property)
            continue;
          if (op.path.some((v, i2) => nop.path[i2] != v))
            continue;
        } else if (op.operation == "cre") {
          const nop = operation;
          if (op.client != nop.client)
            continue;
        }
        updateArr.splice(i, 1);
      }
      updateArr.push(operation);
    }
  }
  update() {
    return new Promise((res) => {
      this.deltaTime = (Date.now() - this.lastFrame) / 1e3;
      this.lastFrame = Date.now();
      this.updateEvent();
      for (const [id, client] of this.clients) {
        let updateArr = this.clientUpdates.get(id);
        client.ws.send(Message.BundleOperations(this.deltaTime, updateArr || []));
      }
      this.clientUpdates = /* @__PURE__ */ new Map();
      res(true);
    });
  }
  applyMutationProxy(client) {
    const t = this;
    function recurseProxy(obj, instance, path) {
      if (obj instanceof KaboomObject) {
        if ("__isProxy" in obj.__properties) {
          obj.__properties.__changePath = path;
        } else
          obj.__properties = recurseProxy(obj.__properties, instance, path);
      } else {
        for (const prop in obj) {
          if (typeof obj[prop] != "object")
            continue;
          if ("__isProxy" in obj[prop]) {
            obj[prop].__changePath = [...path, prop];
            continue;
          }
          obj[prop] = recurseProxy(obj[prop], instance, [...path, prop]);
        }
      }
      const proxy = new Proxy(obj, {
        has(object, property) {
          if (property === "__isProxy")
            return true;
          return property in object;
        },
        get(object, property) {
          if (object instanceof KaboomObject) {
            if (property == "__functionName" || property == "__arguments" || property == "__properties" || property == "__proxyBind" || property == "__method") {
              return object[property];
            }
            return object.__properties[property];
          }
          return object[property];
        },
        set(object, property, value) {
          if (property == "__changePath") {
            if (path.length == value.length && path.every((v2, i) => value[i] === v2)) {
              return true;
            }
            const v = object instanceof KaboomObject ? object.__properties : object;
            path = value;
            for (const prop in v) {
              if (typeof v[prop] != "object")
                continue;
              v[prop].__changePath = [...path, prop];
            }
            return true;
          }
          if (!(object instanceof KaboomObject) || property != "__method") {
            if (object[property] === value)
              return true;
            if (typeof value == "function") {
              object[property] = value;
              return true;
            }
            if (typeof value == "object") {
              if ("__isProxy" in value) {
                value.__changePath = [...path, property];
              } else
                value = recurseProxy(value, instance, [...path, property]);
            }
            object[property] = value;
            value = Classify(value, client.referenceMap);
          }
          t.addOperation(MutateClient({
            id: client.id,
            path,
            instruction: "set",
            instance,
            property,
            value,
            time: Date.now()
          }), instance == "private" ? {
            clusivity: "include",
            users: /* @__PURE__ */ new Set([client.id])
          } : void 0);
          return true;
        },
        deleteProperty(object, property) {
          if (!(property in object))
            return true;
          delete object[property];
          t.addOperation(MutateClient({
            id: client.id,
            path,
            instruction: "delete",
            instance,
            property,
            time: Date.now()
          }), instance == "private" ? {
            clusivity: "include",
            users: /* @__PURE__ */ new Set([client.id])
          } : void 0);
          return true;
        }
      });
      if (proxy instanceof KaboomObject)
        proxy.__proxyBind();
      return proxy;
    }
    __name(recurseProxy, "recurseProxy");
    client.public = recurseProxy(client.public, "public", []);
    client.private = recurseProxy(client.private, "private", []);
  }
};
__name(Server, "Server");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Kaboom,
  Server
});
