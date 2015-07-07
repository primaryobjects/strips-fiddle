/* HTML5 Web Worker */
StripsClientWorker = {
    run: function(domain, problem, alg) {
        // Clear output panel.
        postMessage("<p style='color: #a0a0a0;'>Initializing, this may take a couple of seconds or minutes, depending upon the domain. Please wait ..</p>");

        // Setup STRIPS.
        StripsManager.verbose = true;
        StripsManager.output = function(text) { postMessage(text); }

        try {
            // Load the domain and problem.
            StripsManager.load(domain, problem, function(domain, problem) {
                // Run the problem against the domain.
                var solutions = StripsManager.solve(domain, problem, alg == 'DFS');

                // Display each solution.
                for (var i in solutions) {
                    var solution = solutions[i];

                    postMessage('<p>&nbsp;</p>');
                    postMessage('<h4>Solution found in ' + solution.steps + ' steps!</h4>');
                    for (var i = 0; i < solution.path.length; i++) {
                        postMessage('<b>' + (i + 1) + '</b>. ' + solution.path[i]);
                    }        
                }
            }, true);
        }
        catch (excep) {
            postMessage(excep.message);
        }
    }
}

addEventListener('message', function (event) {
    StripsClientWorker.run(event.data.domain, event.data.problem, event.data.alg);
});
/* End HTML5 Web Worker */

