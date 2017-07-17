var Rickshaw = {
    namespace: function(a, b) {
        var c = a.split("."),
            d = Rickshaw;
        for (var e = 1, f = c.length; e < f; e++) currentPart = c[e], d[currentPart] = d[currentPart] || {}, d = d[currentPart];
        return d
    },
    keys: function(a) {
        var b = [];
        for (var c in a) b.push(c);
        return b
    },
    extend: function(a, b) {
        for (var c in b) a[c] = b[c];
        return a
    }
};
if (typeof module != "undefined" && module.exports) {
    var d3 = require("d3");
    module.exports = Rickshaw
}(function(a) {
    function j(a) {
        return b.call(a) === i
    }

    function k(a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        return a
    }

    function l(a) {
        if (m(a) !== h) throw new TypeError;
        var b = [];
        for (var c in a) a.hasOwnProperty(c) && b.push(c);
        return b
    }

    function m(a) {
        switch (a) {
            case null:
                return c;
            case void 0:
                return d
        }
        var b = typeof a;
        switch (b) {
            case "boolean":
                return e;
            case "number":
                return f;
            case "string":
                return g
        }
        return h
    }

    function n(a) {
        return typeof a == "undefined"
    }

    function p(a) {
        var b = a.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, "").replace(/\s+/g, "").split(",");
        return b.length == 1 && !b[0] ? [] : b
    }

    function q(a, b) {
        var c = a;
        return function() {
            var a = r([t(c, this)], arguments);
            return b.apply(this, a)
        }
    }

    function r(a, b) {
        var c = a.length,
            d = b.length;
        while (d--) a[c + d] = b[d];
        return a
    }

    function s(a, b) {
        return a = o.call(a, 0), r(a, b)
    }

    function t(a, b) {
        if (arguments.length < 2 && n(arguments[0])) return this;
        var c = a,
            d = o.call(arguments, 2);
        return function() {
            var a = s(d, arguments);
            return c.apply(b, a)
        }
    }
    var b = Object.prototype.toString,
        c = "Null",
        d = "Undefined",
        e = "Boolean",
        f = "Number",
        g = "String",
        h = "Object",
        i = "[object Function]",
        o = Array.prototype.slice,
        u = function() {},
        v = function() {
            function b() {}

            function c() {
                function d() {
                    this.initialize.apply(this, arguments)
                }
                var a = null,
                    c = [].slice.apply(arguments);
                j(c[0]) && (a = c.shift()), k(d, v.Methods), d.superclass = a, d.subclasses = [];
                if (a) {
                    b.prototype = a.prototype, d.prototype = new b;
                    try {
                        a.subclasses.push(d)
                    } catch (e) {}
                }
                for (var f = 0, g = c.length; f < g; f++) d.addMethods(c[f]);
                return d.prototype.initialize || (d.prototype.initialize = u), d.prototype.constructor = d, d
            }

            function d(b) {
                var c = this.superclass && this.superclass.prototype,
                    d = l(b);
                a && (b.toString != Object.prototype.toString && d.push("toString"), b.valueOf != Object.prototype.valueOf && d.push("valueOf"));
                for (var e = 0, f = d.length; e < f; e++) {
                    var g = d[e],
                        h = b[g];
                    if (c && j(h) && p(h)[0] == "$super") {
                        var i = h;
                        h = q(function(a) {
                            return function() {
                                return c[a].apply(this, arguments)
                            }
                        }(g), i), h.valueOf = t(i.valueOf, i), h.toString = t(i.toString, i)
                    }
                    this.prototype[g] = h
                }
                return this
            }
            var a = function() {
                for (var a in {
                        toString: 1
                    })
                    if (a === "toString") return !1;
                return !0
            }();
            return {
                create: c,
                Methods: {
                    addMethods: d
                }
            }
        }();
    a.exports ? a.exports.Class = v : a.Class = v
})(Rickshaw), Rickshaw.namespace("Rickshaw.Compat.ClassList"), Rickshaw.Compat.ClassList = function() {
    typeof document != "undefined" && !("classList" in document.createElement("a")) && function(a) {
        "use strict";
        var b = "classList",
            c = "prototype",
            d = (a.HTMLElement || a.Element)[c],
            e = Object,
            f = String[c].trim || function() {
                return this.replace(/^\s+|\s+$/g, "")
            },
            g = Array[c].indexOf || function(a) {
                var b = 0,
                    c = this.length;
                for (; b < c; b++)
                    if (b in this && this[b] === a) return b;
                return -1
            },
            h = function(a, b) {
                this.name = a, this.code = DOMException[a], this.message = b
            },
            i = function(a, b) {
                if (b === "") throw new h("SYNTAX_ERR", "An invalid or illegal string was specified");
                if (/\s/.test(b)) throw new h("INVALID_CHARACTER_ERR", "String contains an invalid character");
                return g.call(a, b)
            },
            j = function(a) {
                var b = f.call(a.className),
                    c = b ? b.split(/\s+/) : [],
                    d = 0,
                    e = c.length;
                for (; d < e; d++) this.push(c[d]);
                this._updateClassName = function() {
                    a.className = this.toString()
                }
            },
            k = j[c] = [],
            l = function() {
                return new j(this)
            };
        h[c] = Error[c], k.item = function(a) {
            return this[a] || null
        }, k.contains = function(a) {
            return a += "", i(this, a) !== -1
        }, k.add = function(a) {
            a += "", i(this, a) === -1 && (this.push(a), this._updateClassName())
        }, k.remove = function(a) {
            a += "";
            var b = i(this, a);
            b !== -1 && (this.splice(b, 1), this._updateClassName())
        }, k.toggle = function(a) {
            a += "", i(this, a) === -1 ? this.add(a) : this.remove(a)
        }, k.toString = function() {
            return this.join(" ")
        };
        if (e.defineProperty) {
            var m = {
                get: l,
                enumerable: !0,
                configurable: !0
            };
            try {
                e.defineProperty(d, b, m)
            } catch (n) {
                n.number === -2146823252 && (m.enumerable = !1, e.defineProperty(d, b, m))
            }
        } else e[c].__defineGetter__ && d.__defineGetter__(b, l)
    }(window)
}, (typeof RICKSHAW_NO_COMPAT != "undefined" && !RICKSHAW_NO_COMPAT || typeof RICKSHAW_NO_COMPAT == "undefined") && new Rickshaw.Compat.ClassList, Rickshaw.namespace("Rickshaw.Graph"), Rickshaw.Graph = function(a) {
    this.element = a.element, this.series = a.series, this.defaults = {
        interpolation: "cardinal",
        offset: "zero",
        min: undefined,
        max: undefined
    }, Rickshaw.keys(this.defaults).forEach(function(b) {
        this[b] = a[b] || this.defaults[b]
    }, this), this.window = {}, this.updateCallbacks = [];
    var b = this;
    this.initialize = function(a) {
        this.validateSeries(a.series), this.series.active = function() {
            return b.series.filter(function(a) {
                return !a.disabled
            })
        }, this.setSize({
            width: a.width,
            height: a.height
        }), this.element.classList.add("rickshaw_graph"), this.vis = d3.select(this.element).append("svg:svg").attr("width", this.width).attr("height", this.height);
        var c = [Rickshaw.Graph.Renderer.Stack, Rickshaw.Graph.Renderer.Line, Rickshaw.Graph.Renderer.Bar, Rickshaw.Graph.Renderer.Area, Rickshaw.Graph.Renderer.ScatterPlot];
        c.forEach(function(a) {
            if (!a) return;
            b.registerRenderer(new a({
                graph: b
            }))
        }), this.setRenderer(a.renderer || "stack", a), this.discoverRange()
    }, this.validateSeries = function(a) {
        if (!(a instanceof Array || a instanceof Rickshaw.Series)) {
            var b = Object.prototype.toString.apply(a);
            throw "series is not an array: " + b
        }
        var c;
        a.forEach(function(a) {
            console.log(a)
            console.log(a.data)
            if (!(a instanceof Object)) throw "series element is not an object: " + a;
            if (!a.data) throw "series has no data: " + JSON.stringify(a);
            if (!(a.data instanceof Array)) throw "series data is not an array: " + JSON.stringify(a.data);
            c = c || a.data.length;
            if (c && a.data.length != c) throw "series cannot have differing numbers of points: " + c + " vs " + a.data.length + "; see Rickshaw.Series.zeroFill()";
            var b = typeof a.data[0].x,
                d = typeof a.data[0].y;
            if (b != "number" || d != "number") throw "x and y properties of points should be numbers instead of " + b + " and " + d
        })
    }, this.dataDomain = function() {
        var a = this.series[0].data;
        return [a[0].x, a.slice(-1).shift().x]
    }, this.discoverRange = function() {
        var a = this.renderer.domain();
        this.x = d3.scale.linear().domain(a.x).range([0, this.width]), this.y = d3.scale.linear().domain(a.y).range([this.height, 0]), this.y.magnitude = d3.scale.linear().domain([a.y[0] - a.y[0], a.y[1] - a.y[0]]).range([0, this.height])
    }, this.render = function() {
        var a = this.stackData();
        this.discoverRange(), this.renderer.render(), this.updateCallbacks.forEach(function(a) {
            a()
        })
    }, this.update = this.render, this.stackData = function() {
        var a = this.series.active().map(function(a) {
            return a.data
        }).map(function(a) {
            return a.filter(function(a) {
                return this._slice(a)
            }, this)
        }, this);
        this.stackData.hooks.data.forEach(function(c) {
            a = c.f.apply(b, [a])
        });
        var c = d3.layout.stack();
        c.offset(b.offset);
        var d = c(a);
        this.stackData.hooks.after.forEach(function(c) {
            d = c.f.apply(b, [a])
        });
        var e = 0;
        return this.series.forEach(function(a) {
            if (a.disabled) return;
            a.stack = d[e++]
        }), this.stackedData = d, d
    }, this.stackData.hooks = {
        data: [],
        after: []
    }, this._slice = function(a) {
        if (this.window.xMin || this.window.xMax) {
            var b = !0;
            return this.window.xMin && a.x < this.window.xMin && (b = !1), this.window.xMax && a.x > this.window.xMax && (b = !1), b
        }
        return !0
    }, this.onUpdate = function(a) {
        this.updateCallbacks.push(a)
    }, this.registerRenderer = function(a) {
        this._renderers = this._renderers || {}, this._renderers[a.name] = a
    }, this.configure = function(a) {
        (a.width || a.height) && this.setSize(a), Rickshaw.keys(this.defaults).forEach(function(b) {
            this[b] = b in a ? a[b] : b in this ? this[b] : this.defaults[b]
        }, this), this.setRenderer(a.renderer || this.renderer.name, a)
    }, this.setRenderer = function(a, b) {
        if (!this._renderers[a]) throw "couldn't find renderer " + a;
        this.renderer = this._renderers[a], typeof b == "object" && this.renderer.configure(b)
    }, this.setSize = function(a) {
        a = a || {};
        if (typeof window !== undefined) var b = window.getComputedStyle(this.element, null),
            c = parseInt(b.getPropertyValue("width")),
            d = parseInt(b.getPropertyValue("height"));
        this.width = a.width || c || 400, this.height = a.height || d || 250, this.vis && this.vis.attr("width", this.width).attr("height", this.height)
    }, this.initialize(a)
}, Rickshaw.namespace("Rickshaw.Fixtures.Color"), Rickshaw.Fixtures.Color = function() {
    this.schemes = {}, this.schemes.spectrum14 = ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82", "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3", "#649eb9", "#387aa3"].reverse(), this.schemes.spectrum2000 = ["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665", "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d", "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839", "#31082b"], this.schemes.spectrum2001 = ["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f", "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412", "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818", "#320a1b"], this.schemes.classic9 = ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f", "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(), this.schemes.httpStatus = {
        503: "#ea5029",
        502: "#d23f14",
        500: "#bf3613",
        410: "#efacea",
        409: "#e291dc",
        403: "#f457e8",
        408: "#e121d2",
        401: "#b92dae",
        405: "#f47ceb",
        404: "#a82a9f",
        400: "#b263c6",
        301: "#6fa024",
        302: "#87c32b",
        307: "#a0d84c",
        304: "#28b55c",
        200: "#1a4f74",
        206: "#27839f",
        201: "#52adc9",
        202: "#7c979f",
        203: "#a5b8bd",
        204: "#c1cdd1"
    }, this.schemes.colorwheel = ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac", "#73c03a", "#cb513a"].reverse(), this.schemes.cool = ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266", "#a47493", "#c09fb5"], this.schemes.munin = ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099", "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00", "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80", "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080", "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"]
}, Rickshaw.namespace("Rickshaw.Fixtures.RandomData"), Rickshaw.Fixtures.RandomData = function(a) {
    var b;
    a = a || 1;
    var c = 200,
        d = Math.floor((new Date).getTime() / 1e3);
    this.addData = function(b) {
        var e = Math.random() * 100 + 15 + c,
            f = b[0].length,
            g = 1;
        b.forEach(function(b) {
            var c = Math.random() * 20,
                h = e / 25 + g++ + (Math.cos(f * g * 11 / 960) + 2) * 15 + (Math.cos(f / 7) + 2) * 7 + (Math.cos(f / 17) + 2) * 1;
            b.push({
                x: f * a + d,
                y: h + c
            })
        }), c = e * .85
    }
}, Rickshaw.namespace("Rickshaw.Fixtures.Time"), Rickshaw.Fixtures.Time = function() {
    var a = (new Date).getTimezoneOffset() * 60,
        b = this;
    this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], this.units = [{
        name: "decade",
        seconds: 315576e3,
        formatter: function(a) {
            return parseInt(a.getUTCFullYear() / 10) * 10
        }
    }, {
        name: "year",
        seconds: 31557600,
        formatter: function(a) {
            return a.getUTCFullYear()
        }
    }, {
        name: "month",
        seconds: 2635200,
        formatter: function(a) {
            return b.months[a.getUTCMonth()]
        }
    }, {
        name: "week",
        seconds: 604800,
        formatter: function(a) {
            return b.formatDate(a)
        }
    }, {
        name: "day",
        seconds: 86400,
        formatter: function(a) {
            return a.getUTCDate()
        }
    }, {
        name: "6 hour",
        seconds: 21600,
        formatter: function(a) {
            return b.formatTime(a)
        }
    }, {
        name: "hour",
        seconds: 3600,
        formatter: function(a) {
            return b.formatTime(a)
        }
    }, {
        name: "15 minute",
        seconds: 900,
        formatter: function(a) {
            return b.formatTime(a)
        }
    }, {
        name: "minute",
        seconds: 60,
        formatter: function(a) {
            return a.getUTCMinutes()
        }
    }, {
        name: "15 second",
        seconds: 15,
        formatter: function(a) {
            return a.getUTCSeconds() + "s"
        }
    }, {
        name: "second",
        seconds: 1,
        formatter: function(a) {
            return a.getUTCSeconds() + "s"
        }
    }], this.unit = function(a) {
        return this.units.filter(function(b) {
            return a == b.name
        }).shift()
    }, this.formatDate = function(a) {
        return a.toUTCString().match(/, (\w+ \w+ \w+)/)[1]
    }, this.formatTime = function(a) {
        return a.toUTCString().match(/(\d+:\d+):/)[1]
    }, this.ceil = function(a, b) {
        if (b.name == "month") {
            var c = new Date((a + b.seconds - 1) * 1e3),
                d = new Date(0);
            return d.setUTCFullYear(c.getUTCFullYear()), d.setUTCMonth(c.getUTCMonth()), d.setUTCDate(1), d.setUTCHours(0), d.setUTCMinutes(0), d.setUTCSeconds(0), d.setUTCMilliseconds(0), d.getTime() / 1e3
        }
        if (b.name == "year") {
            var c = new Date((a + b.seconds - 1) * 1e3),
                d = new Date(0);
            return d.setUTCFullYear(c.getUTCFullYear()), d.setUTCMonth(0), d.setUTCDate(1), d.setUTCHours(0), d.setUTCMinutes(0), d.setUTCSeconds(0), d.setUTCMilliseconds(0), d.getTime() / 1e3
        }
        return Math.ceil(a / b.seconds) * b.seconds
    }
}, Rickshaw.namespace("Rickshaw.Fixtures.Number"), Rickshaw.Fixtures.Number.formatKMBT = function(a) {
    return a >= 1e12 ? a / 1e12 + "T" : a >= 1e9 ? a / 1e9 + "B" : a >= 1e6 ? a / 1e6 + "M" : a >= 1e3 ? a / 1e3 + "K" : a < 1 && a > 0 ? a.toFixed(2) : a == 0 ? "" : a
}, Rickshaw.Fixtures.Number.formatBase1024KMGTP = function(a) {
    return a >= 0x4000000000000 ? a / 0x4000000000000 + "P" : a >= 1099511627776 ? a / 1099511627776 + "T" : a >= 1073741824 ? a / 1073741824 + "G" : a >= 1048576 ? a / 1048576 + "M" : a >= 1024 ? a / 1024 + "K" : a < 1 && a > 0 ? a.toFixed(2) : a == 0 ? "" : a
}, Rickshaw.namespace("Rickshaw.Color.Palette"), Rickshaw.Color.Palette = function(a) {
    var b = new Rickshaw.Fixtures.Color;
    a = a || {}, this.schemes = {}, this.scheme = b.schemes[a.scheme] || a.scheme || b.schemes.colorwheel, this.runningIndex = 0, this.generatorIndex = 0;
    if (a.interpolatedStopCount) {
        var c = this.scheme.length - 1,
            d, e, f = [];
        for (d = 0; d < c; d++) {
            f.push(this.scheme[d]);
            var g = d3.interpolateHsl(this.scheme[d], this.scheme[d + 1]);
            for (e = 1; e < a.interpolatedStopCount; e++) f.push(g(1 / a.interpolatedStopCount * e))
        }
        f.push(this.scheme[this.scheme.length - 1]), this.scheme = f
    }
    this.rotateCount = this.scheme.length, this.color = function(a) {
        return this.scheme[a] || this.scheme[this.runningIndex++] || this.interpolateColor() || "#808080"
    }, this.interpolateColor = function() {
        if (!Array.isArray(this.scheme)) return;
        var a;
        return this.generatorIndex == this.rotateCount * 2 - 1 ? (a = d3.interpolateHsl(this.scheme[this.generatorIndex], this.scheme[0])(.5), this.generatorIndex = 0, this.rotateCount *= 2) : (a = d3.interpolateHsl(this.scheme[this.generatorIndex], this.scheme[this.generatorIndex + 1])(.5), this.generatorIndex++), this.scheme.push(a), a
    }
}, Rickshaw.namespace("Rickshaw.Graph.Ajax"), Rickshaw.Graph.Ajax = Rickshaw.Class.create({
    initialize: function(a) {
        this.dataURL = a.dataURL, this.onData = a.onData || function(a) {
            return a
        }, this.onComplete = a.onComplete || function() {}, this.onError = a.onError || function() {}, this.args = a, this.request()
    },
    request: function() {
        $.ajax({
            url: this.dataURL,
            dataType: "json",
            success: this.success.bind(this),
            error: this.error.bind(this)
        })
    },
    error: function() {
        console.log("error loading dataURL: " + this.dataURL), this.onError(this)
    },
    success: function(a, b) {
        a = this.onData(a), this.args.series = this._splice({
            data: a,
            series: this.args.series
        }), this.graph = new Rickshaw.Graph(this.args), this.graph.render(), this.onComplete(this)
    },
    _splice: function(a) {
        var b = a.data,
            c = a.series;
        return a.series ? (c.forEach(function(a) {
            var c = a.key || a.name;
            if (!c) throw "series needs a key or a name";
            b.forEach(function(b) {
                var d = b.key || b.name;
                if (!d) throw "data needs a key or a name";
                if (c == d) {
                    var e = ["color", "name", "data"];
                    e.forEach(function(c) {
                        a[c] = a[c] || b[c]
                    })
                }
            })
        }), c) : b
    }
}), Rickshaw.namespace("Rickshaw.Graph.Annotate"), Rickshaw.Graph.Annotate = function(a) {
    var b = this.graph = a.graph;
    this.elements = {
        timeline: a.element
    };
    var c = this;
    this.data = {}, this.elements.timeline.classList.add("rickshaw_annotation_timeline"), this.add = function(a, b, d) {
        c.data[a] = c.data[a] || {
            boxes: []
        }, c.data[a].boxes.push({
            content: b,
            end: d
        })
    }, this.update = function() {
        Rickshaw.keys(c.data).forEach(function(a) {
            var b = c.data[a],
                d = c.graph.x(a);
            if (d < 0 || d > c.graph.x.range()[1]) {
                b.element && (b.line.classList.add("offscreen"), b.element.style.display = "none"), b.boxes.forEach(function(a) {
                    a.rangeElement && a.rangeElement.classList.add("offscreen")
                });
                return
            }
            if (!b.element) {
                var e = b.element = document.createElement("div");
                e.classList.add("annotation"), this.elements.timeline.appendChild(e), e.addEventListener("click", function(a) {
                    e.classList.toggle("active"), b.line.classList.toggle("active"), b.boxes.forEach(function(a) {
                        a.rangeElement && a.rangeElement.classList.toggle("active")
                    })
                }, !1)
            }
            b.element.style.left = d + "px", b.element.style.display = "block", b.boxes.forEach(function(a) {
                var e = a.element;
                e || (e = a.element = document.createElement("div"), e.classList.add("content"), e.innerHTML = a.content, b.element.appendChild(e), b.line = document.createElement("div"), b.line.classList.add("annotation_line"), c.graph.element.appendChild(b.line), a.end && (a.rangeElement = document.createElement("div"), a.rangeElement.classList.add("annotation_range"), c.graph.element.appendChild(a.rangeElement)));
                if (a.end) {
                    var f = d,
                        g = Math.min(c.graph.x(a.end), c.graph.x.range()[1]);
                    f > g && (g = d, f = Math.max(c.graph.x(a.end), c.graph.x.range()[0]));
                    var h = g - f;
                    a.rangeElement.style.left = f + "px", a.rangeElement.style.width = h + "px", a.rangeElement.classList.remove("offscreen")
                }
                b.line.classList.remove("offscreen"), b.line.style.left = d + "px"
            })
        }, this)
    }, this.graph.onUpdate(function() {
        c.update()
    })
}, Rickshaw.namespace("Rickshaw.Graph.Axis.Time"), Rickshaw.Graph.Axis.Time = function(a) {
    var b = this;
    this.graph = a.graph, this.elements = [], this.ticksTreatment = a.ticksTreatment || "plain", this.fixedTimeUnit = a.timeUnit;
    var c = new Rickshaw.Fixtures.Time;
    this.appropriateTimeUnit = function() {
        var a, b = c.units,
            d = this.graph.x.domain(),
            e = d[1] - d[0];
        return b.forEach(function(b) {
            Math.floor(e / b.seconds) >= 2 && (a = a || b)
        }), a || c.units[c.units.length - 1]
    }, this.tickOffsets = function() {
        var a = this.graph.x.domain(),
            b = this.fixedTimeUnit || this.appropriateTimeUnit(),
            d = Math.ceil((a[1] - a[0]) / b.seconds),
            e = a[0],
            f = [];
        for (var g = 0; g < d; g++) tickValue = c.ceil(e, b), e = tickValue + b.seconds / 2, f.push({
            value: tickValue,
            unit: b
        });
        return f
    }, this.render = function() {
        this.elements.forEach(function(a) {
            a.parentNode.removeChild(a)
        }), this.elements = [];
        var a = this.tickOffsets();
        a.forEach(function(a) {
            if (b.graph.x(a.value) > b.graph.x.range()[1]) return;
            var c = document.createElement("div");
            c.style.left = b.graph.x(a.value) + "px", c.classList.add("x_tick"), c.classList.add(b.ticksTreatment);
            var d = document.createElement("div");
            d.classList.add("title"), d.innerHTML = a.unit.formatter(new Date(a.value * 1e3)), c.appendChild(d), b.graph.element.appendChild(c), b.elements.push(c)
        })
    }, this.graph.onUpdate(function() {
        b.render()
    })
}, Rickshaw.namespace("Rickshaw.Graph.Axis.Y"), Rickshaw.Graph.Axis.Y = function(a) {
    var b = this,
        c = .1;
    this.initialize = function(a) {
        this.graph = a.graph, this.orientation = a.orientation || "right";
        var c = a.pixelsPerTick || 75;
        this.ticks = a.ticks || Math.floor(this.graph.height / c), this.tickSize = a.tickSize || 4, this.ticksTreatment = a.ticksTreatment || "plain", a.element ? (this.element = a.element, this.vis = d3.select(a.element).append("svg:svg").attr("class", "rickshaw_graph y_axis"), this.element = this.vis[0][0], this.element.style.position = "relative", this.setSize({
            width: a.width,
            height: a.height
        })) : this.vis = this.graph.vis, this.graph.onUpdate(function() {
            b.render()
        })
    }, this.setSize = function(a) {
        a = a || {};
        if (!this.element) return;
        if (typeof window != "undefined") {
            var b = window.getComputedStyle(this.element.parentNode, null),
                d = parseInt(b.getPropertyValue("width"));
            if (!a.auto) var e = parseInt(b.getPropertyValue("height"))
        }
        this.width = a.width || d || this.graph.width * c, this.height = a.height || e || this.graph.height, this.vis.attr("width", this.width).attr("height", this.height * (1 + c));
        var f = this.height * c;
        this.element.style.top = -1 * f + "px"
    }, this.render = function() {
        this.graph.height !== this._renderHeight && this.setSize({
            auto: !0
        });
        var b = d3.svg.axis().scale(this.graph.y).orient(this.orientation);
        b.tickFormat(a.tickFormat || function(a) {
            return a
        });
        if (this.orientation == "left") var d = this.height * c,
            e = "translate(" + this.width + ", " + d + ")";
        this.element && this.vis.selectAll("*").remove(), this.vis.append("svg:g").attr("class", ["y_ticks", this.ticksTreatment].join(" ")).attr("transform", e).call(b.ticks(this.ticks).tickSubdivide(0).tickSize(this.tickSize));
        var f = (this.orientation == "right" ? 1 : -1) * this.graph.width;
        this.graph.vis.append("svg:g").attr("class", "y_grid").call(b.ticks(this.ticks).tickSubdivide(0).tickSize(f)), this._renderHeight = this.graph.height
    }, this.initialize(a)
}, Rickshaw.namespace("Rickshaw.Graph.Behavior.Series.Highlight"), Rickshaw.Graph.Behavior.Series.Highlight = function(a) {
    this.graph = a.graph, this.legend = a.legend;
    var b = this,
        c = {};
    this.addHighlightEvents = function(a) {
        a.element.addEventListener("mouseover", function(d) {
            b.legend.lines.forEach(function(b) {
                if (a === b) return;
                c[b.series.name] = c[b.series.name] || b.series.color, b.series.color = d3.interpolateRgb(b.series.color, d3.rgb("#d8d8d8"))(.8).toString()
            }), b.graph.update()
        }, !1), a.element.addEventListener("mouseout", function(a) {
            b.legend.lines.forEach(function(a) {
                c[a.series.name] && (a.series.color = c[a.series.name])
            }), b.graph.update()
        }, !1)
    }, this.legend && this.legend.lines.forEach(function(a) {
        b.addHighlightEvents(a)
    })
}, Rickshaw.namespace("Rickshaw.Graph.Behavior.Series.Order"), Rickshaw.Graph.Behavior.Series.Order = function(a) {
    this.graph = a.graph, this.legend = a.legend;
    var b = this;
    $(function() {
        $(b.legend.list).sortable({
            containment: "parent",
            tolerance: "pointer",
            update: function(a, c) {
                var d = [];
                $(b.legend.list).find("li").each(function(a, b) {
                    if (!b.series) return;
                    d.push(b.series)
                });
                for (var e = b.graph.series.length - 1; e >= 0; e--) b.graph.series[e] = d.shift();
                b.graph.update()
            }
        }), $(b.legend.list).disableSelection()
    }), this.graph.onUpdate(function() {
        var a = window.getComputedStyle(b.legend.element).height;
        b.legend.element.style.height = a
    })
}, Rickshaw.namespace("Rickshaw.Graph.Behavior.Series.Toggle"), Rickshaw.Graph.Behavior.Series.Toggle = function(a) {
    this.graph = a.graph, this.legend = a.legend;
    var b = this;
    this.addAnchor = function(a) {
        var c = document.createElement("a");
        c.innerHTML = "&#10004;", c.classList.add("action"), a.element.insertBefore(c, a.element.firstChild), c.onclick = function(b) {
            a.series.disabled ? (a.series.enable(), a.element.classList.remove("disabled")) : (a.series.disable(), a.element.classList.add("disabled"))
        };
        var d = a.element.getElementsByTagName("span")[0];
        d.onclick = function(c) {
            var d = a.series.disabled;
            if (!d)
                for (var e = 0; e < b.legend.lines.length; e++) {
                    var f = b.legend.lines[e];
                    if (a.series !== f.series && !f.series.disabled) {
                        d = !0;
                        break
                    }
                }
            d ? (a.series.enable(), a.element.classList.remove("disabled"), b.legend.lines.forEach(function(b) {
                a.series !== b.series && (b.series.disable(), b.element.classList.add("disabled"))
            })) : b.legend.lines.forEach(function(a) {
                a.series.enable(), a.element.classList.remove("disabled")
            })
        }
    }, this.legend && (this.legend.lines.forEach(function(a) {
        b.addAnchor(a)
    })), this._addBehavior = function() {
        this.graph.series.forEach(function(a) {
            a.disable = function() {
                if (b.graph.series.length <= 1) throw "only one series left";
                a.disabled = !0, b.graph.update()
            }, a.enable = function() {
                a.disabled = !1, b.graph.update()
            }
        })
    }, this._addBehavior(), this.updateBehaviour = function() {
        this._addBehavior()
    }
}, Rickshaw.namespace("Rickshaw.Graph.HoverDetail"), Rickshaw.Graph.HoverDetail = Rickshaw.Class.create({
    initialize: function(a) {
        var b = this.graph = a.graph;
        this.xFormatter = a.xFormatter || function(a) {
            return (new Date(a * 1e3)).toUTCString()
        }, this.yFormatter = a.yFormatter || function(a) {
            return a.toFixed(2)
        };
        var c = this.element = document.createElement("div");
        c.className = "detail", this.visible = !0, b.element.appendChild(c), this.lastEvent = null, this._addListeners(), this.onShow = a.onShow, this.onHide = a.onHide, this.onRender = a.onRender, this.formatter = a.formatter || this.formatter
    },
    formatter: function(a, b, c, d, e, f) {
        return a.name + ":&nbsp;" + e
    },
    update: function(a) {
        a = a || this.lastEvent;
        if (!a) return;
        this.lastEvent = a;
        if (!a.target.nodeName.match(/^(path|svg|rect)$/)) return;
        var b = this.graph,
            c = a.offsetX || a.layerX,
            d = a.offsetY || a.layerY,
            e = b.x.invert(c),
            f = b.stackedData,
            g = f.slice(-1).shift(),
            h = d3.scale.linear().domain([g[0].x, g.slice(-1).shift().x]).range([0, g.length]),
            i = Math.floor(h(e)),
            j = Math.min(i || 0, f[0].length - 1);
        for (var k = i; k < f[0].length - 1;) {
            if (!f[0][k] || !f[0][k + 1]) break;
            if (f[0][k].x <= e && f[0][k + 1].x > e) {
                j = k;
                break
            }
            f[0][k + 1] <= e ? k++ : k--
        }
        var e = f[0][j].x,
            l = this.xFormatter(e),
            m = b.x(e),
            n = 0,
            o = b.series.active().map(function(a) {
                return {
                    order: n++,
                    series: a,
                    name: a.name,
                    value: a.stack[j]
                }
            }),
            p, q = function(a, b) {
                return a.value.y0 + a.value.y - (b.value.y0 + b.value.y)
            },
            r = b.y.magnitude.invert(b.element.offsetHeight - d);
        o.sort(q).forEach(function(a) {
            a.formattedYValue = this.yFormatter.constructor == Array ? this.yFormatter[o.indexOf(a)](a.value.y) : this.yFormatter(a.value.y), a.graphX = m, a.graphY = b.y(a.value.y0 + a.value.y), r > a.value.y0 && r < a.value.y0 + a.value.y && !p && (p = a, a.active = !0)
        }, this), this.element.innerHTML = "", this.element.style.left = b.x(e) + "px", this.visible && this.render({
            detail: o,
            domainX: e,
            formattedXValue: l,
            mouseX: c,
            mouseY: d
        })
    },
    hide: function() {
        this.visible = !1, this.element.classList.add("inactive"), typeof this.onHide == "function" && this.onHide()
    },
    show: function() {
        this.visible = !0, this.element.classList.remove("inactive"), typeof this.onShow == "function" && this.onShow()
    },
    render: function(a) {
        var b = a.detail,
            c = a.domainX,
            d = a.mouseX,
            e = a.mouseY,
            f = a.formattedXValue,
            g = document.createElement("div");
        g.className = "x_label", g.innerHTML = f, this.element.appendChild(g), b.forEach(function(a) {
            var b = document.createElement("div");
            b.className = "item", b.innerHTML = this.formatter(a.series, c, a.value.y, f, a.formattedYValue, a), b.style.top = this.graph.y(a.value.y0 + a.value.y) + "px", this.element.appendChild(b);
            var d = document.createElement("div");
            d.className = "dot", d.style.top = b.style.top, d.style.borderColor = a.series.color, this.element.appendChild(d), a.active && (b.className = "item active", d.className = "dot active")
        }, this), this.show(), typeof this.onRender == "function" && this.onRender(a)
    },
    _addListeners: function() {
        this.graph.element.addEventListener("mousemove", function(a) {
            this.visible = !0, this.update(a)
        }.bind(this), !1), this.graph.onUpdate(function() {
            this.update()
        }.bind(this)), this.graph.element.addEventListener("mouseout", function(a) {
            a.relatedTarget && !(a.relatedTarget.compareDocumentPosition(this.graph.element) & Node.DOCUMENT_POSITION_CONTAINS) && this.hide()
        }.bind(this), !1)
    }
}), Rickshaw.namespace("Rickshaw.Graph.JSONP"), Rickshaw.Graph.JSONP = Rickshaw.Class.create(Rickshaw.Graph.Ajax, {
    request: function() {
        $.ajax({
            url: this.dataURL,
            dataType: "jsonp",
            success: this.success.bind(this),
            error: this.error.bind(this)
        })
    }
}), Rickshaw.namespace("Rickshaw.Graph.Legend"), Rickshaw.Graph.Legend = function(a) {
    var b = this.element = a.element,
        c = this.graph = a.graph,
        d = this;
    b.classList.add("rickshaw_legend");
    var e = this.list = document.createElement("ul");
    b.appendChild(e);
    var f = c.series.map(function(a) {
        return a
    }).reverse();
    this.lines = [], this.addLine = function(a) {
        var b = document.createElement("li");
        b.className = "line";
        var c = document.createElement("div");
        c.className = "swatch", c.style.backgroundColor = a.color, b.appendChild(c);
        var f = document.createElement("span");
        f.className = "label", f.innerHTML = a.name, b.appendChild(f), e.appendChild(b), b.series = a, a.noLegend && (b.style.display = "none");
        var g = {
            element: b,
            series: a
        };
        d.shelving && (d.shelving.addAnchor(g), d.shelving.updateBehaviour()), d.highlighter && d.highlighter.addHighlightEvents(g), d.lines.push(g)
    }, f.forEach(function(a) {
        d.addLine(a)
    }), c.onUpdate(function() {})
}, Rickshaw.namespace("Rickshaw.Graph.RangeSlider"), Rickshaw.Graph.RangeSlider = function(a) {
    var b = this.element = a.element,
        c = this.graph = a.graph;
    $(function() {
        $(b).slider({
            range: !0,
            min: c.dataDomain()[0],
            max: c.dataDomain()[1],
            values: [c.dataDomain()[0], c.dataDomain()[1]],
            slide: function(a, b) {
                c.window.xMin = b.values[0], c.window.xMax = b.values[1], c.update(), c.dataDomain()[0] == b.values[0] && (c.window.xMin = undefined), c.dataDomain()[1] == b.values[1] && (c.window.xMax = undefined)
            }
        })
    }), b[0].style.width = c.width + "px", c.onUpdate(function() {
        var a = $(b).slider("option", "values");
        $(b).slider("option", "min", c.dataDomain()[0]), $(b).slider("option", "max", c.dataDomain()[1]), c.window.xMin == undefined && (a[0] = c.dataDomain()[0]), c.window.xMax == undefined && (a[1] = c.dataDomain()[1]), $(b).slider("option", "values", a)
    })
}, Rickshaw.namespace("Rickshaw.Graph.Renderer"), Rickshaw.Graph.Renderer = Rickshaw.Class.create({
    initialize: function(a) {
        this.graph = a.graph, this.tension = a.tension || this.tension, this.graph.unstacker = this.graph.unstacker || new Rickshaw.Graph.Unstacker({
            graph: this.graph
        }), this.configure(a)
    },
    seriesPathFactory: function() {},
    seriesStrokeFactory: function() {},
    defaults: function() {
        return {
            tension: .8,
            strokeWidth: 2,
            unstack: !0,
            padding: {
                top: .01,
                right: 0,
                bottom: .01,
                left: 0
            },
            stroke: !1,
            fill: !1
        }
    },
    domain: function() {
        var a = [],
            b = this.graph.stackedData || this.graph.stackData(),
            c = this.unstack ? b : [b.slice(-1).shift()];
        c.forEach(function(b) {
            b.forEach(function(b) {
                a.push(b.y + b.y0)
            })
        });
        var d = b[0][0].x,
            e = b[0][b[0].length - 1].x;
        d -= (e - d) * this.padding.left, e += (e - d) * this.padding.right;
        var f = this.graph.min === "auto" ? d3.min(a) : this.graph.min || 0,
            g = this.graph.max || d3.max(a);
        if (this.graph.min === "auto" || f < 0) f -= (g - f) * this.padding.bottom;
        return this.graph.max === undefined && (g += (g - f) * this.padding.top), {
            x: [d, e],
            y: [f, g]
        }
    },
    render: function() {
        var a = this.graph;
        a.vis.selectAll("*").remove();
        var b = a.vis.selectAll("path").data(this.graph.stackedData).enter().append("svg:path").attr("d", this.seriesPathFactory()),
            c = 0;
        a.series.forEach(function(a) {
            if (a.disabled) return;
            a.path = b[0][c++], this._styleSeries(a)
        }, this)
    },
    _styleSeries: function(a) {
        var b = this.fill ? a.color : "none",
            c = this.stroke ? a.color : "none";
        a.path.setAttribute("fill", b), a.path.setAttribute("stroke", c), a.path.setAttribute("stroke-width", this.strokeWidth), a.path.setAttribute("class", a.className)
    },
    configure: function(a) {
        a = a || {}, Rickshaw.keys(this.defaults()).forEach(function(b) {
            if (!a.hasOwnProperty(b)) {
                this[b] = this[b] || this.graph[b] || this.defaults()[b];
                return
            }
            typeof this.defaults()[b] == "object" ? Rickshaw.keys(this.defaults()[b]).forEach(function(c) {
                this[b][c] = a[b][c] !== undefined ? a[b][c] : this[b][c] !== undefined ? this[b][c] : this.defaults()[b][c]
            }, this) : this[b] = a[b] !== undefined ? a[b] : this[b] !== undefined ? this[b] : this.graph[b] !== undefined ? this.graph[b] : this.defaults()[b]
        }, this)
    },
    setStrokeWidth: function(a) {
        a !== undefined && (this.strokeWidth = a)
    },
    setTension: function(a) {
        a !== undefined && (this.tension = a)
    }
}), Rickshaw.namespace("Rickshaw.Graph.Renderer.Line"), Rickshaw.Graph.Renderer.Line = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
    name: "line",
    defaults: function($super) {
        return Rickshaw.extend($super(), {
            unstack: !0,
            fill: !1,
            stroke: !0
        })
    },
    seriesPathFactory: function() {
        var a = this.graph;
        return d3.svg.line().x(function(b) {
            return a.x(b.x)
        }).y(function(b) {
            return a.y(b.y)
        }).interpolate(this.graph.interpolation).tension(this.tension)
    }
}), Rickshaw.namespace("Rickshaw.Graph.Renderer.Stack"), Rickshaw.Graph.Renderer.Stack = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
    name: "stack",
    defaults: function($super) {
        return Rickshaw.extend($super(), {
            fill: !0,
            stroke: !1,
            unstack: !1
        })
    },
    seriesPathFactory: function() {
        var a = this.graph;
        return d3.svg.area().x(function(b) {
            return a.x(b.x)
        }).y0(function(b) {
            return a.y(b.y0)
        }).y1(function(b) {
            return a.y(b.y + b.y0)
        }).interpolate(this.graph.interpolation).tension(this.tension)
    }
}), Rickshaw.namespace("Rickshaw.Graph.Renderer.Bar"), Rickshaw.Graph.Renderer.Bar = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
    name: "bar",
    defaults: function($super) {
        var a = Rickshaw.extend($super(), {
            gapSize: .05,
            unstack: !1
        });
        return delete a.tension, a
    },
    initialize: function($super, a) {
        a = a || {}, this.gapSize = a.gapSize || this.gapSize, $super(a)
    },
    domain: function($super) {
        var a = $super(),
            b = this._frequentInterval();
        return a.x[1] += parseInt(b.magnitude), a
    },
    barWidth: function() {
        var a = this.graph.stackedData || this.graph.stackData(),
            b = a.slice(-1).shift(),
            c = this._frequentInterval(),
            d = this.graph.x(b[0].x + c.magnitude * (1 - this.gapSize));
        return d
    },
    render: function() {
        var a = this.graph;
        a.vis.selectAll("*").remove();
        var b = this.barWidth(),
            c = 0,
            d = a.series.filter(function(a) {
                return !a.disabled
            }).length,
            e = this.unstack ? b / d : b,
            f = function(b) {
                var c = [1, 0, 0, b.y < 0 ? -1 : 1, 0, b.y < 0 ? a.y.magnitude(Math.abs(b.y)) * 2 : 0];
                return "matrix(" + c.join(",") + ")"
            };
        a.series.forEach(function(b) {
            if (b.disabled) return;
            var d = a.vis.selectAll("path").data(b.stack).enter().append("svg:rect").attr("x", function(b) {
                return a.x(b.x) + c
            }).attr("y", function(b) {
                return a.y(b.y0 + Math.abs(b.y)) * (b.y < 0 ? -1 : 1)
            }).attr("width", e).attr("height", function(b) {
                return a.y.magnitude(Math.abs(b.y))
            }).attr("transform", f);
            Array.prototype.forEach.call(d[0], function(a) {
                a.setAttribute("fill", b.color)
            }), this.unstack && (c += e)
        }, this)
    },
    _frequentInterval: function() {
        var a = this.graph.stackedData || this.graph.stackData(),
            b = a.slice(-1).shift(),
            c = {};
        for (var d = 0; d < b.length - 1; d++) {
            var e = b[d + 1].x - b[d].x;
            c[e] = c[e] || 0, c[e]++
        }
        var f = {
            count: 0
        };
        return Rickshaw.keys(c).forEach(function(a) {
            f.count < c[a] && (f = {
                count: c[a],
                magnitude: a
            })
        }), this._frequentInterval = function() {
            return f
        }, f
    }
}), Rickshaw.namespace("Rickshaw.Graph.Renderer.Area"), Rickshaw.Graph.Renderer.Area = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
    name: "area",
    defaults: function($super) {
        return Rickshaw.extend($super(), {
            unstack: !1,
            fill: !1,
            stroke: !1
        })
    },
    seriesPathFactory: function() {
        var a = this.graph;
        return d3.svg.area().x(function(b) {
            return a.x(b.x)
        }).y0(function(b) {
            return a.y(b.y0)
        }).y1(function(b) {
            return a.y(b.y + b.y0)
        }).interpolate(a.interpolation).tension(this.tension)
    },
    seriesStrokeFactory: function() {
        var a = this.graph;
        return d3.svg.line().x(function(b) {
            return a.x(b.x)
        }).y(function(b) {
            return a.y(b.y + b.y0)
        }).interpolate(a.interpolation).tension(this.tension)
    },
    render: function() {
        var a = this.graph;
        a.vis.selectAll("*").remove();
        var b = a.vis.selectAll("path").data(this.graph.stackedData).enter().insert("svg:g", "g");
        b.append("svg:path").attr("d",
            this.seriesPathFactory()).attr("class", "area"), this.stroke && b.append("svg:path").attr("d", this.seriesStrokeFactory()).attr("class", "line");
        var c = 0;
        a.series.forEach(function(a) {
            if (a.disabled) return;
            a.path = b[0][c++], this._styleSeries(a)
        }, this)
    },
    _styleSeries: function(a) {
        if (!a.path) return;
        d3.select(a.path).select(".area").attr("fill", a.color), this.stroke && d3.select(a.path).select(".line").attr("fill", "none").attr("stroke", a.stroke || d3.interpolateRgb(a.color, "black")(.125)).attr("stroke-width", this.strokeWidth), a.className && a.path.setAttribute("class", a.className)
    }
}), Rickshaw.namespace("Rickshaw.Graph.Renderer.ScatterPlot"), Rickshaw.Graph.Renderer.ScatterPlot = Rickshaw.Class.create(Rickshaw.Graph.Renderer, {
    name: "scatterplot",
    defaults: function($super) {
        return Rickshaw.extend($super(), {
            unstack: !0,
            fill: !0,
            stroke: !1,
            padding: {
                top: .01,
                right: .01,
                bottom: .01,
                left: .01
            },
            dotSize: 4
        })
    },
    initialize: function($super, a) {
        $super(a)
    },
    render: function() {
        var a = this.graph;
        a.vis.selectAll("*").remove(), a.series.forEach(function(b) {
            if (b.disabled) return;
            var c = a.vis.selectAll("path").data(b.stack).enter().append("svg:circle").attr("cx", function(b) {
                return a.x(b.x)
            }).attr("cy", function(b) {
                return a.y(b.y)
            }).attr("r", function(b) {
                return "r" in b ? b.r : a.renderer.dotSize
            });
            Array.prototype.forEach.call(c[0], function(a) {
                a.setAttribute("fill", b.color)
            })
        }, this)
    }
}), Rickshaw.namespace("Rickshaw.Graph.Smoother"), Rickshaw.Graph.Smoother = function(a) {
    this.graph = a.graph, this.element = a.element;
    var b = this;
    this.aggregationScale = 1, this.element && $(function() {
        $(b.element).slider({
            min: 1,
            max: 100,
            slide: function(a, c) {
                b.setScale(c.value), b.graph.update()
            }
        })
    }), b.graph.stackData.hooks.data.push({
        name: "smoother",
        orderPosition: 50,
        f: function(a) {
            var c = [];
            return a.forEach(function(a) {
                var d = [];
                while (a.length) {
                    var e = 0,
                        f = 0,
                        g = a.splice(0, b.aggregationScale);
                    g.forEach(function(a) {
                        e += a.x / g.length, f += a.y / g.length
                    }), d.push({
                        x: e,
                        y: f
                    })
                }
                c.push(d)
            }), c
        }
    }), this.setScale = function(a) {
        if (a < 1) throw "scale out of range: " + a;
        this.aggregationScale = a, this.graph.update()
    }
}, Rickshaw.namespace("Rickshaw.Graph.Unstacker"), Rickshaw.Graph.Unstacker = function(a) {
    this.graph = a.graph;
    var b = this;
    this.graph.stackData.hooks.after.push({
        name: "unstacker",
        f: function(a) {
            return b.graph.renderer.unstack ? (a.forEach(function(a) {
                a.forEach(function(a) {
                    a.y0 = 0
                })
            }), a) : a
        }
    })
}, Rickshaw.namespace("Rickshaw.Series"), Rickshaw.Series = Rickshaw.Class.create(Array, {
    initialize: function(a, b, c) {
        c = c || {}, this.palette = new Rickshaw.Color.Palette(b), this.timeBase = typeof c.timeBase == "undefined" ? Math.floor((new Date).getTime() / 1e3) : c.timeBase;
        var d = typeof c.timeInterval == "undefined" ? 1e3 : c.timeInterval;
        this.setTimeInterval(d), a && typeof a == "object" && a instanceof Array && a.forEach(function(a) {
            this.addItem(a)
        }, this)
    },
    addItem: function(a) {
        if (typeof a.name == "undefined") throw "addItem() needs a name";
        a.color = a.color || this.palette.color(a.name), a.data = a.data || [], a.data.length == 0 && this.length && this.getIndex() > 0 ? this[0].data.forEach(function(b) {
            a.data.push({
                x: b.x,
                y: 0
            })
        }) : a.data.length == 0 && a.data.push({
            x: this.timeBase - (this.timeInterval || 0),
            y: 0
        }), this.push(a), this.legend && this.legend.addLine(this.itemByName(a.name))
    },
    addData: function(a) {
        var b = this.getIndex();
        Rickshaw.keys(a).forEach(function(a) {
            this.itemByName(a) || this.addItem({
                name: a
            })
        }, this), this.forEach(function(c) {
            c.data.push({
                x: (b * this.timeInterval || 1) + this.timeBase,
                y: a[c.name] || 0
            })
        }, this)
    },
    getIndex: function() {
        return this[0] && this[0].data && this[0].data.length ? this[0].data.length : 0
    },
    itemByName: function(a) {
        for (var b = 0; b < this.length; b++)
            if (this[b].name == a) return this[b]
    },
    setTimeInterval: function(a) {
        this.timeInterval = a / 1e3
    },
    setTimeBase: function(a) {
        this.timeBase = a
    },
    dump: function() {
        var a = {
            timeBase: this.timeBase,
            timeInterval: this.timeInterval,
            items: []
        };
        return this.forEach(function(b) {
            var c = {
                color: b.color,
                name: b.name,
                data: []
            };
            b.data.forEach(function(a) {
                c.data.push({
                    x: a.x,
                    y: a.y
                })
            }), a.items.push(c)
        }), a
    },
    load: function(a) {
        a.timeInterval && (this.timeInterval = a.timeInterval), a.timeBase && (this.timeBase = a.timeBase), a.items && a.items.forEach(function(a) {
            this.push(a), this.legend && this.legend.addLine(this.itemByName(a.name))
        }, this)
    }
}), Rickshaw.Series.zeroFill = function(a) {
    var b, c = 0,
        d = a.map(function(a) {
            return a.data
        });
    while (c < Math.max.apply(null, d.map(function(a) {
            return a.length
        }))) b = Math.min.apply(null, d.filter(function(a) {
        return a[c]
    }).map(function(a) {
        return a[c].x
    })), d.forEach(function(a) {
        (!a[c] || a[c].x != b) && a.splice(c, 0, {
            x: b,
            y: 0
        })
    }), c++
}, Rickshaw.namespace("Rickshaw.Series.FixedDuration"), Rickshaw.Series.FixedDuration = Rickshaw.Class.create(Rickshaw.Series, {
    initialize: function(a, b, c) {
        var c = c || {};
        if (typeof c.timeInterval == "undefined") throw new Error("FixedDuration series requires timeInterval");
        if (typeof c.maxDataPoints == "undefined") throw new Error("FixedDuration series requires maxDataPoints");
        this.palette = new Rickshaw.Color.Palette(b), this.timeBase = typeof c.timeBase == "undefined" ? Math.floor((new Date).getTime() / 1e3) : c.timeBase, this.setTimeInterval(c.timeInterval), this[0] && this[0].data && this[0].data.length ? (this.currentSize = this[0].data.length, this.currentIndex = this[0].data.length) : (this.currentSize = 0, this.currentIndex = 0), this.maxDataPoints = c.maxDataPoints, a && typeof a == "object" && a instanceof Array && (a.forEach(function(a) {
            this.addItem(a)
        }, this), this.currentSize += 1, this.currentIndex += 1), this.timeBase -= (this.maxDataPoints - this.currentSize) * this.timeInterval;
        if (typeof this.maxDataPoints != "undefined" && this.currentSize < this.maxDataPoints)
            for (var d = this.maxDataPoints - this.currentSize - 1; d > 0; d--) this.currentSize += 1, this.currentIndex += 1, this.forEach(function(a) {
                a.data.unshift({
                    x: ((d - 1) * this.timeInterval || 1) + this.timeBase,
                    y: 0,
                    i: d
                })
            }, this)
    },
    addData: function($super, a) {
        $super(a), this.currentSize += 1, this.currentIndex += 1;
        if (this.maxDataPoints !== undefined)
            while (this.currentSize > this.maxDataPoints) this.dropData()
    },
    dropData: function() {
        this.forEach(function(a) {
            a.data.splice(0, 1)
        }), this.currentSize -= 1
    },
    getIndex: function() {
        return this.currentIndex
    }
});
