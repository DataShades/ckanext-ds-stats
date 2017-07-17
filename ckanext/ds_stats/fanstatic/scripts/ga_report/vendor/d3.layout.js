(function() {
    function a(a) {
        var b = a.source,
            d = a.target,
            e = c(b, d),
            f = [b];
        while (b !== e) b = b.parent, f.push(b);
        var g = f.length;
        while (d !== e) f.splice(g, 0, d), d = d.parent;
        return f
    }

    function b(a) {
        var b = [],
            c = a.parent;
        while (c != null) b.push(a), a = c, c = c.parent;
        return b.push(a), b
    }

    function c(a, c) {
        if (a === c) return a;
        var d = b(a),
            e = b(c),
            f = d.pop(),
            g = e.pop(),
            h = null;
        while (f === g) h = f, f = d.pop(), g = e.pop();
        return h
    }

    function g(a) {
        a.fixed |= 2
    }

    function h(a) {
        a !== f && (a.fixed &= 1)
    }

    function i() {
        j(), f.fixed &= 1, e = f = null
    }

    function j() {
        f.px += d3.event.dx, f.py += d3.event.dy, e.resume()
    }

    function k(a, b, c) {
        var d = 0,
            e = 0;
        a.charge = 0;
        if (!a.leaf) {
            var f = a.nodes,
                g = f.length,
                h = -1,
                i;
            while (++h < g) {
                i = f[h];
                if (i == null) continue;
                k(i, b, c), a.charge += i.charge, d += i.charge * i.cx, e += i.charge * i.cy
            }
        }
        if (a.point) {
            a.leaf || (a.point.x += Math.random() - .5, a.point.y += Math.random() - .5);
            var j = b * c[a.point.index];
            a.charge += a.pointCharge = j, d += j * a.point.x, e += j * a.point.y
        }
        a.cx = d / a.charge, a.cy = e / a.charge
    }

    function l(a) {
        return 20
    }

    function m(a) {
        return 1
    }

    function o(a) {
        return a.x
    }

    function p(a) {
        return a.y
    }

    function q(a, b, c) {
        a.y0 = b, a.y = c
    }

    function t(a) {
        var b = 1,
            c = 0,
            d = a[0][1],
            e, f = a.length;
        for (; b < f; ++b)(e = a[b][1]) > d && (c = b, d = e);
        return c
    }

    function u(a) {
        return a.reduce(v, 0)
    }

    function v(a, b) {
        return a + b[1]
    }

    function w(a, b) {
        return x(a, Math.ceil(Math.log(b.length) / Math.LN2 + 1))
    }

    function x(a, b) {
        var c = -1,
            d = +a[0],
            e = (a[1] - d) / b,
            f = [];
        while (++c <= b) f[c] = e * c + d;
        return f
    }

    function y(a) {
        return [d3.min(a), d3.max(a)]
    }

    function z(a, b) {
        return a.sort = d3.rebind(a, b.sort), a.children = d3.rebind(a, b.children), a.links = D, a.value = d3.rebind(a, b.value), a.nodes = function(b) {
            return E = !0, (a.nodes = a)(b)
        }, a
    }

    function A(a) {
        return a.children
    }

    function B(a) {
        return a.value
    }

    function C(a, b) {
        return b.value - a.value
    }

    function D(a) {
        return d3.merge(a.map(function(a) {
            return (a.children || []).map(function(b) {
                return {
                    source: a,
                    target: b
                }
            })
        }))
    }

    function F(a, b) {
        return a.value - b.value
    }

    function G(a, b) {
        var c = a._pack_next;
        a._pack_next = b, b._pack_prev = a, b._pack_next = c, c._pack_prev = b
    }

    function H(a, b) {
        a._pack_next = b, b._pack_prev = a
    }

    function I(a, b) {
        var c = b.x - a.x,
            d = b.y - a.y,
            e = a.r + b.r;
        return e * e - c * c - d * d > .001
    }

    function J(a) {
        function l(a) {
            b = Math.min(a.x - a.r, b), c = Math.max(a.x + a.r, c), d = Math.min(a.y - a.r, d), e = Math.max(a.y + a.r, e)
        }
        var b = Infinity,
            c = -Infinity,
            d = Infinity,
            e = -Infinity,
            f = a.length,
            g, h, i, j, k;
        a.forEach(K), g = a[0], g.x = -g.r, g.y = 0, l(g);
        if (f > 1) {
            h = a[1], h.x = h.r, h.y = 0, l(h);
            if (f > 2) {
                i = a[2], O(g, h, i), l(i), G(g, i), g._pack_prev = i, G(i, h), h = g._pack_next;
                for (var m = 3; m < f; m++) {
                    O(g, h, i = a[m]);
                    var n = 0,
                        o = 1,
                        p = 1;
                    for (j = h._pack_next; j !== h; j = j._pack_next, o++)
                        if (I(j, i)) {
                            n = 1;
                            break
                        }
                    if (n == 1)
                        for (k = g._pack_prev; k !== j._pack_prev; k = k._pack_prev, p++)
                            if (I(k, i)) {
                                p < o && (n = -1, j = k);
                                break
                            }
                    n == 0 ? (G(g, i), h = i, l(i)) : n > 0 ? (H(g, j), h = j, m--) : (H(j, h), g = j, m--)
                }
            }
        }
        var q = (b + c) / 2,
            r = (d + e) / 2,
            s = 0;
        for (var m = 0; m < f; m++) {
            var t = a[m];
            t.x -= q, t.y -= r, s = Math.max(s, t.r + Math.sqrt(t.x * t.x + t.y * t.y))
        }
        return a.forEach(L), s
    }

    function K(a) {
        a._pack_next = a._pack_prev = a
    }

    function L(a) {
        delete a._pack_next, delete a._pack_prev
    }

    function M(a) {
        var b = a.children;
        b && b.length ? (b.forEach(M), a.r = J(b)) : a.r = Math.sqrt(a.value)
    }

    function N(a, b, c, d) {
        var e = a.children;
        a.x = b += d * a.x, a.y = c += d * a.y, a.r *= d;
        if (e) {
            var f = -1,
                g = e.length;
            while (++f < g) N(e[f], b, c, d)
        }
    }

    function O(a, b, c) {
        var d = a.r + c.r,
            e = b.x - a.x,
            f = b.y - a.y;
        if (d && (e || f)) {
            var g = b.r + c.r,
                h = Math.sqrt(e * e + f * f),
                i = Math.max(-1, Math.min(1, (d * d + h * h - g * g) / (2 * d * h))),
                j = Math.acos(i),
                k = i * (d /= h),
                l = Math.sin(j) * d;
            c.x = a.x + k * e + l * f, c.y = a.y + k * f - l * e
        } else c.x = a.x + d, c.y = a.y
    }

    function P(a) {
        return 1 + d3.max(a, function(a) {
            return a.y
        })
    }

    function Q(a) {
        return a.reduce(function(a, b) {
            return a + b.x
        }, 0) / a.length
    }

    function R(a) {
        var b = a.children;
        return b && b.length ? R(b[0]) : a
    }

    function S(a) {
        var b = a.children,
            c;
        return b && (c = b.length) ? S(b[c - 1]) : a
    }

    function T(a, b) {
        return a.parent == b.parent ? 1 : 2
    }

    function U(a) {
        var b = a.children;
        return b && b.length ? b[0] : a._tree.thread
    }

    function V(a) {
        var b = a.children,
            c;
        return b && (c = b.length) ? b[c - 1] : a._tree.thread
    }

    function W(a, b) {
        var c = a.children;
        if (c && (e = c.length)) {
            var d, e, f = -1;
            while (++f < e) b(d = W(c[f], b), a) > 0 && (a = d)
        }
        return a
    }

    function X(a, b) {
        return a.x - b.x
    }

    function Y(a, b) {
        return b.x - a.x
    }

    function Z(a, b) {
        return a.depth - b.depth
    }

    function $(a, b) {
        function c(a, d) {
            var e = a.children;
            if (e && (i = e.length)) {
                var f, g = null,
                    h = -1,
                    i;
                while (++h < i) f = e[h], c(f, g), g = f
            }
            b(a, d)
        }
        c(a, null)
    }

    function _(a) {
        var b = 0,
            c = 0,
            d = a.children,
            e = d.length,
            f;
        while (--e >= 0) f = d[e]._tree, f.prelim += b, f.mod += b, b += f.shift + (c += f.change)
    }

    function ba(a, b, c) {
        a = a._tree, b = b._tree;
        var d = c / (b.number - a.number);
        a.change += d, b.change -= d, b.shift += c, b.prelim += c, b.mod += c
    }

    function bb(a, b, c) {
        return a._tree.ancestor.parent == b.parent ? a._tree.ancestor : c
    }

    function bc(a) {
        return {
            x: a.x,
            y: a.y,
            dx: a.dx,
            dy: a.dy
        }
    }

    function bd(a, b) {
        var c = a.x + b[3],
            d = a.y + b[0],
            e = a.dx - b[1] - b[3],
            f = a.dy - b[0] - b[2];
        return e < 0 && (c += e / 2, e = 0), f < 0 && (d += f / 2, f = 0), {
            x: c,
            y: d,
            dx: e,
            dy: f
        }
    }
    d3.layout = {}, d3.layout.bundle = function() {
        return function(b) {
            var c = [],
                d = -1,
                e = b.length;
            while (++d < e) c.push(a(b[d]));
            return c
        }
    }, d3.layout.chord = function() {
        function j() {
            var a = {},
                j = [],
                l = d3.range(e),
                m = [],
                n, o, p, q, r;
            b = [], c = [], n = 0, q = -1;
            while (++q < e) {
                o = 0, r = -1;
                while (++r < e) o += d[q][r];
                j.push(o), m.push(d3.range(e)), n += o
            }
            g && l.sort(function(a, b) {
                return g(j[a], j[b])
            }), h && m.forEach(function(a, b) {
                a.sort(function(a, c) {
                    return h(d[b][a], d[b][c])
                })
            }), n = (2 * Math.PI - f * e) / n, o = 0, q = -1;
            while (++q < e) {
                p = o, r = -1;
                while (++r < e) {
                    var s = l[q],
                        t = m[s][r],
                        u = d[s][t],
                        v = o,
                        w = o += u * n;
                    a[s + "-" + t] = {
                        index: s,
                        subindex: t,
                        startAngle: v,
                        endAngle: w,
                        value: u
                    }
                }
                c.push({
                    index: s,
                    startAngle: p,
                    endAngle: o,
                    value: (o - p) / n
                }), o += f
            }
            q = -1;
            while (++q < e) {
                r = q - 1;
                while (++r < e) {
                    var x = a[q + "-" + r],
                        y = a[r + "-" + q];
                    (x.value || y.value) && b.push(x.value < y.value ? {
                        source: y,
                        target: x
                    } : {
                        source: x,
                        target: y
                    })
                }
            }
            i && k()
        }

        function k() {
            b.sort(function(a, b) {
                return i((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2)
            })
        }
        var a = {},
            b, c, d, e, f = 0,
            g, h, i;
        return a.matrix = function(f) {
            return arguments.length ? (e = (d = f) && d.length, b = c = null, a) : d
        }, a.padding = function(d) {
            return arguments.length ? (f = d, b = c = null, a) : f
        }, a.sortGroups = function(d) {
            return arguments.length ? (g = d, b = c = null, a) : g
        }, a.sortSubgroups = function(c) {
            return arguments.length ? (h = c, b = null, a) : h
        }, a.sortChords = function(c) {
            return arguments.length ? (i = c, b && k(), a) : i
        }, a.chords = function() {
            return b || j(), b
        }, a.groups = function() {
            return c || j(), c
        }, a
    }, d3.layout.force = function() {
        function A(a) {
            return function(b, c, d, e, f) {
                if (b.point !== a) {
                    var g = b.cx - a.x,
                        h = b.cy - a.y,
                        i = 1 / Math.sqrt(g * g + h * h);
                    if ((e - c) * i < t) {
                        var j = b.charge * i * i;
                        return a.px -= g * j, a.py -= h * j, !0
                    }
                    if (b.point && isFinite(i)) {
                        var j = b.pointCharge * i * i;
                        a.px -= g * j, a.py -= h * j
                    }
                }
                return !b.charge
            }
        }

        function B() {
            var a = v.length,
                d = w.length,
                e, f, g, h, i, j, l, m, p;
            for (f = 0; f < d; ++f) {
                g = w[f], h = g.source, i = g.target, m = i.x - h.x, p = i.y - h.y;
                if (j = m * m + p * p) j = n * y[f] * ((j = Math.sqrt(j)) - x[f]) / j, m *= j, p *= j, i.x -= m * (l = h.weight / (i.weight + h.weight)), i.y -= p * l, h.x += m * (l = 1 - l), h.y += p * l
            }
            if (l = n * s) {
                m = c[0] / 2, p = c[1] / 2, f = -1;
                if (l)
                    while (++f < a) g = v[f], g.x += (m - g.x) * l, g.y += (p - g.y) * l
            }
            if (r) {
                k(e = d3.geom.quadtree(v), n, z), f = -1;
                while (++f < a)(g = v[f]).fixed || e.visit(A(g))
            }
            f = -1;
            while (++f < a) g = v[f], g.fixed ? (g.x = g.px, g.y = g.py) : (g.x -= (g.px - (g.px = g.x)) * o, g.y -= (g.py - (g.py = g.y)) * o);
            return b.tick({
                type: "tick",
                alpha: n
            }), (n *= .99) < .005
        }

        function C(b) {
            g(f = b), e = a
        }
        var a = {},
            b = d3.dispatch("tick"),
            c = [1, 1],
            d, n, o = .9,
            p = l,
            q = m,
            r = -30,
            s = .1,
            t = .8,
            u, v = [],
            w = [],
            x, y, z;
        return a.on = function(c, d) {
            return b.on(c, d), a
        }, a.nodes = function(b) {
            return arguments.length ? (v = b, a) : v
        }, a.links = function(b) {
            return arguments.length ? (w = b, a) : w
        }, a.size = function(b) {
            return arguments.length ? (c = b, a) : c
        }, a.linkDistance = function(b) {
            return arguments.length ? (p = d3.functor(b), a) : p
        }, a.distance = a.linkDistance, a.linkStrength = function(b) {
            return arguments.length ? (q = d3.functor(b), a) : q
        }, a.friction = function(b) {
            return arguments.length ? (o = b, a) : o
        }, a.charge = function(b) {
            return arguments.length ? (r = typeof b == "function" ? b : +b, a) : r
        }, a.gravity = function(b) {
            return arguments.length ? (s = b, a) : s
        }, a.theta = function(b) {
            return arguments.length ? (t = b, a) : t
        }, a.start = function() {
            function k(a, c) {
                var d = l(b),
                    e = -1,
                    f = d.length,
                    g;
                while (++e < f)
                    if (!isNaN(g = d[e][a])) return g;
                return Math.random() * c
            }

            function l() {
                if (!i) {
                    i = [];
                    for (d = 0; d < e; ++d) i[d] = [];
                    for (d = 0; d < f; ++d) {
                        var a = w[d];
                        i[a.source.index].push(a.target), i[a.target.index].push(a.source)
                    }
                }
                return i[b]
            }
            var b, d, e = v.length,
                f = w.length,
                g = c[0],
                h = c[1],
                i, j;
            for (b = 0; b < e; ++b)(j = v[b]).index = b, j.weight = 0;
            x = [], y = [];
            for (b = 0; b < f; ++b) j = w[b], typeof j.source == "number" && (j.source = v[j.source]), typeof j.target == "number" && (j.target = v[j.target]), x[b] = p.call(this, j, b), y[b] = q.call(this, j, b), ++j.source.weight, ++j.target.weight;
            for (b = 0; b < e; ++b) j = v[b], isNaN(j.x) && (j.x = k("x", g)), isNaN(j.y) && (j.y = k("y", h)), isNaN(j.px) && (j.px = j.x), isNaN(j.py) && (j.py = j.y);
            z = [];
            if (typeof r == "function")
                for (b = 0; b < e; ++b) z[b] = +r.call(this, v[b], b);
            else
                for (b = 0; b < e; ++b) z[b] = r;
            return a.resume()
        }, a.resume = function() {
            return n = .1, d3.timer(B), a
        }, a.stop = function() {
            return n = 0, a
        }, a.drag = function() {
            d || (d = d3.behavior.drag().on("dragstart", C).on("drag", j).on("dragend", i)), this.on("mouseover.force", g).on("mouseout.force", h).call(d)
        }, a
    };
    var e, f;
    d3.layout.partition = function() {
        function c(a, b, d, e) {
            var f = a.children;
            a.x = b, a.y = a.depth * e, a.dx = d, a.dy = e;
            if (f && (h = f.length)) {
                var g = -1,
                    h, i, j;
                d = a.value ? d / a.value : 0;
                while (++g < h) c(i = f[g], b, j = i.value * d, e), b += j
            }
        }

        function d(a) {
            var b = a.children,
                c = 0;
            if (b && (f = b.length)) {
                var e = -1,
                    f;
                while (++e < f) c = Math.max(c, d(b[e]))
            }
            return 1 + c
        }

        function e(e, f) {
            var g = a.call(this, e, f);
            return c(g[0], 0, b[0], b[1] / d(g[0])), g
        }
        var a = d3.layout.hierarchy(),
            b = [1, 1];
        return e.size = function(a) {
            return arguments.length ? (b = a, e) : b
        }, z(e, a)
    }, d3.layout.pie = function() {
        function f(g, h) {
            var i = g.map(function(b, c) {
                    return +a.call(f, b, c)
                }),
                j = +(typeof c == "function" ? c.apply(this, arguments) : c),
                k = ((typeof e == "function" ? e.apply(this, arguments) : e) - c) / d3.sum(i),
                l = d3.range(g.length);
            b != null && l.sort(b === n ? function(a, b) {
                return i[b] - i[a]
            } : function(a, c) {
                return b(g[a], g[c])
            });
            var m = l.map(function(a) {
                return {
                    data: g[a],
                    value: d = i[a],
                    startAngle: j,
                    endAngle: j += d * k
                }
            });
            return g.map(function(a, b) {
                return m[l[b]]
            })
        }
        var a = Number,
            b = n,
            c = 0,
            e = 2 * Math.PI;
        return f.value = function(b) {
            return arguments.length ? (a = b, f) : a
        }, f.sort = function(a) {
            return arguments.length ? (b = a, f) : b
        }, f.startAngle = function(a) {
            return arguments.length ? (c = a, f) : c
        }, f.endAngle = function(a) {
            return arguments.length ? (e = a, f) : e
        }, f
    };
    var n = {};
    d3.layout.stack = function() {
        function g(h, i) {
            var j = h.map(function(b, c) {
                    return a.call(g, b, c)
                }),
                k = j.map(function(a, b) {
                    return a.map(function(a, b) {
                        return [e.call(g, a, b), f.call(g, a, b)]
                    })
                }),
                l = b.call(g, k, i);
            j = d3.permute(j, l), k = d3.permute(k, l);
            var m = c.call(g, k, i),
                n = j.length,
                o = j[0].length,
                p, q, r;
            for (q = 0; q < o; ++q) {
                d.call(g, j[0][q], r = m[q], k[0][q][1]);
                for (p = 1; p < n; ++p) d.call(g, j[p][q], r += k[p - 1][q][1], k[p][q][1])
            }
            return h
        }
        var a = Object,
            b = r["default"],
            c = s.zero,
            d = q,
            e = o,
            f = p;
        return g.values = function(b) {
            return arguments.length ? (a = b, g) : a
        }, g.order = function(a) {
            return arguments.length ? (b = typeof a == "function" ? a : r[a], g) : b
        }, g.offset = function(a) {
            return arguments.length ? (c = typeof a == "function" ? a : s[a], g) : c
        }, g.x = function(a) {
            return arguments.length ? (e = a, g) : e
        }, g.y = function(a) {
            return arguments.length ? (f = a, g) : f
        }, g.out = function(a) {
            return arguments.length ? (d = a, g) : d
        }, g
    };
    var r = {
            "inside-out": function(a) {
                var b = a.length,
                    c, d, e = a.map(t),
                    f = a.map(u),
                    g = d3.range(b).sort(function(a, b) {
                        return e[a] - e[b]
                    }),
                    h = 0,
                    i = 0,
                    j = [],
                    k = [];
                for (c = 0; c < b; ++c) d = g[c], h < i ? (h += f[d], j.push(d)) : (i += f[d], k.push(d));
                return k.reverse().concat(j)
            },
            reverse: function(a) {
                return d3.range(a.length).reverse()
            },
            "default": function(a) {
                return d3.range(a.length)
            }
        },
        s = {
            silhouette: function(a) {
                var b = a.length,
                    c = a[0].length,
                    d = [],
                    e = 0,
                    f, g, h, i = [];
                for (g = 0; g < c; ++g) {
                    for (f = 0, h = 0; f < b; f++) h += a[f][g][1];
                    h > e && (e = h), d.push(h)
                }
                for (g = 0; g < c; ++g) i[g] = (e - d[g]) / 2;
                return i
            },
            wiggle: function(a) {
                var b = a.length,
                    c = a[0],
                    d = c.length,
                    e = 0,
                    f, g, h, i, j, k, l, m, n, o = [];
                o[0] = m = n = 0;
                for (g = 1; g < d; ++g) {
                    for (f = 0, i = 0; f < b; ++f) i += a[f][g][1];
                    for (f = 0, j = 0, l = c[g][0] - c[g - 1][0]; f < b; ++f) {
                        for (h = 0, k = (a[f][g][1] - a[f][g - 1][1]) / (2 * l); h < f; ++h) k += (a[h][g][1] - a[h][g - 1][1]) / l;
                        j += k * a[f][g][1]
                    }
                    o[g] = m -= i ? j / i * l : 0, m < n && (n = m)
                }
                for (g = 0; g < d; ++g) o[g] -= n;
                return o
            },
            expand: function(a) {
                var b = a.length,
                    c = a[0].length,
                    d = 1 / b,
                    e, f, g, h = [];
                for (f = 0; f < c; ++f) {
                    for (e = 0, g = 0; e < b; e++) g += a[e][f][1];
                    if (g)
                        for (e = 0; e < b; e++) a[e][f][1] /= g;
                    else
                        for (e = 0; e < b; e++) a[e][f][1] = d
                }
                for (f = 0; f < c; ++f) h[f] = 0;
                return h
            },
            zero: function(a) {
                var b = -1,
                    c = a[0].length,
                    d = [];
                while (++b < c) d[b] = 0;
                return d
            }
        };
    d3.layout.histogram = function() {
        function e(e, f) {
            var g = [],
                h = e.map(b, this),
                i = c.call(this, h, f),
                j = d.call(this, i, h, f),
                k, f = -1,
                l = h.length,
                m = j.length - 1,
                n = a ? 1 : 1 / l,
                o;
            while (++f < m) k = g[f] = [], k.dx = j[f + 1] - (k.x = j[f]), k.y = 0;
            f = -1;
            while (++f < l) o = h[f], o >= i[0] && o <= i[1] && (k = g[d3.bisect(j, o, 1, m) - 1], k.y += n, k.push(e[f]));
            return g
        }
        var a = !0,
            b = Number,
            c = y,
            d = w;
        return e.value = function(a) {
            return arguments.length ? (b = a, e) : b
        }, e.range = function(a) {
            return arguments.length ? (c = d3.functor(a), e) : c
        }, e.bins = function(a) {
            return arguments.length ? (d = typeof a == "number" ? function(b) {
                return x(b, a)
            } : d3.functor(a), e) : d
        }, e.frequency = function(b) {
            return arguments.length ? (a = !!b, e) : a
        }, e
    }, d3.layout.hierarchy = function() {
        function e(f, h, i) {
            var j = b.call(g, f, h),
                k = E ? f : {
                    data: f
                };
            k.depth = h, i.push(k);
            if (j && (m = j.length)) {
                var l = -1,
                    m, n = k.children = [],
                    o = 0,
                    p = h + 1;
                while (++l < m) d = e(j[l], p, i), d.parent = k, n.push(d), o += d.value;
                a && n.sort(a), c && (k.value = o)
            } else c && (k.value = +c.call(g, f, h) || 0);
            return k
        }

        function f(a, b) {
            var d = a.children,
                e = 0;
            if (d && (i = d.length)) {
                var h = -1,
                    i, j = b + 1;
                while (++h < i) e += f(d[h], j)
            } else c && (e = +c.call(g, E ? a : a.data, b) || 0);
            return c && (a.value = e), e
        }

        function g(a) {
            var b = [];
            return e(a, 0, b), b
        }
        var a = C,
            b = A,
            c = B;
        return g.sort = function(b) {
            return arguments.length ? (a = b, g) : a
        }, g.children = function(a) {
            return arguments.length ? (b = a, g) : b
        }, g.value = function(a) {
            return arguments.length ? (c = a, g) : c
        }, g.revalue = function(a) {
            return f(a, 0), a
        }, g
    };
    var E = !1;
    d3.layout.pack = function() {
        function c(c, d) {
            var e = a.call(this, c, d),
                f = e[0];
            f.x = 0, f.y = 0, M(f);
            var g = b[0],
                h = b[1],
                i = 1 / Math.max(2 * f.r / g, 2 * f.r / h);
            return N(f, g / 2, h / 2, i), e
        }
        var a = d3.layout.hierarchy().sort(F),
            b = [1, 1];
        return c.size = function(a) {
            return arguments.length ? (b = a, c) : b
        }, z(c, a)
    }, d3.layout.cluster = function() {
        function d(d, e) {
            var f = a.call(this, d, e),
                g = f[0],
                h, i = 0,
                j, k;
            $(g, function(a) {
                var c = a.children;
                c && c.length ? (a.x = Q(c), a.y = P(c)) : (a.x = h ? i += b(a, h) : 0, a.y = 0, h = a)
            });
            var l = R(g),
                m = S(g),
                n = l.x - b(l, m) / 2,
                o = m.x + b(m, l) / 2;
            return $(g, function(a) {
                a.x = (a.x - n) / (o - n) * c[0], a.y = (1 - a.y / g.y) * c[1]
            }), f
        }
        var a = d3.layout.hierarchy().sort(null).value(null),
            b = T,
            c = [1, 1];
        return d.separation = function(a) {
            return arguments.length ? (b = a, d) : b
        }, d.size = function(a) {
            return arguments.length ? (c = a, d) : c
        }, z(d, a)
    }, d3.layout.tree = function() {
        function d(d, e) {
            function h(a, c) {
                var d = a.children,
                    e = a._tree;
                if (d && (f = d.length)) {
                    var f, g = d[0],
                        i, k = g,
                        l, m = -1;
                    while (++m < f) l = d[m], h(l, i), k = j(l, i, k), i = l;
                    _(a);
                    var n = .5 * (g._tree.prelim + l._tree.prelim);
                    c ? (e.prelim = c._tree.prelim + b(a, c), e.mod = e.prelim - n) : e.prelim = n
                } else c && (e.prelim = c._tree.prelim + b(a, c))
            }

            function i(a, b) {
                a.x = a._tree.prelim + b;
                var c = a.children;
                if (c && (e = c.length)) {
                    var d = -1,
                        e;
                    b += a._tree.mod;
                    while (++d < e) i(c[d], b)
                }
            }

            function j(a, c, d) {
                if (c) {
                    var e = a,
                        f = a,
                        g = c,
                        h = a.parent.children[0],
                        i = e._tree.mod,
                        j = f._tree.mod,
                        k = g._tree.mod,
                        l = h._tree.mod,
                        m;
                    while (g = V(g), e = U(e), g && e) h = U(h), f = V(f), f._tree.ancestor = a, m = g._tree.prelim + k - e._tree.prelim - i + b(g, e), m > 0 && (ba(bb(g, a, d), a, m), i += m, j += m), k += g._tree.mod, i += e._tree.mod, l += h._tree.mod, j += f._tree.mod;
                    g && !V(f) && (f._tree.thread = g, f._tree.mod += k - j), e && !U(h) && (h._tree.thread = e, h._tree.mod += i - l, d = a)
                }
                return d
            }
            var f = a.call(this, d, e),
                g = f[0];
            $(g, function(a, b) {
                a._tree = {
                    ancestor: a,
                    prelim: 0,
                    mod: 0,
                    change: 0,
                    shift: 0,
                    number: b ? b._tree.number + 1 : 0
                }
            }), h(g), i(g, -g._tree.prelim);
            var k = W(g, Y),
                l = W(g, X),
                m = W(g, Z),
                n = k.x - b(k, l) / 2,
                o = l.x + b(l, k) / 2,
                p = m.depth || 1;
            return $(g, function(a) {
                a.x = (a.x - n) / (o - n) * c[0], a.y = a.depth / p * c[1], delete a._tree
            }), f
        }
        var a = d3.layout.hierarchy().sort(null).value(null),
            b = T,
            c = [1, 1];
        return d.separation = function(a) {
            return arguments.length ? (b = a, d) : b
        }, d.size = function(a) {
            return arguments.length ? (c = a, d) : c
        }, z(d, a)
    }, d3.layout.treemap = function() {
        function i(a, b) {
            var c = -1,
                d = a.length,
                e, f;
            while (++c < d) f = (e = a[c]).value * (b < 0 ? 0 : b), e.area = isNaN(f) || f <= 0 ? 0 : f
        }

        function j(a) {
            var b = a.children;
            if (b && b.length) {
                var c = e(a),
                    d = [],
                    f = b.slice(),
                    g, h = Infinity,
                    k, n = Math.min(c.dx, c.dy),
                    o;
                i(f, c.dx * c.dy / a.value), d.area = 0;
                while ((o = f.length) > 0) d.push(g = f[o - 1]), d.area += g.area, (k = l(d, n)) <= h ? (f.pop(), h = k) : (d.area -= d.pop().area, m(d, n, c, !1), n = Math.min(c.dx, c.dy), d.length = d.area = 0, h = Infinity);
                d.length && (m(d, n, c, !0), d.length = d.area = 0), b.forEach(j)
            }
        }

        function k(a) {
            var b = a.children;
            if (b && b.length) {
                var c = e(a),
                    d = b.slice(),
                    f, g = [];
                i(d, c.dx * c.dy / a.value), g.area = 0;
                while (f = d.pop()) g.push(f), g.area += f.area, f.z != null && (m(g, f.z ? c.dx : c.dy, c, !d.length), g.length = g.area = 0);
                b.forEach(k)
            }
        }

        function l(a, b) {
            var c = a.area,
                d, e = 0,
                f = Infinity,
                g = -1,
                i = a.length;
            while (++g < i) {
                if (!(d = a[g].area)) continue;
                d < f && (f = d), d > e && (e = d)
            }
            return c *= c, b *= b, c ? Math.max(b * e * h / c, c / (b * f * h)) : Infinity
        }

        function m(a, c, d, e) {
            var f = -1,
                g = a.length,
                h = d.x,
                i = d.y,
                j = c ? b(a.area / c) : 0,
                k;
            if (c == d.dx) {
                if (e || j > d.dy) j = j ? d.dy : 0;
                while (++f < g) k = a[f], k.x = h, k.y = i, k.dy = j, h += k.dx = j ? b(k.area / j) : 0;
                k.z = !0, k.dx += d.x + d.dx - h, d.y += j, d.dy -= j
            } else {
                if (e || j > d.dx) j = j ? d.dx : 0;
                while (++f < g) k = a[f], k.x = h, k.y = i, k.dx = j, i += k.dy = j ? b(k.area / j) : 0;
                k.z = !1, k.dy += d.y + d.dy - i, d.x += j, d.dx -= j
            }
        }

        function n(b) {
            var d = g || a(b),
                e = d[0];
            return e.x = 0, e.y = 0, e.dx = c[0], e.dy = c[1], g && a.revalue(e), i([e], e.dx * e.dy / e.value), (g ? k : j)(e), f && (g = d), d
        }
        var a = d3.layout.hierarchy(),
            b = Math.round,
            c = [1, 1],
            d = null,
            e = bc,
            f = !1,
            g, h = .5 * (1 + Math.sqrt(5));
        return n.size = function(a) {
            return arguments.length ? (c = a, n) : c
        }, n.padding = function(a) {
            function b(b) {
                var c = a.call(n, b, b.depth);
                return c == null ? bc(b) : bd(b, typeof c == "number" ? [c, c, c, c] : c)
            }

            function c(b) {
                return bd(b, a)
            }
            if (!arguments.length) return d;
            var f;
            return e = (d = a) == null ? bc : (f = typeof a) === "function" ? b : f === "number" ? (a = [a, a, a, a], c) : c, n
        }, n.round = function(a) {
            return arguments.length ? (b = a ? Math.round : Number, n) : b != Number
        }, n.sticky = function(a) {
            return arguments.length ? (f = a, g = null, n) : f
        }, n.ratio = function(a) {
            return arguments.length ? (h = a, n) : h
        }, z(n, a)
    }
})();