/***
strips - ported via Browserify
***/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(require,module,exports){
/*
 * $Id: combinatorics.js,v 0.25 2013/03/11 15:42:14 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-combination
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-permutation
 *    http://en.wikipedia.org/wiki/Factorial_number_system
 */
(function(global) {
    'use strict';
    if (global.Combinatorics) return;
    var version = "0.4.0";
    /* combinatory arithmetics */
    var P = function(m, n) {
        var t, p = 1;
        if (m < n) {
            t = m;
            m = n;
            n = t;
        }
        while (n--) p *= m--;
        return p;
    };
    var C = function(m, n) {
        return P(m, n) / P(n, n);
    };
    var factorial = function(n) {
        return P(n, n);
    };
    var factoradic = function(n, d) {
        var f = 1;
        if (!d) {
            for (d = 1; f < n; f *= ++d);
            if (f > n) f /= d--;
        } else {
            f = factorial(d);
        }
        var result = [0];
        for (; d; f /= d--) {
            result[d] = Math.floor(n / f);
            n %= f;
        }
        return result;
    };
    /* common methods */
    var addProperties = function(dst, src) {
        Object.keys(src).forEach(function(p) {
            Object.defineProperty(dst, p, {
                value: src[p]
            });
        });
    };
    var hideProperty = function(o, p) {
        Object.defineProperty(o, p, {
            writable: true
        });
    };
    var toArray = function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) result.push(f ? f(e) : e);
        this.init();
        return result;
    };
    var common = {
        toArray: toArray,
        map: toArray,
        forEach: function(f) {
            var e;
            this.init();
            while (e = this.next()) f(e);
            this.init();
        },
        filter: function(f) {
            var e, result = [];
            this.init();
            while (e = this.next()) if (f(e)) result.push(e);
            this.init();
            return result;
        }

    };
    /* power set */
    var power = function(ary, fun) {
        if (ary.length > 32) throw new RangeError;
        var size = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var i = 0,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                return result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* combination */
    var nextIndex = function(n) {
        var smallest = n & -n,
            ripple = n + smallest,
            new_smallest = ripple & -ripple,
            ones = ((new_smallest / smallest) >> 1) - 1;
        return ripple | ones;
    };
    var combination = function(ary, nelem, fun) {
        //if (ary.length > 32) throw new RangeError;
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = (1 << nelem) - 1,
            size = C(ary.length, nelem),
            maxIndex = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first;
            },
            next: function() {
                if (this.index >= maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                this.index = nextIndex(this.index);
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* permutation */
    var _permutation = function(ary) {
        var that = ary.slice(),
            size = factorial(that.length);
        that.index = 0;
        that.next = function() {
            if (this.index >= size) return;
            var copy = this.slice(),
                digits = factoradic(this.index, this.length),
                result = [],
                i = this.length - 1;
            for (; i >= 0; --i) result.push(copy.splice(digits[i], 1)[0]);
            this.index++;
            return result;
        };
        return that;
    };
    // which is really a permutation of combination
    var permutation = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var size = P(ary.length, nelem),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.cmb = combination(ary, nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) return;
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    var PC = function(m) {
        var total = 0;
        for (var n = 1; n <= m; n++) {
            var p = P(m,n);
            total += p;
        };
        return total;
    };
    // which is really a permutation of combination
    var permutationCombination = function(ary, fun) {
        // if (!nelem) nelem = ary.length;
        // if (nelem < 1) throw new RangeError;
        // if (nelem > ary.length) throw new RangeError;
        var size = PC(ary.length),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        hideProperty(that, 'nelem');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.nelem = 1;
                // console.log("Starting nelem: " + this.nelem);
                this.cmb = combination(ary, this.nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) {
                        this.nelem++;
                        // console.log("increment nelem: " + this.nelem + " vs " + ary.length);
                        if (this.nelem > ary.length) return;
                        this.cmb = combination(ary, this.nelem);
                        cmb = this.cmb.next();
                        if (!cmb) return;
                    }
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* Cartesian Product */
    var arraySlice = Array.prototype.slice;
    var cartesianProduct = function() {
        if (!arguments.length) throw new RangeError;
        var args = arraySlice.call(arguments),
            size = args.reduce(function(p, a) {
                return p * a.length;
            }, 1),
            sizeOf = function() {
                return size;
            },
            dim = args.length,
            that = Object.create(args, {
                length: {
                    get: sizeOf
                }
            });
        if (!size) throw new RangeError;
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            dim: dim,
            init: function() {
                this.index = 0;
            },
            get: function() {
                if (arguments.length !== this.length) return;
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var i = arguments[d];
                    if (i >= this[d].length) return;
                    result.push(this[d][i]);
                }
                return result;
            },
            nth: function(n) {
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var l = this[d].length;
                    var i = n % l;
                    result.push(this[d][i]);
                    n -= i;
                    n /= l;
                }
                return result;
            },
            next: function() {
                if (this.index >= size) return;
                var result = this.nth(this.index);
                this.index++;
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return that;
    };
    /* baseN */
    var baseN = function(ary, nelem, fun) {
                if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        var base = ary.length,
                size = Math.pow(base, nelem);
        if (size > Math.pow(2,32)) throw new RangeError;
        var sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var result = [];
                for (var i = 0; i < nelem; i++) {
                    var d = n % base;
                    result.push(ary[d])
                    n -= d; n /= base
                }
                return result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    /* export */
    addProperties(global.Combinatorics = Object.create(null), {
        C: C,
        P: P,
        factorial: factorial,
        factoradic: factoradic,
        cartesianProduct: cartesianProduct,
        combination: combination,
        permutation: permutation,
        permutationCombination: permutationCombination,
        power: power,
        baseN: baseN,
        VERSION: version
    });
})(this);

},{}],7:[function(require,module,exports){
var utils = require("./utils");

module.exports = {
  /*
   * Compiler passes.
   *
   * Each pass is a function that is passed the AST. It can perform checks on it
   * or modify it as needed. If the pass encounters a semantic error, it throws
   * |PEG.GrammarError|.
   */
  passes: {
    check: {
      reportMissingRules:  require("./compiler/passes/report-missing-rules"),
      reportLeftRecursion: require("./compiler/passes/report-left-recursion")
    },
    transform: {
      removeProxyRules:    require("./compiler/passes/remove-proxy-rules")
    },
    generate: {
      generateBytecode:    require("./compiler/passes/generate-bytecode"),
      generateJavascript:  require("./compiler/passes/generate-javascript")
    }
  },

  /*
   * Generates a parser from a specified grammar AST. Throws |PEG.GrammarError|
   * if the AST contains a semantic error. Note that not all errors are detected
   * during the generation and some may protrude to the generated parser and
   * cause its malfunction.
   */
  compile: function(ast, passes) {
    var options = arguments.length > 2 ? utils.clone(arguments[2]) : {},
        stage;

    /*
     * Extracted into a function just to silence JSHint complaining about
     * creating functions in a loop.
     */
    function runPass(pass) {
      pass(ast, options);
    }

    utils.defaults(options, {
      allowedStartRules:  [ast.rules[0].name],
      cache:              false,
      optimize:           "speed",
      output:             "parser"
    });

    for (stage in passes) {
      if (passes.hasOwnProperty(stage)) {
        utils.each(passes[stage], runPass);
      }
    }

    switch (options.output) {
      case "parser": return eval(ast.code);
      case "source": return ast.code;
    }
  }
};

},{"./compiler/passes/generate-bytecode":9,"./compiler/passes/generate-javascript":10,"./compiler/passes/remove-proxy-rules":11,"./compiler/passes/report-left-recursion":12,"./compiler/passes/report-missing-rules":13,"./utils":17}],8:[function(require,module,exports){
/* Bytecode instruction opcodes. */
module.exports = {
  /* Stack Manipulation */

  PUSH:             0,    // PUSH c
  PUSH_CURR_POS:    1,    // PUSH_CURR_POS
  POP:              2,    // POP
  POP_CURR_POS:     3,    // POP_CURR_POS
  POP_N:            4,    // POP_N n
  NIP:              5,    // NIP
  APPEND:           6,    // APPEND
  WRAP:             7,    // WRAP n
  TEXT:             8,    // TEXT

  /* Conditions and Loops */

  IF:               9,    // IF t, f
  IF_ERROR:         10,   // IF_ERROR t, f
  IF_NOT_ERROR:     11,   // IF_NOT_ERROR t, f
  WHILE_NOT_ERROR:  12,   // WHILE_NOT_ERROR b

  /* Matching */

  MATCH_ANY:        13,   // MATCH_ANY a, f, ...
  MATCH_STRING:     14,   // MATCH_STRING s, a, f, ...
  MATCH_STRING_IC:  15,   // MATCH_STRING_IC s, a, f, ...
  MATCH_REGEXP:     16,   // MATCH_REGEXP r, a, f, ...
  ACCEPT_N:         17,   // ACCEPT_N n
  ACCEPT_STRING:    18,   // ACCEPT_STRING s
  FAIL:             19,   // FAIL e

  /* Calls */

  REPORT_SAVED_POS: 20,   // REPORT_SAVED_POS p
  REPORT_CURR_POS:  21,   // REPORT_CURR_POS
  CALL:             22,   // CALL f, n, pc, p1, p2, ..., pN

  /* Rules */

  RULE:             23,   // RULE r

  /* Failure Reporting */

  SILENT_FAILS_ON:  24,   // SILENT_FAILS_ON
  SILENT_FAILS_OFF: 25    // SILENT_FAILS_FF
};

},{}],9:[function(require,module,exports){
var utils = require("../../utils"),
    op    = require("../opcodes");

/* Generates bytecode.
 *
 * Instructions
 * ============
 *
 * Stack Manipulation
 * ------------------
 *
 *  [0] PUSH c
 *
 *        stack.push(consts[c]);
 *
 *  [1] PUSH_CURR_POS
 *
 *        stack.push(currPos);
 *
 *  [2] POP
 *
 *        stack.pop();
 *
 *  [3] POP_CURR_POS
 *
 *        currPos = stack.pop();
 *
 *  [4] POP_N n
 *
 *        stack.pop(n);
 *
 *  [5] NIP
 *
 *        value = stack.pop();
 *        stack.pop();
 *        stack.push(value);
 *
 *  [6] APPEND
 *
 *        value = stack.pop();
 *        array = stack.pop();
 *        array.push(value);
 *        stack.push(array);
 *
 *  [7] WRAP n
 *
 *        stack.push(stack.pop(n));
 *
 *  [8] TEXT
 *
 *        stack.pop();
 *        stack.push(input.substring(stack.top(), currPos));
 *
 * Conditions and Loops
 * --------------------
 *
 *  [9] IF t, f
 *
 *        if (stack.top()) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [10] IF_ERROR t, f
 *
 *        if (stack.top() === FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [11] IF_NOT_ERROR t, f
 *
 *        if (stack.top() !== FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [12] WHILE_NOT_ERROR b
 *
 *        while(stack.top() !== FAILED) {
 *          interpret(ip + 2, ip + 2 + b);
 *        }
 *
 * Matching
 * --------
 *
 * [13] MATCH_ANY a, f, ...
 *
 *        if (input.length > currPos) {
 *          interpret(ip + 3, ip + 3 + a);
 *        } else {
 *          interpret(ip + 3 + a, ip + 3 + a + f);
 *        }
 *
 * [14] MATCH_STRING s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length) === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [15] MATCH_STRING_IC s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length).toLowerCase() === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [16] MATCH_REGEXP r, a, f, ...
 *
 *        if (consts[r].test(input.charAt(currPos))) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [17] ACCEPT_N n
 *
 *        stack.push(input.substring(currPos, n));
 *        currPos += n;
 *
 * [18] ACCEPT_STRING s
 *
 *        stack.push(consts[s]);
 *        currPos += consts[s].length;
 *
 * [19] FAIL e
 *
 *        stack.push(FAILED);
 *        fail(consts[e]);
 *
 * Calls
 * -----
 *
 * [20] REPORT_SAVED_POS p
 *
 *        reportedPos = stack[p];
 *
 * [21] REPORT_CURR_POS
 *
 *        reportedPos = currPos;
 *
 * [22] CALL f, n, pc, p1, p2, ..., pN
 *
 *        value = consts[f](stack[p1], ..., stack[pN]);
 *        stack.pop(n);
 *        stack.push(value);
 *
 * Rules
 * -----
 *
 * [23] RULE r
 *
 *        stack.push(parseRule(r));
 *
 * Failure Reporting
 * -----------------
 *
 * [24] SILENT_FAILS_ON
 *
 *        silentFails++;
 *
 * [25] SILENT_FAILS_OFF
 *
 *        silentFails--;
 */
module.exports = function(ast) {
  var consts = [];

  function addConst(value) {
    var index = utils.indexOf(consts, function(c) { return c === value; });

    return index === -1 ? consts.push(value) - 1 : index;
  }

  function addFunctionConst(params, code) {
    return addConst(
      "function(" + params.join(", ") + ") {" + code + "}"
    );
  }

  function buildSequence() {
    return Array.prototype.concat.apply([], arguments);
  }

  function buildCondition(condCode, thenCode, elseCode) {
    return condCode.concat(
      [thenCode.length, elseCode.length],
      thenCode,
      elseCode
    );
  }

  function buildLoop(condCode, bodyCode) {
    return condCode.concat([bodyCode.length], bodyCode);
  }

  function buildCall(functionIndex, delta, env, sp) {
    var params = utils.map( utils.values(env), function(p) { return sp - p; });

    return [op.CALL, functionIndex, delta, params.length].concat(params);
  }

  function buildSimplePredicate(expression, negative, context) {
    var undefinedIndex = addConst('void 0'),
        failedIndex    = addConst('peg$FAILED');

    return buildSequence(
      [op.PUSH_CURR_POS],
      [op.SILENT_FAILS_ON],
      generate(expression, {
        sp:     context.sp + 1,
        env:    { },
        action: null
      }),
      [op.SILENT_FAILS_OFF],
      buildCondition(
        [negative ? op.IF_ERROR : op.IF_NOT_ERROR],
        buildSequence(
          [op.POP],
          [negative ? op.POP : op.POP_CURR_POS],
          [op.PUSH, undefinedIndex]
        ),
        buildSequence(
          [op.POP],
          [negative ? op.POP_CURR_POS : op.POP],
          [op.PUSH, failedIndex]
        )
      )
    );
  }

  function buildSemanticPredicate(code, negative, context) {
    var functionIndex  = addFunctionConst(utils.keys(context.env), code),
        undefinedIndex = addConst('void 0'),
        failedIndex    = addConst('peg$FAILED');

    return buildSequence(
      [op.REPORT_CURR_POS],
      buildCall(functionIndex, 0, context.env, context.sp),
      buildCondition(
        [op.IF],
        buildSequence(
          [op.POP],
          [op.PUSH, negative ? failedIndex : undefinedIndex]
        ),
        buildSequence(
          [op.POP],
          [op.PUSH, negative ? undefinedIndex : failedIndex]
        )
      )
    );
  }

  function buildAppendLoop(expressionCode) {
    return buildLoop(
      [op.WHILE_NOT_ERROR],
      buildSequence([op.APPEND], expressionCode)
    );
  }

  var generate = utils.buildNodeVisitor({
    grammar: function(node) {
      utils.each(node.rules, generate);

      node.consts = consts;
    },

    rule: function(node) {
      node.bytecode = generate(node.expression, {
        sp:     -1,  // stack pointer
        env:    { }, // mapping of label names to stack positions
        action: null // action nodes pass themselves to children here
      });
    },

    named: function(node, context) {
      var nameIndex = addConst(
        '{ type: "other", description: ' + utils.quote(node.name) + ' }'
      );

      /*
       * The code generated below is slightly suboptimal because |FAIL| pushes
       * to the stack, so we need to stick a |POP| in front of it. We lack a
       * dedicated instruction that would just report the failure and not touch
       * the stack.
       */
      return buildSequence(
        [op.SILENT_FAILS_ON],
        generate(node.expression, context),
        [op.SILENT_FAILS_OFF],
        buildCondition([op.IF_ERROR], [op.FAIL, nameIndex], [])
      );
    },

    choice: function(node, context) {
      function buildAlternativesCode(alternatives, context) {
        return buildSequence(
          generate(alternatives[0], {
            sp:     context.sp,
            env:    { },
            action: null
          }),
          alternatives.length > 1
            ? buildCondition(
                [op.IF_ERROR],
                buildSequence(
                  [op.POP],
                  buildAlternativesCode(alternatives.slice(1), context)
                ),
                []
              )
            : []
        );
      }

      return buildAlternativesCode(node.alternatives, context);
    },

    action: function(node, context) {
      var env            = { },
          emitCall       = node.expression.type !== "sequence"
                        || node.expression.elements.length === 0,
          expressionCode = generate(node.expression, {
            sp:     context.sp + (emitCall ? 1 : 0),
            env:    env,
            action: node
          }),
          functionIndex  = addFunctionConst(utils.keys(env), node.code);

      return emitCall
        ? buildSequence(
            [op.PUSH_CURR_POS],
            expressionCode,
            buildCondition(
              [op.IF_NOT_ERROR],
              buildSequence(
                [op.REPORT_SAVED_POS, 1],
                buildCall(functionIndex, 1, env, context.sp + 2)
              ),
              []
            ),
            [op.NIP]
          )
        : expressionCode;
    },

    sequence: function(node, context) {
      var emptyArrayIndex;

      function buildElementsCode(elements, context) {
        var processedCount, functionIndex;

        if (elements.length > 0) {
          processedCount = node.elements.length - elements.slice(1).length;

          return buildSequence(
            generate(elements[0], {
              sp:     context.sp,
              env:    context.env,
              action: null
            }),
            buildCondition(
              [op.IF_NOT_ERROR],
              buildElementsCode(elements.slice(1), {
                sp:     context.sp + 1,
                env:    context.env,
                action: context.action
              }),
              buildSequence(
                processedCount > 1 ? [op.POP_N, processedCount] : [op.POP],
                [op.POP_CURR_POS],
                [op.PUSH, failedIndex]
              )
            )
          );
        } else {
          if (context.action) {
            functionIndex = addFunctionConst(
              utils.keys(context.env),
              context.action.code
            );

            return buildSequence(
              [op.REPORT_SAVED_POS, node.elements.length],
              buildCall(
                functionIndex,
                node.elements.length,
                context.env,
                context.sp
              ),
              [op.NIP]
            );
          } else {
            return buildSequence([op.WRAP, node.elements.length], [op.NIP]);
          }
        }
      }

      if (node.elements.length > 0) {
        failedIndex = addConst('peg$FAILED');

        return buildSequence(
          [op.PUSH_CURR_POS],
          buildElementsCode(node.elements, {
            sp:     context.sp + 1,
            env:    context.env,
            action: context.action
          })
        );
      } else {
        emptyArrayIndex = addConst('[]');

        return [op.PUSH, emptyArrayIndex];
      }
    },

    labeled: function(node, context) {
      context.env[node.label] = context.sp + 1;

      return generate(node.expression, {
        sp:     context.sp,
        env:    { },
        action: null
      });
    },

    text: function(node, context) {
      return buildSequence(
        [op.PUSH_CURR_POS],
        generate(node.expression, {
          sp:     context.sp + 1,
          env:    { },
          action: null
        }),
        buildCondition([op.IF_NOT_ERROR], [op.TEXT], []),
        [op.NIP]
      );
    },

    simple_and: function(node, context) {
      return buildSimplePredicate(node.expression, false, context);
    },

    simple_not: function(node, context) {
      return buildSimplePredicate(node.expression, true, context);
    },

    semantic_and: function(node, context) {
      return buildSemanticPredicate(node.code, false, context);
    },

    semantic_not: function(node, context) {
      return buildSemanticPredicate(node.code, true, context);
    },

    optional: function(node, context) {
      var nullIndex = addConst('null');

      return buildSequence(
        generate(node.expression, {
          sp:     context.sp,
          env:    { },
          action: null
        }),
        buildCondition(
          [op.IF_ERROR],
          buildSequence([op.POP], [op.PUSH, nullIndex]),
          []
        )
      );
    },

    zero_or_more: function(node, context) {
      var emptyArrayIndex = addConst('[]');
          expressionCode  = generate(node.expression, {
            sp:     context.sp + 1,
            env:    { },
            action: null
          });

      return buildSequence(
        [op.PUSH, emptyArrayIndex],
        expressionCode,
        buildAppendLoop(expressionCode),
        [op.POP]
      );
    },

    one_or_more: function(node, context) {
      var emptyArrayIndex = addConst('[]');
          failedIndex     = addConst('peg$FAILED');
          expressionCode  = generate(node.expression, {
            sp:     context.sp + 1,
            env:    { },
            action: null
          });

      return buildSequence(
        [op.PUSH, emptyArrayIndex],
        expressionCode,
        buildCondition(
          [op.IF_NOT_ERROR],
          buildSequence(buildAppendLoop(expressionCode), [op.POP]),
          buildSequence([op.POP], [op.POP], [op.PUSH, failedIndex])
        )
      );
    },

    rule_ref: function(node) {
      return [op.RULE, utils.indexOfRuleByName(ast, node.name)];
    },

    literal: function(node) {
      var stringIndex, expectedIndex;

      if (node.value.length > 0) {
        stringIndex = addConst(node.ignoreCase
          ? utils.quote(node.value.toLowerCase())
          : utils.quote(node.value)
        );
        expectedIndex = addConst([
          '{',
          'type: "literal",',
          'value: ' + utils.quote(node.value) + ',',
          'description: ' + utils.quote(utils.quote(node.value)),
          '}'
        ].join(' '));

        /*
         * For case-sensitive strings the value must match the beginning of the
         * remaining input exactly. As a result, we can use |ACCEPT_STRING| and
         * save one |substr| call that would be needed if we used |ACCEPT_N|.
         */
        return buildCondition(
          node.ignoreCase
            ? [op.MATCH_STRING_IC, stringIndex]
            : [op.MATCH_STRING, stringIndex],
          node.ignoreCase
            ? [op.ACCEPT_N, node.value.length]
            : [op.ACCEPT_STRING, stringIndex],
          [op.FAIL, expectedIndex]
        );
      } else {
        stringIndex = addConst('""');

        return [op.PUSH, stringIndex];
      }
    },

    "class": function(node) {
      var regexp, regexpIndex, expectedIndex;

      if (node.parts.length > 0) {
        regexp = '/^['
          + (node.inverted ? '^' : '')
          + utils.map(node.parts, function(part) {
              return part instanceof Array
                ? utils.quoteForRegexpClass(part[0])
                  + '-'
                  + utils.quoteForRegexpClass(part[1])
                : utils.quoteForRegexpClass(part);
            }).join('')
          + ']/' + (node.ignoreCase ? 'i' : '');
      } else {
        /*
         * IE considers regexps /[]/ and /[^]/ as syntactically invalid, so we
         * translate them into euqivalents it can handle.
         */
        regexp = node.inverted ? '/^[\\S\\s]/' : '/^(?!)/';
      }

      regexpIndex   = addConst(regexp);
      expectedIndex = addConst([
        '{',
        'type: "class",',
        'value: ' + utils.quote(node.rawText) + ',',
        'description: ' + utils.quote(node.rawText),
        '}'
      ].join(' '));

      return buildCondition(
        [op.MATCH_REGEXP, regexpIndex],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex]
      );
    },

    any: function() {
      var expectedIndex = addConst('{ type: "any", description: "any character" }');

      return buildCondition(
        [op.MATCH_ANY],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex]
      );
    }
  });

  generate(ast);
};

},{"../../utils":17,"../opcodes":8}],10:[function(require,module,exports){
var utils = require("../../utils"),
    op    = require("../opcodes");

/* Generates parser JavaScript code. */
module.exports = function(ast, options) {
  /* These only indent non-empty lines to avoid trailing whitespace. */
  function indent2(code)  { return code.replace(/^(.+)$/gm, '  $1');         }
  function indent4(code)  { return code.replace(/^(.+)$/gm, '    $1');       }
  function indent8(code)  { return code.replace(/^(.+)$/gm, '        $1');   }
  function indent10(code) { return code.replace(/^(.+)$/gm, '          $1'); }

  function generateTables() {
    if (options.optimize === "size") {
      return [
        'peg$consts = [',
           indent2(ast.consts.join(',\n')),
        '],',
        '',
        'peg$bytecode = [',
           indent2(utils.map(
             ast.rules,
             function(rule) {
               return 'peg$decode('
                     + utils.quote(utils.map(
                         rule.bytecode,
                         function(b) { return String.fromCharCode(b + 32); }
                       ).join(''))
                     + ')';
             }
           ).join(',\n')),
        '],'
      ].join('\n');
    } else {
      return utils.map(
        ast.consts,
        function(c, i) { return 'peg$c' + i + ' = ' + c + ','; }
      ).join('\n');
    }
  }

  function generateCacheHeader(ruleIndexCode) {
    return [
      'var key    = peg$currPos * ' + ast.rules.length + ' + ' + ruleIndexCode + ',',
      '    cached = peg$cache[key];',
      '',
      'if (cached) {',
      '  peg$currPos = cached.nextPos;',
      '  return cached.result;',
      '}',
      ''
    ].join('\n');
  }

  function generateCacheFooter(resultCode) {
    return [
      '',
      'peg$cache[key] = { nextPos: peg$currPos, result: ' + resultCode + ' };'
    ].join('\n');
  }

  function generateInterpreter() {
    var parts = [];

    function generateCondition(cond, argsLength) {
      var baseLength      = argsLength + 3,
          thenLengthCode = 'bc[ip + ' + (baseLength - 2) + ']',
          elseLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'ends.push(end);',
        'ips.push(ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ');',
        '',
        'if (' + cond + ') {',
        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ';',
        '  ip += ' + baseLength + ';',
        '} else {',
        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ';',
        '  ip += ' + baseLength + ' + ' + thenLengthCode + ';',
        '}',
        '',
        'break;'
      ].join('\n');
    }

    function generateLoop(cond) {
      var baseLength     = 2,
          bodyLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'if (' + cond + ') {',
        '  ends.push(end);',
        '  ips.push(ip);',
        '',
        '  end = ip + ' + baseLength + ' + ' + bodyLengthCode + ';',
        '  ip += ' + baseLength + ';',
        '} else {',
        '  ip += ' + baseLength + ' + ' + bodyLengthCode + ';',
        '}',
        '',
        'break;'
      ].join('\n');
    }

    function generateCall() {
      var baseLength       = 4,
          paramsLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'params = bc.slice(ip + ' + baseLength + ', ip + ' + baseLength + ' + ' + paramsLengthCode + ');',
        'for (i = 0; i < ' + paramsLengthCode + '; i++) {',
        '  params[i] = stack[stack.length - 1 - params[i]];',
        '}',
        '',
        'stack.splice(',
        '  stack.length - bc[ip + 2],',
        '  bc[ip + 2],',
        '  peg$consts[bc[ip + 1]].apply(null, params)',
        ');',
        '',
        'ip += ' + baseLength + ' + ' + paramsLengthCode + ';',
        'break;'
      ].join('\n');
    }

    parts.push([
      'function peg$decode(s) {',
      '  var bc = new Array(s.length), i;',
      '',
      '  for (i = 0; i < s.length; i++) {',
      '    bc[i] = s.charCodeAt(i) - 32;',
      '  }',
      '',
      '  return bc;',
      '}',
      '',
      'function peg$parseRule(index) {',
      '  var bc    = peg$bytecode[index],',
      '      ip    = 0,',
      '      ips   = [],',
      '      end   = bc.length,',
      '      ends  = [],',
      '      stack = [],',
      '      params, i;',
      ''
    ].join('\n'));

    if (options.cache) {
      parts.push(indent2(generateCacheHeader('index')));
    }

    parts.push([
      '  function protect(object) {',
      '    return Object.prototype.toString.apply(object) === "[object Array]" ? [] : object;',
      '  }',
      '',
      /*
       * The point of the outer loop and the |ips| & |ends| stacks is to avoid
       * recursive calls for interpreting parts of bytecode. In other words, we
       * implement the |interpret| operation of the abstract machine without
       * function calls. Such calls would likely slow the parser down and more
       * importantly cause stack overflows for complex grammars.
       */
      '  while (true) {',
      '    while (ip < end) {',
      '      switch (bc[ip]) {',
      '        case ' + op.PUSH + ':',             // PUSH c
      /*
       * Hack: One of the constants can be an empty array. It needs to be cloned
       * because it can be modified later on the stack by |APPEND|.
       */
      '          stack.push(protect(peg$consts[bc[ip + 1]]));',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.PUSH_CURR_POS + ':',    // PUSH_CURR_POS
      '          stack.push(peg$currPos);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP + ':',              // POP
      '          stack.pop();',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP_CURR_POS + ':',     // POP_CURR_POS
      '          peg$currPos = stack.pop();',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP_N + ':',            // POP_N n
      '          stack.length -= bc[ip + 1];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.NIP + ':',              // NIP
      '          stack.splice(-2, 1);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.APPEND + ':',           // APPEND
      '          stack[stack.length - 2].push(stack.pop());',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.WRAP + ':',             // WRAP n
      '          stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.TEXT + ':',             // TEXT
      '          stack.pop();',
      '          stack.push(input.substring(stack[stack.length - 1], peg$currPos));',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.IF + ':',               // IF t, f
                 indent10(generateCondition('stack[stack.length - 1]', 0)),
      '',
      '        case ' + op.IF_ERROR + ':',         // IF_ERROR t, f
                 indent10(generateCondition(
                   'stack[stack.length - 1] === peg$FAILED',
                   0
                 )),
      '',
      '        case ' + op.IF_NOT_ERROR + ':',     // IF_NOT_ERROR t, f
                 indent10(
                   generateCondition('stack[stack.length - 1] !== peg$FAILED',
                   0
                 )),
      '',
      '        case ' + op.WHILE_NOT_ERROR + ':',  // WHILE_NOT_ERROR b
                 indent10(generateLoop('stack[stack.length - 1] !== peg$FAILED')),
      '',
      '        case ' + op.MATCH_ANY + ':',        // MATCH_ANY a, f, ...
                 indent10(generateCondition('input.length > peg$currPos', 0)),
      '',
      '        case ' + op.MATCH_STRING + ':',     // MATCH_STRING s, a, f, ...
                 indent10(generateCondition(
                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]',
                   1
                 )),
      '',
      '        case ' + op.MATCH_STRING_IC + ':',  // MATCH_STRING_IC s, a, f, ...
                 indent10(generateCondition(
                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]',
                   1
                 )),
      '',
      '        case ' + op.MATCH_REGEXP + ':',     // MATCH_REGEXP r, a, f, ...
                 indent10(generateCondition(
                   'peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))',
                   1
                 )),
      '',
      '        case ' + op.ACCEPT_N + ':',         // ACCEPT_N n
      '          stack.push(input.substr(peg$currPos, bc[ip + 1]));',
      '          peg$currPos += bc[ip + 1];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.ACCEPT_STRING + ':',    // ACCEPT_STRING s
      '          stack.push(peg$consts[bc[ip + 1]]);',
      '          peg$currPos += peg$consts[bc[ip + 1]].length;',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.FAIL + ':',             // FAIL e
      '          stack.push(peg$FAILED);',
      '          if (peg$silentFails === 0) {',
      '            peg$fail(peg$consts[bc[ip + 1]]);',
      '          }',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.REPORT_SAVED_POS + ':', // REPORT_SAVED_POS p
      '          peg$reportedPos = stack[stack.length - 1 - bc[ip + 1]];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.REPORT_CURR_POS + ':',  // REPORT_CURR_POS
      '          peg$reportedPos = peg$currPos;',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.CALL + ':',             // CALL f, n, pc, p1, p2, ..., pN
                 indent10(generateCall()),
      '',
      '        case ' + op.RULE + ':',             // RULE r
      '          stack.push(peg$parseRule(bc[ip + 1]));',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.SILENT_FAILS_ON + ':',  // SILENT_FAILS_ON
      '          peg$silentFails++;',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.SILENT_FAILS_OFF + ':', // SILENT_FAILS_OFF
      '          peg$silentFails--;',
      '          ip++;',
      '          break;',
      '',
      '        default:',
      '          throw new Error("Invalid opcode: " + bc[ip] + ".");',
      '      }',
      '    }',
      '',
      '    if (ends.length > 0) {',
      '      end = ends.pop();',
      '      ip = ips.pop();',
      '    } else {',
      '      break;',
      '    }',
      '  }'
    ].join('\n'));

    if (options.cache) {
      parts.push(indent2(generateCacheFooter('stack[0]')));
    }

    parts.push([
      '',
      '  return stack[0];',
      '}'
    ].join('\n'));

    return parts.join('\n');
  }

  function generateRuleFunction(rule) {
    var parts = [], code;

    function c(i) { return "peg$c" + i; } // |consts[i]| of the abstract machine
    function s(i) { return "s"     + i; } // |stack[i]| of the abstract machine

    var stack = {
          sp:    -1,
          maxSp: -1,

          push: function(exprCode) {
            var code = s(++this.sp) + ' = ' + exprCode + ';';

            if (this.sp > this.maxSp) { this.maxSp = this.sp; }

            return code;
          },

          pop: function() {
            var n, values;

            if (arguments.length === 0) {
              return s(this.sp--);
            } else {
              n = arguments[0];
              values = utils.map(utils.range(this.sp - n + 1, this.sp + 1), s);
              this.sp -= n;

              return values;
            }
          },

          top: function() {
            return s(this.sp);
          },

          index: function(i) {
            return s(this.sp - i);
          }
        };

    function compile(bc) {
      var ip    = 0,
          end   = bc.length,
          parts = [],
          value;

      function compileCondition(cond, argCount) {
        var baseLength = argCount + 3,
            thenLength = bc[ip + baseLength - 2],
            elseLength = bc[ip + baseLength - 1],
            baseSp     = stack.sp,
            thenCode, elseCode, thenSp, elseSp;

        ip += baseLength;
        thenCode = compile(bc.slice(ip, ip + thenLength));
        thenSp = stack.sp;
        ip += thenLength;

        if (elseLength > 0) {
          stack.sp = baseSp;
          elseCode = compile(bc.slice(ip, ip + elseLength));
          elseSp = stack.sp;
          ip += elseLength;

          if (thenSp !== elseSp) {
            throw new Error(
              "Branches of a condition must move the stack pointer in the same way."
            );
          }
        }

        parts.push('if (' + cond + ') {');
        parts.push(indent2(thenCode));
        if (elseLength > 0) {
          parts.push('} else {');
          parts.push(indent2(elseCode));
        }
        parts.push('}');
      }

      function compileLoop(cond) {
        var baseLength = 2,
            bodyLength = bc[ip + baseLength - 1],
            baseSp     = stack.sp,
            bodyCode, bodySp;

        ip += baseLength;
        bodyCode = compile(bc.slice(ip, ip + bodyLength));
        bodySp = stack.sp;
        ip += bodyLength;

        if (bodySp !== baseSp) {
          throw new Error("Body of a loop can't move the stack pointer.");
        }

        parts.push('while (' + cond + ') {');
        parts.push(indent2(bodyCode));
        parts.push('}');
      }

      function compileCall() {
        var baseLength   = 4,
            paramsLength = bc[ip + baseLength - 1];

        var value = c(bc[ip + 1]) + '('
              + utils.map(
                  bc.slice(ip + baseLength, ip + baseLength + paramsLength),
                  stackIndex
                ).join(', ')
              + ')';
        stack.pop(bc[ip + 2]);
        parts.push(stack.push(value));
        ip += baseLength + paramsLength;
      }

      /*
       * Extracted into a function just to silence JSHint complaining about
       * creating functions in a loop.
       */
      function stackIndex(p) {
        return stack.index(p);
      }

      while (ip < end) {
        switch (bc[ip]) {
          case op.PUSH:             // PUSH c
            /*
             * Hack: One of the constants can be an empty array. It needs to be
             * handled specially because it can be modified later on the stack
             * by |APPEND|.
             */
            parts.push(
              stack.push(ast.consts[bc[ip + 1]] === "[]" ? "[]" : c(bc[ip + 1]))
            );
            ip += 2;
            break;

          case op.PUSH_CURR_POS:    // PUSH_CURR_POS
            parts.push(stack.push('peg$currPos'));
            ip++;
            break;

          case op.POP:              // POP
            stack.pop();
            ip++;
            break;

          case op.POP_CURR_POS:     // POP_CURR_POS
            parts.push('peg$currPos = ' + stack.pop() + ';');
            ip++;
            break;

          case op.POP_N:            // POP_N n
            stack.pop(bc[ip + 1]);
            ip += 2;
            break;

          case op.NIP:              // NIP
            value = stack.pop();
            stack.pop();
            parts.push(stack.push(value));
            ip++;
            break;

          case op.APPEND:           // APPEND
            value = stack.pop();
            parts.push(stack.top() + '.push(' + value + ');');
            ip++;
            break;

          case op.WRAP:             // WRAP n
            parts.push(
              stack.push('[' + stack.pop(bc[ip + 1]).join(', ') + ']')
            );
            ip += 2;
            break;

          case op.TEXT:             // TEXT
            stack.pop();
            parts.push(
              stack.push('input.substring(' + stack.top() + ', peg$currPos)')
            );
            ip++;
            break;

          case op.IF:               // IF t, f
            compileCondition(stack.top(), 0);
            break;

          case op.IF_ERROR:         // IF_ERROR t, f
            compileCondition(stack.top() + ' === peg$FAILED', 0);
            break;

          case op.IF_NOT_ERROR:     // IF_NOT_ERROR t, f
            compileCondition(stack.top() + ' !== peg$FAILED', 0);
            break;

          case op.WHILE_NOT_ERROR:  // WHILE_NOT_ERROR b
            compileLoop(stack.top() + ' !== peg$FAILED', 0);
            break;

          case op.MATCH_ANY:        // MATCH_ANY a, f, ...
            compileCondition('input.length > peg$currPos', 0);
            break;

          case op.MATCH_STRING:     // MATCH_STRING s, a, f, ...
            compileCondition(
              eval(ast.consts[bc[ip + 1]]).length > 1
                ? 'input.substr(peg$currPos, '
                    + eval(ast.consts[bc[ip + 1]]).length
                    + ') === '
                    + c(bc[ip + 1])
                : 'input.charCodeAt(peg$currPos) === '
                    + eval(ast.consts[bc[ip + 1]]).charCodeAt(0),
              1
            );
            break;

          case op.MATCH_STRING_IC:  // MATCH_STRING_IC s, a, f, ...
            compileCondition(
              'input.substr(peg$currPos, '
                + eval(ast.consts[bc[ip + 1]]).length
                + ').toLowerCase() === '
                + c(bc[ip + 1]),
              1
            );
            break;

          case op.MATCH_REGEXP:     // MATCH_REGEXP r, a, f, ...
            compileCondition(
              c(bc[ip + 1]) + '.test(input.charAt(peg$currPos))',
              1
            );
            break;

          case op.ACCEPT_N:         // ACCEPT_N n
            parts.push(stack.push(
              bc[ip + 1] > 1
                ? 'input.substr(peg$currPos, ' + bc[ip + 1] + ')'
                : 'input.charAt(peg$currPos)'
            ));
            parts.push(
              bc[ip + 1] > 1
                ? 'peg$currPos += ' + bc[ip + 1] + ';'
                : 'peg$currPos++;'
            );
            ip += 2;
            break;

          case op.ACCEPT_STRING:    // ACCEPT_STRING s
            parts.push(stack.push(c(bc[ip + 1])));
            parts.push(
              eval(ast.consts[bc[ip + 1]]).length > 1
                ? 'peg$currPos += ' + eval(ast.consts[bc[ip + 1]]).length + ';'
                : 'peg$currPos++;'
            );
            ip += 2;
            break;

          case op.FAIL:             // FAIL e
            parts.push(stack.push('peg$FAILED'));
            parts.push('if (peg$silentFails === 0) { peg$fail(' + c(bc[ip + 1]) + '); }');
            ip += 2;
            break;

          case op.REPORT_SAVED_POS: // REPORT_SAVED_POS p
            parts.push('peg$reportedPos = ' + stack.index(bc[ip + 1]) + ';');
            ip += 2;
            break;

          case op.REPORT_CURR_POS:  // REPORT_CURR_POS
            parts.push('peg$reportedPos = peg$currPos;');
            ip++;
            break;

          case op.CALL:             // CALL f, n, pc, p1, p2, ..., pN
            compileCall();
            break;

          case op.RULE:             // RULE r
            parts.push(stack.push("peg$parse" + ast.rules[bc[ip + 1]].name + "()"));
            ip += 2;
            break;

          case op.SILENT_FAILS_ON:  // SILENT_FAILS_ON
            parts.push('peg$silentFails++;');
            ip++;
            break;

          case op.SILENT_FAILS_OFF: // SILENT_FAILS_OFF
            parts.push('peg$silentFails--;');
            ip++;
            break;

          default:
            throw new Error("Invalid opcode: " + bc[ip] + ".");
        }
      }

      return parts.join('\n');
    }

    code = compile(rule.bytecode);

    parts.push([
      'function peg$parse' + rule.name + '() {',
      '  var ' + utils.map(utils.range(0, stack.maxSp + 1), s).join(', ') + ';',
      ''
    ].join('\n'));

    if (options.cache) {
      parts.push(indent2(
        generateCacheHeader(utils.indexOfRuleByName(ast, rule.name))
      ));
    }

    parts.push(indent2(code));

    if (options.cache) {
      parts.push(indent2(generateCacheFooter(s(0))));
    }

    parts.push([
      '',
      '  return ' + s(0) + ';',
      '}'
    ].join('\n'));

    return parts.join('\n');
  }

  var parts = [],
      startRuleIndices,   startRuleIndex,
      startRuleFunctions, startRuleFunction;

  parts.push([
    '(function() {',
    '  /*',
    '   * Generated by PEG.js 0.8.0.',
    '   *',
    '   * http://pegjs.majda.cz/',
    '   */',
    '',
    '  function peg$subclass(child, parent) {',
    '    function ctor() { this.constructor = child; }',
    '    ctor.prototype = parent.prototype;',
    '    child.prototype = new ctor();',
    '  }',
    '',
    '  function SyntaxError(message, expected, found, offset, line, column) {',
    '    this.message  = message;',
    '    this.expected = expected;',
    '    this.found    = found;',
    '    this.offset   = offset;',
    '    this.line     = line;',
    '    this.column   = column;',
    '',
    '    this.name     = "SyntaxError";',
    '  }',
    '',
    '  peg$subclass(SyntaxError, Error);',
    '',
    '  function parse(input) {',
    '    var options = arguments.length > 1 ? arguments[1] : {},',
    '',
    '        peg$FAILED = {},',
    ''
  ].join('\n'));

  if (options.optimize === "size") {
    startRuleIndices = '{ '
                     + utils.map(
                         options.allowedStartRules,
                         function(r) { return r + ': ' + utils.indexOfRuleByName(ast, r); }
                       ).join(', ')
                     + ' }';
    startRuleIndex = utils.indexOfRuleByName(ast, options.allowedStartRules[0]);

    parts.push([
      '        peg$startRuleIndices = ' + startRuleIndices + ',',
      '        peg$startRuleIndex   = ' + startRuleIndex + ','
    ].join('\n'));
  } else {
    startRuleFunctions = '{ '
                     + utils.map(
                         options.allowedStartRules,
                         function(r) { return r + ': peg$parse' + r; }
                       ).join(', ')
                     + ' }';
    startRuleFunction = 'peg$parse' + options.allowedStartRules[0];

    parts.push([
      '        peg$startRuleFunctions = ' + startRuleFunctions + ',',
      '        peg$startRuleFunction  = ' + startRuleFunction + ','
    ].join('\n'));
  }

  parts.push('');

  parts.push(indent8(generateTables()));

  parts.push([
    '',
    '        peg$currPos          = 0,',
    '        peg$reportedPos      = 0,',
    '        peg$cachedPos        = 0,',
    '        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },',
    '        peg$maxFailPos       = 0,',
    '        peg$maxFailExpected  = [],',
    '        peg$silentFails      = 0,', // 0 = report failures, > 0 = silence failures
    ''
  ].join('\n'));

  if (options.cache) {
    parts.push('        peg$cache = {},');
  }

  parts.push([
    '        peg$result;',
    ''
  ].join('\n'));

  if (options.optimize === "size") {
    parts.push([
      '    if ("startRule" in options) {',
      '      if (!(options.startRule in peg$startRuleIndices)) {',
      '        throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
      '      }',
      '',
      '      peg$startRuleIndex = peg$startRuleIndices[options.startRule];',
      '    }'
    ].join('\n'));
  } else {
    parts.push([
      '    if ("startRule" in options) {',
      '      if (!(options.startRule in peg$startRuleFunctions)) {',
      '        throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
      '      }',
      '',
      '      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];',
      '    }'
    ].join('\n'));
  }

  parts.push([
    '',
    '    function text() {',
    '      return input.substring(peg$reportedPos, peg$currPos);',
    '    }',
    '',
    '    function offset() {',
    '      return peg$reportedPos;',
    '    }',
    '',
    '    function line() {',
    '      return peg$computePosDetails(peg$reportedPos).line;',
    '    }',
    '',
    '    function column() {',
    '      return peg$computePosDetails(peg$reportedPos).column;',
    '    }',
    '',
    '    function expected(description) {',
    '      throw peg$buildException(',
    '        null,',
    '        [{ type: "other", description: description }],',
    '        peg$reportedPos',
    '      );',
    '    }',
    '',
    '    function error(message) {',
    '      throw peg$buildException(message, null, peg$reportedPos);',
    '    }',
    '',
    '    function peg$computePosDetails(pos) {',
    '      function advance(details, startPos, endPos) {',
    '        var p, ch;',
    '',
    '        for (p = startPos; p < endPos; p++) {',
    '          ch = input.charAt(p);',
    '          if (ch === "\\n") {',
    '            if (!details.seenCR) { details.line++; }',
    '            details.column = 1;',
    '            details.seenCR = false;',
    '          } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {',
    '            details.line++;',
    '            details.column = 1;',
    '            details.seenCR = true;',
    '          } else {',
    '            details.column++;',
    '            details.seenCR = false;',
    '          }',
    '        }',
    '      }',
    '',
    '      if (peg$cachedPos !== pos) {',
    '        if (peg$cachedPos > pos) {',
    '          peg$cachedPos = 0;',
    '          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };',
    '        }',
    '        advance(peg$cachedPosDetails, peg$cachedPos, pos);',
    '        peg$cachedPos = pos;',
    '      }',
    '',
    '      return peg$cachedPosDetails;',
    '    }',
    '',
    '    function peg$fail(expected) {',
    '      if (peg$currPos < peg$maxFailPos) { return; }',
    '',
    '      if (peg$currPos > peg$maxFailPos) {',
    '        peg$maxFailPos = peg$currPos;',
    '        peg$maxFailExpected = [];',
    '      }',
    '',
    '      peg$maxFailExpected.push(expected);',
    '    }',
    '',
    '    function peg$buildException(message, expected, pos) {',
    '      function cleanupExpected(expected) {',
    '        var i = 1;',
    '',
    '        expected.sort(function(a, b) {',
    '          if (a.description < b.description) {',
    '            return -1;',
    '          } else if (a.description > b.description) {',
    '            return 1;',
    '          } else {',
    '            return 0;',
    '          }',
    '        });',
    '',
    /*
     * This works because the bytecode generator guarantees that every
     * expectation object exists only once, so it's enough to use |===| instead
     * of deeper structural comparison.
     */
    '        while (i < expected.length) {',
    '          if (expected[i - 1] === expected[i]) {',
    '            expected.splice(i, 1);',
    '          } else {',
    '            i++;',
    '          }',
    '        }',
    '      }',
    '',
    '      function buildMessage(expected, found) {',
    '        function stringEscape(s) {',
    '          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }',
    '',
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
     * literal except for the closing quote character, backslash, carriage
     * return, line separator, paragraph separator, and line feed. Any character
     * may appear in the form of an escape sequence.
     *
     * For portability, we also escape all control and non-ASCII characters.
     * Note that "\0" and "\v" escape sequences are not used because JSHint does
     * not like the first and IE the second.
     */
    '          return s',
    '            .replace(/\\\\/g,   \'\\\\\\\\\')', // backslash
    '            .replace(/"/g,    \'\\\\"\')',      // closing double quote
    '            .replace(/\\x08/g, \'\\\\b\')',     // backspace
    '            .replace(/\\t/g,   \'\\\\t\')',     // horizontal tab
    '            .replace(/\\n/g,   \'\\\\n\')',     // line feed
    '            .replace(/\\f/g,   \'\\\\f\')',     // form feed
    '            .replace(/\\r/g,   \'\\\\r\')',     // carriage return
    '            .replace(/[\\x00-\\x07\\x0B\\x0E\\x0F]/g, function(ch) { return \'\\\\x0\' + hex(ch); })',
    '            .replace(/[\\x10-\\x1F\\x80-\\xFF]/g,    function(ch) { return \'\\\\x\'  + hex(ch); })',
    '            .replace(/[\\u0180-\\u0FFF]/g,         function(ch) { return \'\\\\u0\' + hex(ch); })',
    '            .replace(/[\\u1080-\\uFFFF]/g,         function(ch) { return \'\\\\u\'  + hex(ch); });',
    '        }',
    '',
    '        var expectedDescs = new Array(expected.length),',
    '            expectedDesc, foundDesc, i;',
    '',
    '        for (i = 0; i < expected.length; i++) {',
    '          expectedDescs[i] = expected[i].description;',
    '        }',
    '',
    '        expectedDesc = expected.length > 1',
    '          ? expectedDescs.slice(0, -1).join(", ")',
    '              + " or "',
    '              + expectedDescs[expected.length - 1]',
    '          : expectedDescs[0];',
    '',
    '        foundDesc = found ? "\\"" + stringEscape(found) + "\\"" : "end of input";',
    '',
    '        return "Expected " + expectedDesc + " but " + foundDesc + " found.";',
    '      }',
    '',
    '      var posDetails = peg$computePosDetails(pos),',
    '          found      = pos < input.length ? input.charAt(pos) : null;',
    '',
    '      if (expected !== null) {',
    '        cleanupExpected(expected);',
    '      }',
    '',
    '      return new SyntaxError(',
    '        message !== null ? message : buildMessage(expected, found),',
    '        expected,',
    '        found,',
    '        pos,',
    '        posDetails.line,',
    '        posDetails.column',
    '      );',
    '    }',
    ''
  ].join('\n'));

  if (options.optimize === "size") {
    parts.push(indent4(generateInterpreter()));
    parts.push('');
  } else {
    utils.each(ast.rules, function(rule) {
      parts.push(indent4(generateRuleFunction(rule)));
      parts.push('');
    });
  }

  if (ast.initializer) {
    parts.push(indent4(ast.initializer.code));
    parts.push('');
  }

  if (options.optimize === "size") {
    parts.push('    peg$result = peg$parseRule(peg$startRuleIndex);');
  } else {
    parts.push('    peg$result = peg$startRuleFunction();');
  }

  parts.push([
    '',
    '    if (peg$result !== peg$FAILED && peg$currPos === input.length) {',
    '      return peg$result;',
    '    } else {',
    '      if (peg$result !== peg$FAILED && peg$currPos < input.length) {',
    '        peg$fail({ type: "end", description: "end of input" });',
    '      }',
    '',
    '      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);',
    '    }',
    '  }',
    '',
    '  return {',
    '    SyntaxError: SyntaxError,',
    '    parse:       parse',
    '  };',
    '})()'
  ].join('\n'));

  ast.code = parts.join('\n');
};

},{"../../utils":17,"../opcodes":8}],11:[function(require,module,exports){
var utils = require("../../utils");

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
module.exports = function(ast, options) {
  function isProxyRule(node) {
    return node.type === "rule" && node.expression.type === "rule_ref";
  }

  function replaceRuleRefs(ast, from, to) {
    function nop() {}

    function replaceInExpression(node, from, to) {
      replace(node.expression, from, to);
    }

    function replaceInSubnodes(propertyName) {
      return function(node, from, to) {
        utils.each(node[propertyName], function(subnode) {
          replace(subnode, from, to);
        });
      };
    }

    var replace = utils.buildNodeVisitor({
      grammar:      replaceInSubnodes("rules"),
      rule:         replaceInExpression,
      named:        replaceInExpression,
      choice:       replaceInSubnodes("alternatives"),
      sequence:     replaceInSubnodes("elements"),
      labeled:      replaceInExpression,
      text:         replaceInExpression,
      simple_and:   replaceInExpression,
      simple_not:   replaceInExpression,
      semantic_and: nop,
      semantic_not: nop,
      optional:     replaceInExpression,
      zero_or_more: replaceInExpression,
      one_or_more:  replaceInExpression,
      action:       replaceInExpression,

      rule_ref:
        function(node, from, to) {
          if (node.name === from) {
            node.name = to;
          }
        },

      literal:      nop,
      "class":      nop,
      any:          nop
    });

    replace(ast, from, to);
  }

  var indices = [];

  utils.each(ast.rules, function(rule, i) {
    if (isProxyRule(rule)) {
      replaceRuleRefs(ast, rule.name, rule.expression.name);
      if (!utils.contains(options.allowedStartRules, rule.name)) {
        indices.push(i);
      }
    }
  });

  indices.reverse();

  utils.each(indices, function(index) {
    ast.rules.splice(index, 1);
  });
};

},{"../../utils":17}],12:[function(require,module,exports){
var utils        = require("../../utils"),
    GrammarError = require("../../grammar-error");

/* Checks that no left recursion is present. */
module.exports = function(ast) {
  function nop() {}

  function checkExpression(node, appliedRules) {
    check(node.expression, appliedRules);
  }

  function checkSubnodes(propertyName) {
    return function(node, appliedRules) {
      utils.each(node[propertyName], function(subnode) {
        check(subnode, appliedRules);
      });
    };
  }

  var check = utils.buildNodeVisitor({
    grammar:     checkSubnodes("rules"),

    rule:
      function(node, appliedRules) {
        check(node.expression, appliedRules.concat(node.name));
      },

    named:       checkExpression,
    choice:      checkSubnodes("alternatives"),
    action:      checkExpression,

    sequence:
      function(node, appliedRules) {
        if (node.elements.length > 0) {
          check(node.elements[0], appliedRules);
        }
      },

    labeled:      checkExpression,
    text:         checkExpression,
    simple_and:   checkExpression,
    simple_not:   checkExpression,
    semantic_and: nop,
    semantic_not: nop,
    optional:     checkExpression,
    zero_or_more: checkExpression,
    one_or_more:  checkExpression,

    rule_ref:
      function(node, appliedRules) {
        if (utils.contains(appliedRules, node.name)) {
          throw new GrammarError(
            "Left recursion detected for rule \"" + node.name + "\"."
          );
        }
        check(utils.findRuleByName(ast, node.name), appliedRules);
      },

    literal:      nop,
    "class":      nop,
    any:          nop
  });

  check(ast, []);
};

},{"../../grammar-error":14,"../../utils":17}],13:[function(require,module,exports){
var utils        = require("../../utils"),
    GrammarError = require("../../grammar-error");

/* Checks that all referenced rules exist. */
module.exports = function(ast) {
  function nop() {}

  function checkExpression(node) { check(node.expression); }

  function checkSubnodes(propertyName) {
    return function(node) { utils.each(node[propertyName], check); };
  }

  var check = utils.buildNodeVisitor({
    grammar:      checkSubnodes("rules"),
    rule:         checkExpression,
    named:        checkExpression,
    choice:       checkSubnodes("alternatives"),
    action:       checkExpression,
    sequence:     checkSubnodes("elements"),
    labeled:      checkExpression,
    text:         checkExpression,
    simple_and:   checkExpression,
    simple_not:   checkExpression,
    semantic_and: nop,
    semantic_not: nop,
    optional:     checkExpression,
    zero_or_more: checkExpression,
    one_or_more:  checkExpression,

    rule_ref:
      function(node) {
        if (!utils.findRuleByName(ast, node.name)) {
          throw new GrammarError(
            "Referenced rule \"" + node.name + "\" does not exist."
          );
        }
      },

    literal:      nop,
    "class":      nop,
    any:          nop
  });

  check(ast);
};

},{"../../grammar-error":14,"../../utils":17}],14:[function(require,module,exports){
var utils = require("./utils");

/* Thrown when the grammar contains an error. */
module.exports = function(message) {
  this.name = "GrammarError";
  this.message = message;
};

utils.subclass(module.exports, Error);

},{"./utils":17}],15:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { grammar: peg$parsegrammar },
        peg$startRuleFunction  = peg$parsegrammar,

        peg$c0 = peg$FAILED,
        peg$c1 = null,
        peg$c2 = [],
        peg$c3 = function(initializer, rules) {
              return {
                type:        "grammar",
                initializer: initializer,
                rules:       rules
              };
            },
        peg$c4 = function(code) {
              return {
                type: "initializer",
                code: code
              };
            },
        peg$c5 = function(name, displayName, expression) {
              return {
                type:        "rule",
                name:        name,
                expression:  displayName !== null
                  ? {
                      type:       "named",
                      name:       displayName,
                      expression: expression
                    }
                  : expression
              };
            },
        peg$c6 = function(head, tail) {
              if (tail.length > 0) {
                var alternatives = [head].concat(utils.map(
                    tail,
                    function(element) { return element[1]; }
                ));
                return {
                  type:         "choice",
                  alternatives: alternatives
                };
              } else {
                return head;
              }
            },
        peg$c7 = function(elements, code) {
              var expression = elements.length !== 1
                ? {
                    type:     "sequence",
                    elements: elements
                  }
                : elements[0];
              return {
                type:       "action",
                expression: expression,
                code:       code
              };
            },
        peg$c8 = function(elements) {
              return elements.length !== 1
                ? {
                    type:     "sequence",
                    elements: elements
                  }
                : elements[0];
            },
        peg$c9 = function(label, expression) {
              return {
                type:       "labeled",
                label:      label,
                expression: expression
              };
            },
        peg$c10 = function(expression) {
              return {
                type:       "text",
                expression: expression
              };
            },
        peg$c11 = function(code) {
              return {
                type: "semantic_and",
                code: code
              };
            },
        peg$c12 = function(expression) {
              return {
                type:       "simple_and",
                expression: expression
              };
            },
        peg$c13 = function(code) {
              return {
                type: "semantic_not",
                code: code
              };
            },
        peg$c14 = function(expression) {
              return {
                type:       "simple_not",
                expression: expression
              };
            },
        peg$c15 = function(expression) {
              return {
                type:       "optional",
                expression: expression
              };
            },
        peg$c16 = function(expression) {
              return {
                type:       "zero_or_more",
                expression: expression
              };
            },
        peg$c17 = function(expression) {
              return {
                type:       "one_or_more",
                expression: expression
              };
            },
        peg$c18 = void 0,
        peg$c19 = function(name) {
              return {
                type: "rule_ref",
                name: name
              };
            },
        peg$c20 = function() { return { type: "any" }; },
        peg$c21 = function(expression) { return expression; },
        peg$c22 = { type: "other", description: "action" },
        peg$c23 = function(braced) { return braced.substr(1, braced.length - 2); },
        peg$c24 = "{",
        peg$c25 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c26 = "}",
        peg$c27 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c28 = /^[^{}]/,
        peg$c29 = { type: "class", value: "[^{}]", description: "[^{}]" },
        peg$c30 = "=",
        peg$c31 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c32 = function() { return "="; },
        peg$c33 = ":",
        peg$c34 = { type: "literal", value: ":", description: "\":\"" },
        peg$c35 = function() { return ":"; },
        peg$c36 = ";",
        peg$c37 = { type: "literal", value: ";", description: "\";\"" },
        peg$c38 = function() { return ";"; },
        peg$c39 = "/",
        peg$c40 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c41 = function() { return "/"; },
        peg$c42 = "&",
        peg$c43 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c44 = function() { return "&"; },
        peg$c45 = "!",
        peg$c46 = { type: "literal", value: "!", description: "\"!\"" },
        peg$c47 = function() { return "!"; },
        peg$c48 = "$",
        peg$c49 = { type: "literal", value: "$", description: "\"$\"" },
        peg$c50 = function() { return "$"; },
        peg$c51 = "?",
        peg$c52 = { type: "literal", value: "?", description: "\"?\"" },
        peg$c53 = function() { return "?"; },
        peg$c54 = "*",
        peg$c55 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c56 = function() { return "*"; },
        peg$c57 = "+",
        peg$c58 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c59 = function() { return "+"; },
        peg$c60 = "(",
        peg$c61 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c62 = function() { return "("; },
        peg$c63 = ")",
        peg$c64 = { type: "literal", value: ")", description: "\")\"" },
        peg$c65 = function() { return ")"; },
        peg$c66 = ".",
        peg$c67 = { type: "literal", value: ".", description: "\".\"" },
        peg$c68 = function() { return "."; },
        peg$c69 = { type: "other", description: "identifier" },
        peg$c70 = "_",
        peg$c71 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c72 = function(chars) { return chars; },
        peg$c73 = { type: "other", description: "literal" },
        peg$c74 = "i",
        peg$c75 = { type: "literal", value: "i", description: "\"i\"" },
        peg$c76 = function(value, flags) {
              return {
                type:       "literal",
                value:      value,
                ignoreCase: flags === "i"
              };
            },
        peg$c77 = { type: "other", description: "string" },
        peg$c78 = function(string) { return string; },
        peg$c79 = "\"",
        peg$c80 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c81 = function(chars) { return chars.join(""); },
        peg$c82 = "\\",
        peg$c83 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c84 = { type: "any", description: "any character" },
        peg$c85 = function(char_) { return char_; },
        peg$c86 = "'",
        peg$c87 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c88 = { type: "other", description: "character class" },
        peg$c89 = "[",
        peg$c90 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c91 = "^",
        peg$c92 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c93 = "]",
        peg$c94 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c95 = function(inverted, parts, flags) {
              var partsConverted = utils.map(parts, function(part) { return part.data; });
              var rawText = "["
                + (inverted !== null ? inverted : "")
                + utils.map(parts, function(part) { return part.rawText; }).join("")
                + "]"
                + (flags !== null ? flags : "");

              return {
                type:       "class",
                parts:      partsConverted,
                // FIXME: Get the raw text from the input directly.
                rawText:    rawText,
                inverted:   inverted === "^",
                ignoreCase: flags === "i"
              };
            },
        peg$c96 = "-",
        peg$c97 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c98 = function(begin, end) {
              if (begin.data.charCodeAt(0) > end.data.charCodeAt(0)) {
                error(
                  "Invalid character range: " + begin.rawText + "-" + end.rawText + "."
                );
              }

              return {
                data:    [begin.data, end.data],
                // FIXME: Get the raw text from the input directly.
                rawText: begin.rawText + "-" + end.rawText
              };
            },
        peg$c99 = function(char_) {
              return {
                data:    char_,
                // FIXME: Get the raw text from the input directly.
                rawText: utils.quoteForRegexpClass(char_)
              };
            },
        peg$c100 = "x",
        peg$c101 = { type: "literal", value: "x", description: "\"x\"" },
        peg$c102 = "u",
        peg$c103 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c104 = function(char_) {
              return char_
                .replace("b", "\b")
                .replace("f", "\f")
                .replace("n", "\n")
                .replace("r", "\r")
                .replace("t", "\t")
                .replace("v", "\x0B"); // IE does not recognize "\v".
            },
        peg$c105 = "\\0",
        peg$c106 = { type: "literal", value: "\\0", description: "\"\\\\0\"" },
        peg$c107 = function() { return "\x00"; },
        peg$c108 = "\\x",
        peg$c109 = { type: "literal", value: "\\x", description: "\"\\\\x\"" },
        peg$c110 = function(digits) {
              return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c111 = "\\u",
        peg$c112 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c113 = function(eol) { return eol; },
        peg$c114 = /^[0-9]/,
        peg$c115 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c116 = /^[0-9a-fA-F]/,
        peg$c117 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
        peg$c118 = /^[a-z]/,
        peg$c119 = { type: "class", value: "[a-z]", description: "[a-z]" },
        peg$c120 = /^[A-Z]/,
        peg$c121 = { type: "class", value: "[A-Z]", description: "[A-Z]" },
        peg$c122 = { type: "other", description: "comment" },
        peg$c123 = "//",
        peg$c124 = { type: "literal", value: "//", description: "\"//\"" },
        peg$c125 = "/*",
        peg$c126 = { type: "literal", value: "/*", description: "\"/*\"" },
        peg$c127 = "*/",
        peg$c128 = { type: "literal", value: "*/", description: "\"*/\"" },
        peg$c129 = { type: "other", description: "end of line" },
        peg$c130 = "\n",
        peg$c131 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c132 = "\r\n",
        peg$c133 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
        peg$c134 = "\r",
        peg$c135 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c136 = "\u2028",
        peg$c137 = { type: "literal", value: "\u2028", description: "\"\\u2028\"" },
        peg$c138 = "\u2029",
        peg$c139 = { type: "literal", value: "\u2029", description: "\"\\u2029\"" },
        peg$c140 = /^[\n\r\u2028\u2029]/,
        peg$c141 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
        peg$c142 = { type: "other", description: "whitespace" },
        peg$c143 = /^[ \t\x0B\f\xA0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/,
        peg$c144 = { type: "class", value: "[ \\t\\x0B\\f\\xA0\\uFEFF\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]", description: "[ \\t\\x0B\\f\\xA0\\uFEFF\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsegrammar() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinitializer();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parserule();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parserule();
            }
          } else {
            s3 = peg$c0;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c3(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseinitializer() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseaction();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesemicolon();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserule() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseidentifier();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsestring();
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseequals();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechoice();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsesemicolon();
              if (s5 === peg$FAILED) {
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c5(s1, s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsechoice() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsesequence();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parseslash();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesequence();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parseslash();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsesequence();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesequence() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parselabeled();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parselabeled();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseaction();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c7(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parselabeled();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parselabeled();
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c8(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parselabeled() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseidentifier();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecolon();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseprefixed();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c9(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseprefixed();
      }

      return s0;
    }

    function peg$parseprefixed() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsedollar();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsesuffixed();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c10(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseand();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseaction();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c11(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseand();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsesuffixed();
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c12(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsenot();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseaction();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c13(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsenot();
              if (s1 !== peg$FAILED) {
                s2 = peg$parsesuffixed();
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c14(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parsesuffixed();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsesuffixed() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseprimary();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsequestion();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c15(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseprimary();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsestar();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c16(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseprimary();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseplus();
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c17(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseprimary();
          }
        }
      }

      return s0;
    }

    function peg$parseprimary() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseidentifier();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$currPos;
        s4 = peg$parsestring();
        if (s4 === peg$FAILED) {
          s4 = peg$c1;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseequals();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c18;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c19(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseliteral();
        if (s0 === peg$FAILED) {
          s0 = peg$parseclass();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsedot();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c20();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parselparen();
              if (s1 !== peg$FAILED) {
                s2 = peg$parsechoice();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parserparen();
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c21(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseaction() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsebraced();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c23(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
      }

      return s0;
    }

    function peg$parsebraced() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s2 = peg$c24;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c25); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsebraced();
        if (s4 === peg$FAILED) {
          s4 = peg$parsenonBraceCharacters();
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsebraced();
          if (s4 === peg$FAILED) {
            s4 = peg$parsenonBraceCharacters();
          }
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s4 = peg$c26;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c27); }
          }
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenonBraceCharacters() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsenonBraceCharacter();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parsenonBraceCharacter();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenonBraceCharacter() {
      var s0;

      if (peg$c28.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }

      return s0;
    }

    function peg$parseequals() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c30;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c32();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecolon() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s1 = peg$c33;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesemicolon() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 59) {
        s1 = peg$c36;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c38();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseslash() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c39;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c41();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseand() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c42;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c44();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenot() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 33) {
        s1 = peg$c45;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c46); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c47();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedollar() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 36) {
        s1 = peg$c48;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c50();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsequestion() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 63) {
        s1 = peg$c51;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsestar() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c54;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c56();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseplus() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 43) {
        s1 = peg$c57;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c59();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parselparen() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c60;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c62();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserparen() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 41) {
        s1 = peg$c63;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c64); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c65();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedot() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c66;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c68();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseidentifier() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      s3 = peg$parseletter();
      if (s3 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 95) {
          s3 = peg$c70;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c71); }
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parseletter();
        if (s5 === peg$FAILED) {
          s5 = peg$parsedigit();
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 95) {
              s5 = peg$c70;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c71); }
            }
          }
        }
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parseletter();
          if (s5 === peg$FAILED) {
            s5 = peg$parsedigit();
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 95) {
                s5 = peg$c70;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c71); }
              }
            }
          }
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c0;
      }
      if (s2 !== peg$FAILED) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c72(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }

      return s0;
    }

    function peg$parseliteral() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsedoubleQuotedString();
      if (s1 === peg$FAILED) {
        s1 = peg$parsesingleQuotedString();
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 105) {
          s2 = peg$c74;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c75); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c76(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c73); }
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsedoubleQuotedString();
      if (s1 === peg$FAILED) {
        s1 = peg$parsesingleQuotedString();
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c78(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c77); }
      }

      return s0;
    }

    function peg$parsedoubleQuotedString() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c79;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsedoubleQuotedCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsedoubleQuotedCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c79;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c80); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c81(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedoubleQuotedCharacter() {
      var s0;

      s0 = peg$parsesimpleDoubleQuotedCharacter();
      if (s0 === peg$FAILED) {
        s0 = peg$parsesimpleEscapeSequence();
        if (s0 === peg$FAILED) {
          s0 = peg$parsezeroEscapeSequence();
          if (s0 === peg$FAILED) {
            s0 = peg$parsehexEscapeSequence();
            if (s0 === peg$FAILED) {
              s0 = peg$parseunicodeEscapeSequence();
              if (s0 === peg$FAILED) {
                s0 = peg$parseeolEscapeSequence();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleDoubleQuotedCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c79;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c82;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c83); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parseeolChar();
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c18;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c84); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c85(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesingleQuotedString() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c86;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c87); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsesingleQuotedCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsesingleQuotedCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c86;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c87); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c81(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesingleQuotedCharacter() {
      var s0;

      s0 = peg$parsesimpleSingleQuotedCharacter();
      if (s0 === peg$FAILED) {
        s0 = peg$parsesimpleEscapeSequence();
        if (s0 === peg$FAILED) {
          s0 = peg$parsezeroEscapeSequence();
          if (s0 === peg$FAILED) {
            s0 = peg$parsehexEscapeSequence();
            if (s0 === peg$FAILED) {
              s0 = peg$parseunicodeEscapeSequence();
              if (s0 === peg$FAILED) {
                s0 = peg$parseeolEscapeSequence();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleSingleQuotedCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c86;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c87); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c82;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c83); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parseeolChar();
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c18;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c84); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c85(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseclass() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c89;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 94) {
          s2 = peg$c91;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c92); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseclassCharacterRange();
          if (s4 === peg$FAILED) {
            s4 = peg$parseclassCharacter();
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseclassCharacterRange();
            if (s4 === peg$FAILED) {
              s4 = peg$parseclassCharacter();
            }
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s4 = peg$c93;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c94); }
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 105) {
                s5 = peg$c74;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c75); }
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c95(s2, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
      }

      return s0;
    }

    function peg$parseclassCharacterRange() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseclassCharacter();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s2 = peg$c96;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c97); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseclassCharacter();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c98(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseclassCharacter() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsebracketDelimitedCharacter();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c99(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsebracketDelimitedCharacter() {
      var s0;

      s0 = peg$parsesimpleBracketDelimitedCharacter();
      if (s0 === peg$FAILED) {
        s0 = peg$parsesimpleEscapeSequence();
        if (s0 === peg$FAILED) {
          s0 = peg$parsezeroEscapeSequence();
          if (s0 === peg$FAILED) {
            s0 = peg$parsehexEscapeSequence();
            if (s0 === peg$FAILED) {
              s0 = peg$parseunicodeEscapeSequence();
              if (s0 === peg$FAILED) {
                s0 = peg$parseeolEscapeSequence();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleBracketDelimitedCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 93) {
        s2 = peg$c93;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c94); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c82;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c83); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parseeolChar();
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c18;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c84); }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c85(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesimpleEscapeSequence() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c82;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parsedigit();
        if (s3 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 120) {
            s3 = peg$c100;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c101); }
          }
          if (s3 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 117) {
              s3 = peg$c102;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c103); }
            }
            if (s3 === peg$FAILED) {
              s3 = peg$parseeolChar();
            }
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c18;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c104(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsezeroEscapeSequence() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c105) {
        s1 = peg$c105;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c106); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parsedigit();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c18;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c107();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehexEscapeSequence() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c108) {
        s1 = peg$c108;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c109); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$currPos;
        s4 = peg$parsehexDigit();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsehexDigit();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c110(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseunicodeEscapeSequence() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c111) {
        s1 = peg$c111;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c112); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$currPos;
        s4 = peg$parsehexDigit();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsehexDigit();
          if (s5 !== peg$FAILED) {
            s6 = peg$parsehexDigit();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsehexDigit();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c110(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseeolEscapeSequence() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c82;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseeol();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c113(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c114.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c115); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c116.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c117); }
      }

      return s0;
    }

    function peg$parseletter() {
      var s0;

      s0 = peg$parselowerCaseLetter();
      if (s0 === peg$FAILED) {
        s0 = peg$parseupperCaseLetter();
      }

      return s0;
    }

    function peg$parselowerCaseLetter() {
      var s0;

      if (peg$c118.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }

      return s0;
    }

    function peg$parseupperCaseLetter() {
      var s0;

      if (peg$c120.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c121); }
      }

      return s0;
    }

    function peg$parse__() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsewhitespace();
      if (s1 === peg$FAILED) {
        s1 = peg$parseeol();
        if (s1 === peg$FAILED) {
          s1 = peg$parsecomment();
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseeol();
          if (s1 === peg$FAILED) {
            s1 = peg$parsecomment();
          }
        }
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$parsesingleLineComment();
      if (s0 === peg$FAILED) {
        s0 = peg$parsemultiLineComment();
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c122); }
      }

      return s0;
    }

    function peg$parsesingleLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c123) {
        s1 = peg$c123;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseeolChar();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c18;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseeolChar();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c18;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c84); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemultiLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c125) {
        s1 = peg$c125;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c126); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c127) {
          s5 = peg$c127;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c128); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c18;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c84); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c127) {
            s5 = peg$c127;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c128); }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c18;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c84); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c127) {
            s3 = peg$c127;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c128); }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseeol() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c130;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c131); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c132) {
          s0 = peg$c132;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c133); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s0 = peg$c134;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c135); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 8232) {
              s0 = peg$c136;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c137); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 8233) {
                s0 = peg$c138;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c139); }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c129); }
      }

      return s0;
    }

    function peg$parseeolChar() {
      var s0;

      if (peg$c140.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c141); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c143.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c144); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c142); }
      }

      return s0;
    }


      var utils = require("./utils");


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./utils":17}],16:[function(require,module,exports){
var utils = require("./utils");

module.exports = {
  /* PEG.js version (uses semantic versioning). */
  VERSION: "0.8.0",

  GrammarError: require("./grammar-error"),
  parser:       require("./parser"),
  compiler:     require("./compiler"),

  /*
   * Generates a parser from a specified grammar and returns it.
   *
   * The grammar must be a string in the format described by the metagramar in
   * the parser.pegjs file.
   *
   * Throws |PEG.parser.SyntaxError| if the grammar contains a syntax error or
   * |PEG.GrammarError| if it contains a semantic error. Note that not all
   * errors are detected during the generation and some may protrude to the
   * generated parser and cause its malfunction.
   */
  buildParser: function(grammar) {
    function convertPasses(passes) {
      var converted = {}, stage;

      for (stage in passes) {
        if (passes.hasOwnProperty(stage)) {
          converted[stage] = utils.values(passes[stage]);
        }
      }

      return converted;
    }

    var options = arguments.length > 1 ? utils.clone(arguments[1]) : {},
        plugins = "plugins" in options ? options.plugins : [],
        config  = {
          parser: this.parser,
          passes: convertPasses(this.compiler.passes)
        };

    utils.each(plugins, function(p) { p.use(config, options); });

    return this.compiler.compile(
      config.parser.parse(grammar),
      config.passes,
      options
    );
  }
};

},{"./compiler":7,"./grammar-error":14,"./parser":15,"./utils":17}],17:[function(require,module,exports){
var utils = {
  /* Like Python's |range|, but without |step|. */
  range: function(start, stop) {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }

    var result = new Array(Math.max(0, stop - start));
    for (var i = 0, j = start; j < stop; i++, j++) {
      result[i] = j;
    }
    return result;
  },

  find: function(array, callback) {
    var length = array.length;
    for (var i = 0; i < length; i++) {
      if (callback(array[i])) {
        return array[i];
      }
    }
  },

  indexOf: function(array, callback) {
    var length = array.length;
    for (var i = 0; i < length; i++) {
      if (callback(array[i])) {
        return i;
      }
    }
    return -1;
  },

  contains: function(array, value) {
    /*
     * Stupid IE does not have Array.prototype.indexOf, otherwise this function
     * would be a one-liner.
     */
    var length = array.length;
    for (var i = 0; i < length; i++) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
  },

  each: function(array, callback) {
    var length = array.length;
    for (var i = 0; i < length; i++) {
      callback(array[i], i);
    }
  },

  map: function(array, callback) {
    var result = [];
    var length = array.length;
    for (var i = 0; i < length; i++) {
      result[i] = callback(array[i], i);
    }
    return result;
  },

  pluck: function(array, key) {
    return utils.map(array, function (e) { return e[key]; });
  },

  keys: function(object) {
    var result = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(key);
      }
    }
    return result;
  },

  values: function(object) {
    var result = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key]);
      }
    }
    return result;
  },

  clone: function(object) {
    var result = {};
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = object[key];
      }
    }
    return result;
  },

  defaults: function(object, defaults) {
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (!(key in object)) {
          object[key] = defaults[key];
        }
      }
    }
  },

  /*
   * The code needs to be in sync with the code template in the compilation
   * function for "action" nodes.
   */
  subclass: function(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  },

  /*
   * Returns a string padded on the left to a desired length with a character.
   *
   * The code needs to be in sync with the code template in the compilation
   * function for "action" nodes.
   */
  padLeft: function(input, padding, length) {
    var result = input;

    var padLength = length - input.length;
    for (var i = 0; i < padLength; i++) {
      result = padding + result;
    }

    return result;
  },

  /*
   * Returns an escape sequence for given character. Uses \x for characters <=
   * 0xFF to save space, \u for the rest.
   *
   * The code needs to be in sync with the code template in the compilation
   * function for "action" nodes.
   */
  escape: function(ch) {
    var charCode = ch.charCodeAt(0);
    var escapeChar;
    var length;

    if (charCode <= 0xFF) {
      escapeChar = 'x';
      length = 2;
    } else {
      escapeChar = 'u';
      length = 4;
    }

    return '\\' + escapeChar + utils.padLeft(charCode.toString(16).toUpperCase(), '0', length);
  },

  /*
   * Surrounds the string with quotes and escapes characters inside so that the
   * result is a valid JavaScript string.
   *
   * The code needs to be in sync with the code template in the compilation
   * function for "action" nodes.
   */
  quote: function(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
     * literal except for the closing quote character, backslash, carriage
     * return, line separator, paragraph separator, and line feed. Any character
     * may appear in the form of an escape sequence.
     *
     * For portability, we also escape all control and non-ASCII characters.
     * Note that "\0" and "\v" escape sequences are not used because JSHint does
     * not like the first and IE the second.
     */
    return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, utils.escape)
      + '"';
  },

  /*
   * Escapes characters inside the string so that it can be used as a list of
   * characters in a character class of a regular expression.
   */
  quoteForRegexpClass: function(s) {
    /*
     * Based on ECMA-262, 5th ed., 7.8.5 & 15.10.1.
     *
     * For portability, we also escape all control and non-ASCII characters.
     */
    return s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/\//g, '\\/')   // closing slash
      .replace(/\]/g, '\\]')   // closing bracket
      .replace(/\^/g, '\\^')   // caret
      .replace(/-/g,  '\\-')   // dash
      .replace(/\0/g, '\\0')   // null
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\v/g, '\\x0B') // vertical tab
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x01-\x08\x0E-\x1F\x80-\uFFFF]/g, utils.escape);
  },

  /*
   * Builds a node visitor -- a function which takes a node and any number of
   * other parameters, calls an appropriate function according to the node type,
   * passes it all its parameters and returns its value. The functions for
   * various node types are passed in a parameter to |buildNodeVisitor| as a
   * hash.
   */
  buildNodeVisitor: function(functions) {
    return function(node) {
      return functions[node.type].apply(null, arguments);
    };
  },

  findRuleByName: function(ast, name) {
    return utils.find(ast.rules, function(r) { return r.name === name; });
  },

  indexOfRuleByName: function(ast, name) {
    return utils.indexOf(ast.rules, function(r) { return r.name === name; });
  }
};

module.exports = utils;

},{}],18:[function(require,module,exports){
(function (__dirname){
var fs = require('fs');
var PEG = require("pegjs");
var util = require('util');
var combinatorics = require('./js-combinatorics/combinatorics.js').Combinatorics;

/*
AI Planning with STRIPS and PDDL.

Copyright (c) 2015 Kory Becker
http://primaryobjects.com/kory-becker

License MIT
*/

StripsManager = {
    // Set to false to use baseN() instead of permutationCombination() for parameter values. It will be slower, but will utilize all possible solutions. This allows rendering of 'complementary actions', such as 'Action A on A', where normally you want 'Action A on B'.
    fast: true,
    // Set to true to display status information on the console while searching for a solution.
    verbose: false,
    // Set to redirect output to different stream, uses console.log() by default.
    output: function(text) { console.log(text); },
    // PEG.js grammar for domain.
    grammarDomainPath: '/grammar/grammar-domain.txt',
    // PEG.js grammer for problem.
    grammarProblemPath: '/grammar/grammar-problem.txt',

    loadCode: function(grammarFileName, code, callback) {
        // Applies a PEG.js grammar against a code string and returns the parsed JSON result.
        //fs.readFile(grammarFileName, 'utf8', function(err, grammar) {
        //    if (err) throw err;
        var xmlhttp = new XMLHttpRequest();
        var url = grammarFileName;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var grammar = xmlhttp.responseText;
                var parser = PEG.buildParser(grammar);
             
                if (callback) {
                    try {
                      callback(parser.parse(code));
                    }
                    catch (excep) {
                      StripsManager.output(excep.message);
                    }
                }            
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        //});
    },

    loadGrammar: function(grammarFileName, codeFileName, callback) {
        // Applies a PEG.js grammar against a code file and returns the parsed JSON result.
        fs.readFile(codeFileName, 'utf8', function(err, code) {
            if (err) throw err;

            StripsManager.loadCode(grammarFileName, code, function(result) {
                if (callback) {
                    callback(result);
                }
            });
        });
    },

    loadDomain: function(filePath, callback, isCode) {
        // Applies the PEG.js grammar for a STRIPS PDDL domain file and returns the parsed JSON result.
        if (!isCode) {
            StripsManager.loadGrammar(StripsManager.grammarDomainPath, filePath, function(result) {
                // Load from file path.
                if (callback) {
                    callback(result);
                }
            });
        }
        else {
            // Load from string.
            StripsManager.loadCode(StripsManager.grammarDomainPath, filePath, function(result) {
                if (callback) {
                    callback(result);
                }
            });            
        }
    },

    loadProblem: function(filePath, callback, isCode) {
        // Applies the PEG.js grammar for a STRIPS PDDL problem file and returns the parsed JSON result.
        if (!isCode) {
            // Load from file path.
            StripsManager.loadGrammar(StripsManager.grammarProblemPath, filePath, function(problem) {
                StripsManager.initializeProblem(problem, callback)
            });
        }
        else {
            // Load from string.
            StripsManager.loadCode(StripsManager.grammarProblemPath, filePath, function(problem) {
                StripsManager.initializeProblem(problem, callback)
            });            
        }
    },
    
    initializeProblem: function(problem, callback) {
        // Populate list of parameter values.
        var values = {};
        for (var i in problem.states) {
            var state = problem.states[i];
            for (var j in state.actions) {
                var action = state.actions[j];

                // Collect all unique parameter values.
                for (var k in action.parameters) {
                    values[action.parameters[k]] = 1;
                }
            }
        }

        // Set parameter values list on problem.
        problem.values = {};
        for (var key in values) {
            // Look-up type for this value in the objects declaration.
            var type = null;

            for (var i in problem.objects) {
                for (var j in problem.objects[i].parameters) {
                    var parameter = problem.objects[i].parameters[j];
                    if (parameter == key) {
                        type = problem.objects[i].type;
                        break;
                    }
                }

                if (type)
                    break;
            }

            problem.values[type] = problem.values[type] || [];
            problem.values[type].push(key);
        }

        if (callback) {
            callback(problem);
        }
    },

    load: function(domainPath, problemPath, callback, isCode) {
        // Load the domain and actions. If isCode is true, domainPath and problemPath are strings of PDDL code, otherwise they are filePaths.
        StripsManager.loadDomain(domainPath, function(domain) {
            // Load the problem.
            StripsManager.loadProblem(problemPath, function(problem) {
                // Give a copy of the possible parameter values to the domain.
                domain.values = problem.values;

                if (domain.requirements.indexOf('typing') != -1 && domain.values.null) {
                    StripsManager.output('ERROR: :typing is specified in domain, but not all parameters declare a type. Verify problem file contains an :objects section.');
                }

                // Load list of applicable combinations of parameter values for each action.
                for (var i in domain.actions) {
                    // Get all applicable parameter combinations for the current action.
                    domain.actions[i].parameterCombinations = StripsManager.parameterCombinations(domain, domain.actions[i]);
                }

                if (callback) {
                    callback(domain, problem);
                }
            }, isCode);
        }, isCode);
    },

    predicateCombinations: function(state) {
        // For "Blocks World" problems, combinatorics.permutationCombination(state) is sufficient and faster, but otherwise, baseN(state) gives the full range of possible parameter values.
        // First, convert the values object { block: [ 'a', 'b'], table: ['x', 'y'] } into a flat array [ 'a', 'b', 'x', 'y' ].
        var values = [];
        for (var key in state) {
            for (var i in state[key]) {
                values.push(state[key][i]);
            }
        }

        var cmb = StripsManager.fast ? combinatorics.permutationCombination(values) : combinatorics.baseN(values);

        return cmb.toArray();
    },
    
    parameterCombinations: function(domain, action) {
        // Go through each required parameter, look at the type (if using :typing), and use all combinations of values belonging to that type.
        var cases = [];
        var parameters = action.parameters;

        // Is :typing enabled on the domain?
        if (domain.requirements.indexOf('typing') > -1) {
            // First, get a count of how many parameters we need of each type.
            var error = false;
            var typeCounts = {};
            for (var j in parameters) {
                if (!parameters[j].type) {
                    StripsManager.output('ERROR: :typing is specified, but no type found in action "' + action.action + '" for parameter "' + parameters[j].parameter + '"');
                    error = true;
                    break;
                }

                typeCounts[parameters[j].type] = (typeCounts[parameters[j].type] + 1) || 1;
            }

            if (!error) {
                // Next, get the combination values.
                for (var key in typeCounts) {
                    // Get all combination values for this parameter type.
                    var values = domain.values[key];
                    var cmb = combinatorics.baseN(values, 1);

                    cmb.forEach(function(combo) {
                        cases.push(combo);
                    });
                }
            }

            // Get a combination of all possibilities of the discovered parameters.
            var cmb = StripsManager.fast ? combinatorics.permutation(cases, parameters.length) : combinatorics.baseN(cases, parameters.length);

            // Filter the combinations to valid parameter types and unique combos.
            var uniqueCombos = {};
            cases = cmb.filter(function (combo) {
                // Does this combo have valid values for the type? Make sure each value to be set for a parameter index exists in the list of types under the domain.
                var key = '';

                for (var ci in combo) {
                    var value = combo[ci][0];
                    var type = parameters[ci].type;
                    key += value;

                    // Check if this value exists in the list for this type.
                    if (domain.values[type].indexOf(value) == -1) {
                        // The value is not part of this type, that means this combo is invalid.
                        return false;
                    }
                }

                if (uniqueCombos[key]) {
                    // Duplicate combo. Since we only take the first value in any lists as 1 value per parameter, we can end up with duplicates.
                    return false;
                }

                uniqueCombos[key] = 1;

                return true;
            });

            var cases2 = [];
            for (var j in cases) {
                var subCase = [];
                for (var k in cases[j]) {
                    subCase.push(cases[j][k][0]);
                }

                cases2.push(subCase);
            }

            cases = cases2;
        }
        else {
            // Typing not being used, just get all action combinations for the current state.
            cases = StripsManager.predicateCombinations(domain.values);
        }

        return cases;
    },

    andCount: function(precondition) {
        // Returns the count for the number of 'and' matches in a precondition.
        var count = 0;
        
        for (var i in precondition) {
            var action = precondition[i];
            var operation = action.operation || 'and'; // If no operation is specified, default to 'and'. Must explicitly provide 'not' where required.
            
            if (operation == 'and') {
                count++;
            }
        }
        
        return count;
    },
    
    isEqual: function(action1, action2) {
        // Returns true if action1 == action2. Compares name and parameters.
        var result = false;

        // Find matching action name.
        if (action1.action == action2.action && action1.parameters.length == action2.parameters.length) {
            result = true;

            // Find matching parameters.
            for (var k in action1.parameters) {
                // Use the map, if available (in the case of a non-concrete action). Otherwise, use the concrete parameter values.
                var value1 = action1.parameters[k].parameter ? action1.parameters[k].parameter : action1.parameters[k];
                var value2 = action2.parameters[k].parameter ? action2.parameters[k].parameter : action2.parameters[k];

                var parameter1 = action1.map ? action1.map[value1] : value1;
                var parameter2 = action2.map ? action2.map[value2] : value2;

                if (parameter1 != parameter2) {
                    result = false;
                    break;
                }
            }
        }
        
        return result;
    },

    isPreconditionSatisfied: function(state, precondition) {
        // Returns true if the precondition is satisfied in the current state.
        // This function works by making sure all 'and' preconditions exist in the state, and that all 'not' preconditions do not exist in the state.
        var matchCount = 0;
        var andCount = StripsManager.andCount(precondition); // The state needs to contain the actions in action.precondition for 'and'. For 'not', we fail immediately. So, let's count the number of 'and' matches and make sure we satisfy them.

        for (var i = 0; i < precondition.length; i++) {
            // Find a case that contains this action and parameters.
            for (var l in state.actions) {
                var match = true;
                operation = precondition[i].operation || 'and'; // If no operation is specified, default to 'and'. Must explicitly provide 'not' where required.

                // Check if the name and number of parameters match for the current action and precondition.
                if (state.actions[l].action == precondition[i].action && state.actions[l].parameters.length == precondition[i].parameters.length) {
                    // Check if the parameter values match.
                    for (var m in precondition[i].parameters) {
                        if (precondition[i].parameters[m] != state.actions[l].parameters[m]) {
                            match = false;
                        }
                    }
                }
                else {
                    match = false;
                }

                if (match) {
                    // This action exists in the state.                    
                    if (operation == 'and') {
                        matchCount++;
                    }
                    else {
                        // Not, set to -1 so this action is not saved as applicable.
                        matchCount = -1;
                        break;
                    }
                }
            }
            
            if (matchCount == -1)
                break;
        }
        
        return (matchCount == andCount);
    },

    getApplicableActionInState: function(state, action) {
        // This function returns an applicable concrete action for the given state, or null if the precondition is not satisfied.
        var resolvedAction = null;

        // Does the filled-in precondition exist in the state test cases?
        if (StripsManager.isPreconditionSatisfied(state, action.precondition)) {
            // This action is applicable.
            // Assign a value to each parameter of the effect.
            var populatedEffect = JSON.parse(JSON.stringify(action.effect));
            for (var m in action.effect) {
                var effect = action.effect[m];

                for (var n in effect.parameters) {
                    var parameter = effect.parameters[n];
                    var value = action.map[parameter];
                    
                    if (value) {
                        // Assign this value to all instances of this parameter in the effect.
                        populatedEffect[m].parameters[n] = value;
                    }
                    else {
                        StripsManager.output('* ERROR: Value not found for parameter ' + parameter + '.');
                    }
                }
            }
            
            resolvedAction = JSON.parse(JSON.stringify(action));
            resolvedAction.effect = populatedEffect;
            resolvedAction.map = action.map;
        }
        
        return resolvedAction;
    },
    
    applicableActionsPlus: function(domain, state) {
        // Returns an array of applicable concrete actions for the current state, including support for negative literals. This method runs StripsManager.applicableActions() two times - one with all positive literals (negative literals removed, which effectively renders all positive literal cases), and one with all positive literals with none that had matching negative literals (which effectively renders all negative literal cases). The result includes a list of unique actions.
        var result = [];
        var actionHash = {};

        // Remove negative literals.
        var stateNoNegatives = JSON.parse(JSON.stringify(state));
        stateNoNegatives.actions = [];
        for (var i in state.actions) {
            var action = state.actions[i];

            if (action.operation != 'not') {
                // Not a negative literal, so keep it.
                stateNoNegatives.actions.push(action);
            }
        }

        // Get applicable actions.
        var actions = StripsManager.applicableActions(domain, stateNoNegatives);

        // Mark each action as discovered.
        for (var i in actions) {
            var action = actions[i];

            result.push(action);
            actionHash[JSON.stringify(action)] = 1;
        }

        // Remove matching positive and negative literals, effectively rendering the negative literal.
        var literalsToRemove = {};
        var stateNoPositiveNegatives = JSON.parse(JSON.stringify(state));
        stateNoPositiveNegatives.actions = [];

        // First, collect negative literals.
        for (var i in state.actions) {
            var action = state.actions[i];
            action.operation = action.operation || 'and';

            if (action.operation == 'not') {
                // Make a copy of the positive version of this literal.
                var copyAction = JSON.parse(JSON.stringify(action));
                copyAction.operation = 'and';

                // Mark the positive version of this literal to be removed (if we come across it).
                literalsToRemove[JSON.stringify(copyAction)] = 1;
            }
        }

        // Now that we've marked negative literals, go through all literals and only keep those which are positive and not included in the literalsToRemove.
        for (var i in state.actions) {
            var action = state.actions[i];
            action.operation = action.operation || 'and';

            // If this is a positive literal and not in our literalsToRemove list, then include it.
            if (action.operation != 'not' && !literalsToRemove[JSON.stringify(action)]) {
                // Safe to keep this literal.
                stateNoPositiveNegatives.actions.push(action);
            }
        }

        // Get applicable actions when allowing for negative literals.
        actions = StripsManager.applicableActions(domain, stateNoPositiveNegatives);

        // Concat new actions.
        for (var i in actions) {
            var action = actions[i];

            if (!actionHash[JSON.stringify(action)]) {
              result.push(action);
            }
        }

        return result;
    },

    applicableActions: function(domain, state) {
        // Returns an array of applicable concrete actions for the current state, using the possible parameter values in domain.values array (Example: values = ['a', 'b', 't1', 't2', 't3']).
        // Test each domain action precondition against the cases. If one holds valid, then that action is applicable in the current state.
        var result = [];

        if (!domain.values || domain.values.length == 0) {
            StripsManager.output('ERROR: No parameter values found in domain.values.');
            return;
        }

        for (var i in domain.actions) {
            var action = domain.actions[i]; // op1
            var parameters = action.parameters; // x1, x2, x3
            var populatedAction = JSON.parse(JSON.stringify(action)); // copy for replacing parameters with actual values.
            var parameterMapHash = {};

            // Assign values to the parameters for each test case.
            for (var j in action.parameterCombinations) {
                var testCase = action.parameterCombinations[j];
                var nindex = 0;
                
                var parameterMap = []; // map of parameter values to be populated
                // Initialize default parameter values for this action. We'll set concrete values next.
                for (var j in parameters) {
                    parameterMap[parameters[j].parameter] = testCase[nindex++];
                }

                // Get the action's precondition parameters.
                var testCaseIndex = 0;
                for (var k in action.precondition) {
                    var precondition = action.precondition[k];
                    var populatedPreconditionPart = JSON.parse(JSON.stringify(precondition)); // copy for replacing parameters with actual values.
                    
                    // Found a matching action. So far, so good.
                    var parameterIndex = 0;
                    
                    // Assign a value to each parameter of the precondition.
                    for (var l in precondition.parameters) {
                        var parameter = precondition.parameters[l];
                        var value = parameterMap[parameter];

                        // Assign this value to all instances of this parameter in the precondition.
                        populatedPreconditionPart.parameters[l] = value;
                    }
                    
                    populatedAction.precondition[k] = populatedPreconditionPart;
                    populatedAction.map = parameterMap;
                }

                // Does the filled-in precondition exist in the test cases?
                var applicableAction = StripsManager.getApplicableActionInState(state, populatedAction);
                if (applicableAction) {
                    // This action is applicable in this state. Make sure we haven't already found this one.
                    var isDuplicate = false;
                    for (var rr in result) {
                        var action1 = result[rr];
                        if (StripsManager.isEqual(applicableAction, action1)) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    if (!isDuplicate) {
                        result.push(applicableAction);
                    }
                }
            }
        }

        return result;
    },

    applyAction: function(action, state) {
        // Applies an action on a state and returns the new state. It is assumed that the precondition has already been tested.
        var result = JSON.parse(JSON.stringify(state));

        for (var i in action.effect) {
            var actionOperation = action.effect[i];
            var operation = actionOperation.operation || 'and';
            
            if (operation == 'and') {
                // Make sure this predicate doesn't already exist in the state.
                var isExists = false;
                for (var j in state.actions) {
                    // Find matching action.
                    if (StripsManager.isEqual(state.actions[j], actionOperation)) {
                        isExists = true;
                        break;
                    }
                }

                if (!isExists) {
                    // Add this predicate to the state.
                    result.actions.push(actionOperation);
                }                
            }
            else {
                // Remove this predicate from the state.
                for (var j in state.actions) {
                    // Find matching action.
                    if (StripsManager.isEqual(state.actions[j], actionOperation)) {
                        // This is our target. Find the same item in our result list (since result may now have different indices than state.actions, if new actions were added via 'and').
                        for (var k in result.actions) {
                            if (StripsManager.isEqual(state.actions[j], result.actions[k])) {
                                result.actions.splice(k, 1);
                            }
                        }
                    }
                }
            }
        }

        return result;
    },

    getChildStates: function(domain, state) {
        // Returns the list of child states for the current state, after applying all applicable actions.
        var children = [];

        var actions = StripsManager.applicableActions(domain, state);
        for (var i in actions) {
            var action = actions[i];
            children.push({ state: StripsManager.applyAction(action, state), action: action });
        }

        return children;
    },

    isGoal: function(state, goalState) {
        // Returns true if the state contains the goal conditions.
        var result = true;

        for (var i in goalState.actions) {
            var goalAction = goalState.actions[i];
            var operation = goalAction.operation || 'and';

            if (operation == 'and') {
                // Make sure this action exists in the state.
                var isExists = false;
                for (var j in state.actions) {
                    if (StripsManager.isEqual(state.actions[j], goalAction)) {
                        isExists = true;
                        break;
                    }
                }

                // If we found a match, then this goal action exists. Move on to next tests.
                if (!isExists) {
                    result = false;
                    break;
                }
            }
            else {
                // Make sure this action does not exist in the state.
                var isExists = false;
                for (var j in state.actions) {
                    if (StripsManager.isEqual(state.actions[j], goalAction)) {
                        // This is our target, so it fails the goal test.
                        isExists = true;
                        break;
                    }
                }

                if (isExists) {
                    // Found a match for 'not', so goal fails.
                    result = false;
                    break;
                }
            }
        }

        return result;
    },

    actionToString: function(action) {
        var result = action.action;

        for (var key in action.map) {
            result += ' ' + action.map[key];
        }

        return result;
    },

    stateToString: function(state) {
        var result = '';
        var actionList = [];

        for (var i in state.actions) {
            var action = state.actions[i];

            var actionString = '(' + action.action;
            for (var j in action.parameters) {
                actionString += ' ' + action.parameters[j];
            }
            actionString += ')';

            // Keep a list of actions so we can sort them. This allows two states with different orderings of the same actions to result in the same string.
            actionList.push(actionString);
        }

        for (var i in actionList.sort()) {
            if (i > 0) {
                result += ' ';
            }
            result += actionList[i];
        }

        return result;
    },

    solve: function(domain, problem, isDfs, maxSolutions, cost) {
        // Find solution using A*, depth-first, or breadth-first search.
        if (typeof(isDfs) == 'function' && !cost) {
            // Allow passing cost as 3rd parameter.
            cost = isDfs;
        }
        else if (isDfs == null) {
            // If no other option specified, use depth-first-search by default.
            isDfs = true;
        }
        
        maxSolutions = maxSolutions || 1;

        if (cost && typeof(cost) != 'function') {
            StripsManager.output('ERROR: parameter "cost" must be a function to serve as the A* algorithm heuristic. Method: solve(domain, problem, isDepthFirstSearch, cost, maxSolutions). Usage: solve(domain, problem), solve(domain, problem, false), solve(domain, problem, cost).');
            return;
        }
        
        if (StripsManager.verbose) {
            StripsManager.output('Using ' + (cost ? 'A*' : (isDfs ? 'depth' : 'breadth') + '-first-search') + '.');
            StripsManager.output('');
        }

        return cost ? StripsManager.solveAs(domain, problem.states[0], problem.states[1], cost) :
                      (isDfs ? StripsManager.solveDfs(domain, problem.states[0], problem.states[1], maxSolutions) :
                               StripsManager.solveBfs(domain, problem.states[0], problem.states[1], maxSolutions));
    },

    solveDfs: function(domain, state, goalState, maxSolutions, visited, depth) {
        // Find all solutions using depth-first-search.
        var solutions = [];

        visited = visited ? JSON.parse(JSON.stringify(visited)) : {};
        depth = depth || 0;
        state = state.state ? state : { state: state }; // format state to mirror child, which includes parent and action in recursion.

        // If this is the initial state, add it to the visited list.
        if (Object.keys(visited).length == 0) {
            visited[StripsManager.stateToString(state.state)] = 1;
        }

        // Check for goal.
        if (StripsManager.isGoal(state.state, goalState)) {
            // Compile solution path.
            var path = [];
            var steps = depth;

            while (state != null && state.parent != null) {
                // Since we move from goal backwards, add this step to the front of the array (rather than the end, otherwise it would be in reverse order).
                path.unshift(StripsManager.actionToString(state.action));
                state = state.parent;
            }

            return [ { steps: steps, path: path } ];
        }
        else {
            // Get child states by applying actions to current state.
            var fringe = StripsManager.getChildStates(domain, state.state);

            if (StripsManager.verbose) {
                StripsManager.output('Depth: ' + depth + ', ' + fringe.length + ' child states.');
            }
            
            // Run against each new child state.
            for (var i in fringe) {
                var child = fringe[i];
                child.parent = state;
                var key = StripsManager.stateToString(child.state);

                if (!visited[key]) {
                    visited[key] = 1;
                    var subSolutions = StripsManager.solveDfs(domain, child, goalState, maxSolutions, visited, depth + 1);
                    if (subSolutions.length > 0) {
                        // This branch has a solution(s).
                        for (var j in subSolutions) {
                            solutions.push(subSolutions[j]);

                            if (solutions.length >= maxSolutions) {
                                break;
                            }
                        }

                        if (solutions.length >= maxSolutions) {
                            break;
                        }
                    }
                }
            }
        }

        return solutions;
    },

    solveBfs: function(domain, state, goalState, maxSolutions) {
        // Find all solutions using breadth-first-search.
        var fringe = [ { state: state, depth: 0 } ]; // Start with the initial state on the fringe.
        var visited = {};
        var depth = 0;
        var solutions = [];

        while (fringe.length > 0) {
            // Investigate the next state with the lowest depth.
            var current = fringe[0];

            // Remove this state from the fringe.
            fringe.shift();

            // Mark this state as visited.
            visited[StripsManager.stateToString(current.state)] = 1;

            // Check for goal.
            if (StripsManager.isGoal(current.state, goalState)) {
                // Compile solution path.
                var path = [];
                var steps = current.depth;

                while (current != null && current.parent != null) {
                    // Since we move from goal backwards, add this step to the front of the array (rather than the end, otherwise it would be in reverse order).
                    path.unshift(StripsManager.actionToString(current.action));
                    current = current.parent;
                }

                solutions.push({ steps: steps, path: path });

                if (solutions.length >= maxSolutions) {
                    return solutions;
                }
            }
            else {
                // Get child states by applying actions to current state.
                var children = StripsManager.getChildStates(domain, current.state);

                // Add the children to the fringe.
                for (var i in children) {
                    var child = children[i];
                    child.parent = current;
                    child.depth = current.depth + 1;

                    if (!visited[StripsManager.stateToString(child.state)]) {
                        fringe.push(child);
                    }
                }
            }

            if (StripsManager.verbose) {
                StripsManager.output('Depth: ' + current.depth + ', ' + fringe.length + ' child states.');
            }
        }

        return solutions;
    },
    
    solveAs:function(domain, state, goalState, cost) {
        // Find first solution using A* search, where cost is the heuristic function (h = cost(state)). Starting with the initial state, we find all children by applying applicable actions on the current state, calculate the child state costs, and select the next cheapest state to visit.
        var depth = 0;
        var fringe = [ { state: state, h: cost(state), g: depth } ]; // Start with the initial state on the fringe.
        var visited = {};
        var solutions = [];

        while (fringe.length > 0) {
            // Investigate the next state with the lowest cost.
            var current = fringe[0];

            // Remove this state from the fringe.
            fringe.shift();

            // Mark this state as visited.
            visited[StripsManager.stateToString(current.state)] = 1;

            // Check for goal.
            if (StripsManager.isGoal(current.state, goalState)) {
                // Compile solution path.
                var path = [];
                var steps = current.g;

                while (current != null && current.parent != null) {
                    // Since we move from goal backwards, add this step to the front of the array (rather than the end, otherwise it would be in reverse order).
                    path.unshift(StripsManager.actionToString(current.action));
                    current = current.parent;
                }

                solutions.push({ steps: steps, path: path });

                return solutions;
            }
            else {
                // Get child states by applying actions to current state.
                var children = StripsManager.getChildStates(domain, current.state);

                // Add the children to the fringe.
                for (var i in children) {
                    var child = children[i];
                    child.parent = current;
                    child.g = current.g + 1;
                    child.h = cost(child.state);
                    
                    if (!visited[StripsManager.stateToString(child.state)]) {
                        fringe.push(child);
                    }
                }
                
                fringe.sort(function(a, b) { return (a.h + a.g) - (b.h + b.g) });
            }

            if (StripsManager.verbose) {
                StripsManager.output('Depth: ' + current.g + ', Current cost: ' + (current.h + current.g) + ', ' + fringe.length + ' child states.');
            }
        }

        return solutions;
    },

    nextGraphLayer: function(domain, parentLayer, isSkipNegativeLiterals) {
        // Builds the next planning graph layer, based upon the previous layer. In each action, 'precondition' represents parent literals. 'effect' represents child literals.
        // Returns a 3-tier layer, consisting of P0 (literals), A0 (actions), P1 (literals). The format is: P0 = precondition, A0 = all actions not named 'noop', P1 = effect.
        // If isSkipNegativeLiterals = true, negative literals (mutex) created from an action will be ignored.
        var layer = [];
        var literalHash = {};
        var literalCount = 0;
        var actionCount = 0;

        // Pack all literals from actions in this layer into a single array.
        var children = { effect: [] };
        for (var i in parentLayer) {
            for (var j in parentLayer[i].effect) {
                var literal = parentLayer[i].effect[j];
                literal.operation = literal.operation || 'and';

                if (!isSkipNegativeLiterals || (isSkipNegativeLiterals && literal.operation != 'not')) {
                    if (!literalHash[JSON.stringify(literal)]) {
                        children.effect.push(literal);

                        // P2 - Carry forward literals from parent, using noop actions.
                        var noop = { action: 'noop' };
                        noop.precondition = noop.precondition || [];
                        noop.precondition.push(literal);
                        noop.effect = noop.precondition;
                        layer.push(noop);

                        literalHash[JSON.stringify(literal)] = 1;
                
                        // Keep a count of all literals in this layer so we know if we found any new ones after graphing.
                        literalCount++;
                    }
                }
            }
        }

        // A1 - Get all applicable actions for the state.
        var actions = StripsManager.applicableActionsPlus(domain, { actions: children.effect });
        actionCount = actions.length;
        for (var i in actions) {
            // Add action to the layer, preconditions are the parents, effects are the children.
            layer.push(actions[i]);
        }

        if (StripsManager.verbose) {
            StripsManager.output('P' + lastGraphIndex + ': ' + lastLiteralCount + ', A' + (lastGraphIndex+1) + ': ' + lastActionCount + ', P' + (lastGraphIndex+1) + ': ' + literalCount + ', A' + (lastGraphIndex+2) + ': ' + actionCount);
        }

        lastGraphIndex++;
        lastLiteralCount = literalCount;

        // If we discovered new literals or new actions, then return the layer and continue building the graph.
        if (lastLiteralCount > literalCount || lastActionCount != actionCount) {
            lastActionCount = actionCount;

            return layer;
        }
        else {
            // No change, no new literals.
            layer.done = true;
            return layer;
        }
    },

    graph: function(domain, problem, minLayers, maxLayers, isSkipNegativeLiterals) {
        // Builds a planning graph for a domain and problem. In each action, 'precondition' represents parent literals. 'effect' represents child literals. Any action not named 'noop' represents an applicable action.
        // Each layer consists of 3-tiers: P0 (literals), A0 (actions), P1 (literals). The format is: P0 = precondition, A0 = actions, P1 = effect.
        // Loops, building new graph layers, until no new literals and no new actions are discovered.
        // If isSkipNegativeLiterals = true, negative literals (mutex) created from an action will be ignored.
        var result = [];
        var layer = [];
        var actionHash = {};

        // P0 - initial literals.
        for (var i in problem.states[0].actions) {
            // P1 - B. Carry forward literals from parent.
            var noop = { action: 'noop' };
            noop.precondition = noop.precondition || [];
            noop.precondition.push(problem.states[0].actions[i]);
            noop.effect = noop.precondition;
            layer.push(noop);    
        }

        // A0 - Get all applicable actions for the initial state.
        var actions = StripsManager.applicableActionsPlus(domain, problem.states[0]);
        
        // Initialize global graph helper counters.
        lastLiteralCount = layer.length;
        lastActionCount = actions.length;
        lastGraphIndex = 0;

        layer = layer.concat(actions);

        // Add the literals, actions, next literals to the graph (P0, A0, P1).
        result.push(layer);

        // Next layer.
        var index = 0;
        var layer = StripsManager.nextGraphLayer(domain, result[index++], isSkipNegativeLiterals);
        while ((!layer.done || (minLayers && index < minLayers)) && (!maxLayers || index < maxLayers)) {
            if (StripsManager.verbose) {
                StripsManager.output('Processing layer ' + index);
            }

            result.push(layer);

            // Get next graph layer.
            layer = StripsManager.nextGraphLayer(domain, result[index++], isSkipNegativeLiterals);
        }

        return result;
    }
};

module.exports = StripsManager;
}).call(this,"/")
},{"./js-combinatorics/combinatorics.js":6,"fs":1,"pegjs":16,"util":5}]},{},[18]);
