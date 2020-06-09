! function (e) {
    var t = {};

    function n(r) {
        if (t[r]) return t[r].exports;
        var o = t[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
    }
    n.m = e, n.c = t, n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: r
        })
    }, n.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, n.t = function (e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (n.r(r), Object.defineProperty(r, "default", {
                enumerable: !0,
                value: e
            }), 2 & t && "string" != typeof e)
            for (var o in e) n.d(r, o, function (t) {
                return e[t]
            }.bind(null, o));
        return r
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "", n(n.s = 44)
}([function (e, t, n) {
    var r = n(18)("wks"),
        o = n(12),
        c = n(3).Symbol,
        a = "function" == typeof c;
    (e.exports = function (e) {
        return r[e] || (r[e] = a && c[e] || (a ? c : o)("Symbol." + e))
    }).store = r
}, function (e, t, n) {
    e.exports = !n(6)((function () {
        return 7 != Object.defineProperty({}, "a", {
            get: function () {
                return 7
            }
        }).a
    }))
}, function (e, t, n) {
    var r = n(4),
        o = n(35),
        c = n(17),
        a = Object.defineProperty;
    t.f = n(1) ? Object.defineProperty : function (e, t, n) {
        if (r(e), t = c(t, !0), r(n), o) try {
            return a(e, t, n)
        } catch (e) {}
        if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");
        return "value" in n && (e[t] = n.value), e
    }
}, function (e, t) {
    var n = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
    "number" == typeof __g && (__g = n)
}, function (e, t, n) {
    var r = n(9);
    e.exports = function (e) {
        if (!r(e)) throw TypeError(e + " is not an object!");
        return e
    }
}, function (e, t, n) {
    var r = n(3),
        o = n(7),
        c = n(8),
        a = n(12)("src"),
        i = n(47),
        u = ("" + i).split("toString");
    n(13).inspectSource = function (e) {
        return i.call(e)
    }, (e.exports = function (e, t, n, i) {
        var s = "function" == typeof n;
        s && (c(n, "name") || o(n, "name", t)), e[t] !== n && (s && (c(n, a) || o(n, a, e[t] ? "" + e[t] : u.join(String(t)))), e === r ? e[t] = n : i ? e[t] ? e[t] = n : o(e, t, n) : (delete e[t], o(e, t, n)))
    })(Function.prototype, "toString", (function () {
        return "function" == typeof this && this[a] || i.call(this)
    }))
}, function (e, t) {
    e.exports = function (e) {
        try {
            return !!e()
        } catch (e) {
            return !0
        }
    }
}, function (e, t, n) {
    var r = n(2),
        o = n(11);
    e.exports = n(1) ? function (e, t, n) {
        return r.f(e, t, o(1, n))
    } : function (e, t, n) {
        return e[t] = n, e
    }
}, function (e, t) {
    var n = {}.hasOwnProperty;
    e.exports = function (e, t) {
        return n.call(e, t)
    }
}, function (e, t) {
    e.exports = function (e) {
        return "object" == typeof e ? null !== e : "function" == typeof e
    }
}, function (e, t, n) {
    var r = n(54),
        o = n(14);
    e.exports = function (e) {
        return r(o(e))
    }
}, function (e, t) {
    e.exports = function (e, t) {
        return {
            enumerable: !(1 & e),
            configurable: !(2 & e),
            writable: !(4 & e),
            value: t
        }
    }
}, function (e, t) {
    var n = 0,
        r = Math.random();
    e.exports = function (e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++n + r).toString(36))
    }
}, function (e, t) {
    var n = e.exports = {
        version: "2.6.11"
    };
    "number" == typeof __e && (__e = n)
}, function (e, t) {
    e.exports = function (e) {
        if (null == e) throw TypeError("Can't call method on  " + e);
        return e
    }
}, function (e, t, n) {
    var r = n(3),
        o = n(13),
        c = n(7),
        a = n(5),
        i = n(26),
        u = function (e, t, n) {
            var s, f, l, p, d = e & u.F,
                v = e & u.G,
                y = e & u.S,
                h = e & u.P,
                m = e & u.B,
                g = v ? r : y ? r[t] || (r[t] = {}) : (r[t] || {}).prototype,
                b = v ? o : o[t] || (o[t] = {}),
                S = b.prototype || (b.prototype = {});
            for (s in v && (n = t), n) l = ((f = !d && g && void 0 !== g[s]) ? g : n)[s], p = m && f ? i(l, r) : h && "function" == typeof l ? i(Function.call, l) : l, g && a(g, s, l, e & u.U), b[s] != l && c(b, s, p), h && S[s] != l && (S[s] = l)
        };
    r.core = o, u.F = 1, u.G = 2, u.S = 4, u.P = 8, u.B = 16, u.W = 32, u.U = 64, u.R = 128, e.exports = u
}, function (e, t) {
    e.exports = {}
}, function (e, t, n) {
    var r = n(9);
    e.exports = function (e, t) {
        if (!r(e)) return e;
        var n, o;
        if (t && "function" == typeof (n = e.toString) && !r(o = n.call(e))) return o;
        if ("function" == typeof (n = e.valueOf) && !r(o = n.call(e))) return o;
        if (!t && "function" == typeof (n = e.toString) && !r(o = n.call(e))) return o;
        throw TypeError("Can't convert object to primitive value")
    }
}, function (e, t, n) {
    var r = n(13),
        o = n(3),
        c = o["__core-js_shared__"] || (o["__core-js_shared__"] = {});
    (e.exports = function (e, t) {
        return c[e] || (c[e] = void 0 !== t ? t : {})
    })("versions", []).push({
        version: r.version,
        mode: n(19) ? "pure" : "global",
        copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
    })
}, function (e, t) {
    e.exports = !1
}, function (e, t) {
    var n = {}.toString;
    e.exports = function (e) {
        return n.call(e).slice(8, -1)
    }
}, function (e, t) {
    var n = Math.ceil,
        r = Math.floor;
    e.exports = function (e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? r : n)(e)
    }
}, function (e, t, n) {
    var r = n(39),
        o = n(30);
    e.exports = Object.keys || function (e) {
        return r(e, o)
    }
}, function (e, t, n) {
    var r = n(14);
    e.exports = function (e) {
        return Object(r(e))
    }
}, function (e, t, n) {
    "use strict";
    var r = n(4);
    e.exports = function () {
        var e = r(this),
            t = "";
        return e.global && (t += "g"), e.ignoreCase && (t += "i"), e.multiline && (t += "m"), e.unicode && (t += "u"), e.sticky && (t += "y"), t
    }
}, function (e, t, n) {
    var r = n(20),
        o = n(0)("toStringTag"),
        c = "Arguments" == r(function () {
            return arguments
        }());
    e.exports = function (e) {
        var t, n, a;
        return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (n = function (e, t) {
            try {
                return e[t]
            } catch (e) {}
        }(t = Object(e), o)) ? n : c ? r(t) : "Object" == (a = r(t)) && "function" == typeof t.callee ? "Arguments" : a
    }
}, function (e, t, n) {
    var r = n(51);
    e.exports = function (e, t, n) {
        if (r(e), void 0 === t) return e;
        switch (n) {
            case 1:
                return function (n) {
                    return e.call(t, n)
                };
            case 2:
                return function (n, r) {
                    return e.call(t, n, r)
                };
            case 3:
                return function (n, r, o) {
                    return e.call(t, n, r, o)
                }
        }
        return function () {
            return e.apply(t, arguments)
        }
    }
}, function (e, t, n) {
    var r = n(4),
        o = n(53),
        c = n(30),
        a = n(29)("IE_PROTO"),
        i = function () {},
        u = function () {
            var e, t = n(36)("iframe"),
                r = c.length;
            for (t.style.display = "none", n(57).appendChild(t), t.src = "javascript:", (e = t.contentWindow.document).open(), e.write("<script>document.F=Object<\/script>"), e.close(), u = e.F; r--;) delete u.prototype[c[r]];
            return u()
        };
    e.exports = Object.create || function (e, t) {
        var n;
        return null !== e ? (i.prototype = r(e), n = new i, i.prototype = null, n[a] = e) : n = u(), void 0 === t ? n : o(n, t)
    }
}, function (e, t, n) {
    var r = n(21),
        o = Math.min;
    e.exports = function (e) {
        return e > 0 ? o(r(e), 9007199254740991) : 0
    }
}, function (e, t, n) {
    var r = n(18)("keys"),
        o = n(12);
    e.exports = function (e) {
        return r[e] || (r[e] = o(e))
    }
}, function (e, t) {
    e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
}, function (e, t, n) {
    var r = n(2).f,
        o = n(8),
        c = n(0)("toStringTag");
    e.exports = function (e, t, n) {
        e && !o(e = n ? e : e.prototype, c) && r(e, c, {
            configurable: !0,
            value: t
        })
    }
}, function (e, t) {
    t.f = {}.propertyIsEnumerable
}, function (e, t, n) {
    var r = n(39),
        o = n(30).concat("length", "prototype");
    t.f = Object.getOwnPropertyNames || function (e) {
        return r(e, o)
    }
}, function (e, t, n) {
    var r = n(32),
        o = n(11),
        c = n(10),
        a = n(17),
        i = n(8),
        u = n(35),
        s = Object.getOwnPropertyDescriptor;
    t.f = n(1) ? s : function (e, t) {
        if (e = c(e), t = a(t, !0), u) try {
            return s(e, t)
        } catch (e) {}
        if (i(e, t)) return o(!r.f.call(e, t), e[t])
    }
}, function (e, t, n) {
    e.exports = !n(1) && !n(6)((function () {
        return 7 != Object.defineProperty(n(36)("div"), "a", {
            get: function () {
                return 7
            }
        }).a
    }))
}, function (e, t, n) {
    var r = n(9),
        o = n(3).document,
        c = r(o) && r(o.createElement);
    e.exports = function (e) {
        return c ? o.createElement(e) : {}
    }
}, function (e, t, n) {
    var r = n(21),
        o = n(14);
    e.exports = function (e) {
        return function (t, n) {
            var c, a, i = String(o(t)),
                u = r(n),
                s = i.length;
            return u < 0 || u >= s ? e ? "" : void 0 : (c = i.charCodeAt(u)) < 55296 || c > 56319 || u + 1 === s || (a = i.charCodeAt(u + 1)) < 56320 || a > 57343 ? e ? i.charAt(u) : c : e ? i.slice(u, u + 2) : a - 56320 + (c - 55296 << 10) + 65536
        }
    }
}, function (e, t, n) {
    "use strict";
    var r = n(19),
        o = n(15),
        c = n(5),
        a = n(7),
        i = n(16),
        u = n(52),
        s = n(31),
        f = n(58),
        l = n(0)("iterator"),
        p = !([].keys && "next" in [].keys()),
        d = function () {
            return this
        };
    e.exports = function (e, t, n, v, y, h, m) {
        u(n, t, v);
        var g, b, S, w = function (e) {
                if (!p && e in I) return I[e];
                switch (e) {
                    case "keys":
                    case "values":
                        return function () {
                            return new n(this, e)
                        }
                }
                return function () {
                    return new n(this, e)
                }
            },
            x = t + " Iterator",
            E = "values" == y,
            O = !1,
            I = e.prototype,
            T = I[l] || I["@@iterator"] || y && I[y],
            F = T || w(y),
            P = y ? E ? w("entries") : F : void 0,
            k = "Array" == t && I.entries || T;
        if (k && (S = f(k.call(new e))) !== Object.prototype && S.next && (s(S, x, !0), r || "function" == typeof S[l] || a(S, l, d)), E && T && "values" !== T.name && (O = !0, F = function () {
                return T.call(this)
            }), r && !m || !p && !O && I[l] || a(I, l, F), i[t] = F, i[x] = d, y)
            if (g = {
                    values: E ? F : w("values"),
                    keys: h ? F : w("keys"),
                    entries: P
                }, m)
                for (b in g) b in I || c(I, b, g[b]);
            else o(o.P + o.F * (p || O), t, g);
        return g
    }
}, function (e, t, n) {
    var r = n(8),
        o = n(10),
        c = n(55)(!1),
        a = n(29)("IE_PROTO");
    e.exports = function (e, t) {
        var n, i = o(e),
            u = 0,
            s = [];
        for (n in i) n != a && r(i, n) && s.push(n);
        for (; t.length > u;) r(i, n = t[u++]) && (~c(s, n) || s.push(n));
        return s
    }
}, function (e, t, n) {
    var r = n(3),
        o = n(13),
        c = n(19),
        a = n(41),
        i = n(2).f;
    e.exports = function (e) {
        var t = o.Symbol || (o.Symbol = c ? {} : r.Symbol || {});
        "_" == e.charAt(0) || e in t || i(t, e, {
            value: a.f(e)
        })
    }
}, function (e, t, n) {
    t.f = n(0)
}, function (e, t) {
    t.f = Object.getOwnPropertySymbols
}, function (e, t, n) {
    "use strict";
    var r, o, c = n(24),
        a = RegExp.prototype.exec,
        i = String.prototype.replace,
        u = a,
        s = (r = /a/, o = /b*/g, a.call(r, "a"), a.call(o, "a"), 0 !== r.lastIndex || 0 !== o.lastIndex),
        f = void 0 !== /()??/.exec("")[1];
    (s || f) && (u = function (e) {
        var t, n, r, o, u = this;
        return f && (n = new RegExp("^" + u.source + "$(?!\\s)", c.call(u))), s && (t = u.lastIndex), r = a.call(u, e), s && r && (u.lastIndex = u.global ? r.index + r[0].length : t), f && r && r.length > 1 && i.call(r[0], n, (function () {
            for (o = 1; o < arguments.length - 2; o++) void 0 === arguments[o] && (r[o] = void 0)
        })), r
    }), e.exports = u
}, function (e, t, n) {
    "use strict";
    n.r(t);
    n(45), n(48), n(49), n(50), n(59), n(65), n(69), n(70), n(75), n(80), n(81);

    function r(e, t, n) {
        return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }

    function o(e) {
        return function (e) {
            if (Array.isArray(e)) return c(e)
        }(e) || function (e) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e)
        }(e) || function (e, t) {
            if (!e) return;
            if ("string" == typeof e) return c(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            "Object" === n && e.constructor && (n = e.constructor.name);
            if ("Map" === n || "Set" === n) return Array.from(e);
            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return c(e, t)
        }(e) || function () {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function c(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    var a = document.getElementById("btnCalc"),
        i = document.getElementById("summaryCalc"),
        u = (document.getElementById("btnCopyCalc"), document.querySelector(".when-option-2020")),
        s = document.querySelector(".when-option-2019"),
        f = document.getElementById("onePriceForAll"),
        l = (document.getElementById("tariff"), document.getElementById("endOfAgreement")),
        p = document.getElementById("info35zl"),
        d = 0,
        v = 0,
        y = !0;
    p.addEventListener("click", (function () {
        if (y) {
            var e = i.innerHTML;
            i.innerHTML = e + '<br>Opłata handlowa <span class="value-of-calc-data">35zł / miesięcznie</span>  ----\x3e rocznie <span class="value-of-calc-data">420zł</span> oszczędności <span class="value-of-calc-data">na każdym PPE</span>', y = !1
        }
    })), f.checked = !1, m("tariff", "C11"), m("endOfAgreement", "2021");
    var h = function (e) {
        return parseFloat(e.replace(/\,/g, "."))
    };

    function m(e, t) {
        document.getElementById(e).value = t
    }
    var g = function () {
        i.style.padding = "0px", i.innerHTML = "", p.style.display = "none", y = !0
    };
    f.addEventListener("click", (function () {
        v = 0 === v ? 1 : 0
    }));
    var b = function () {
        p.style.display = "block", 0 === d ? Y.mainCalcFn() : 1 === d ? X.mainCalcFn() : 2 === d ? Z.mainCalcFn() : 3 === d ? Q.mainCalcFn() : 4 === d ? ee.mainCalcFn() : 5 === d ? te.mainCalcFn() : 6 === d ? ne.mainCalcFn() : 7 === d ? oe.mainCalcFn() : 8 === d ? re.mainCalcFn() : console.log("co jest kurka wódka?")
    };
    o(document.getElementsByClassName("note-remover")).forEach((function (e) {
        e.addEventListener("focus", g)
    })), a.addEventListener("click", b), l.addEventListener("change", (function () {
        var e = [s, u];
        "2021" === l.value ? e.forEach((function (e) {
            e.style.display = "none"
        })) : "2020" === l.value ? (s.style.display = "none", u.style.display = "block") : "9999" === l.value && e.forEach((function (e) {
            e.style.display = "block"
        }))
    })), window.addEventListener("keypress", (function (e) {
        "Enter" === e.key && b()
    }));
    var S = document.querySelector("div.change-price-panel"),
        w = document.querySelector("button.show-price-change"),
        x = document.querySelector("div.change-price-close");
    w.addEventListener("click", (function () {
        S.style.display = "block"
    })), x.addEventListener("click", (function () {
        S.style.display = "none"
    }));
    var E = ["c11", "c12a", "c12b", "c21", "c22a", "c22b", "b21", "b22", "b11"],
        O = document.getElementById("tariff"),
        I = document.querySelector(".intakec11c21"),
        T = document.querySelector(".intakec12ac12b"),
        F = document.querySelector(".propositionc11c21"),
        P = document.querySelector(".propositionc12ac12b"),
        k = document.querySelector(".havePricesc12ac12b"),
        j = document.querySelector(".have-prices-c11"),
        A = function (e, t) {
            e.forEach((function (e) {
                document.querySelector(".tariff".concat(e, "-wrapper")).style.display = "none"
            })), document.querySelector(".tariff".concat(t, "-wrapper")).style.display = "block", _(t)
        },
        _ = function (e) {
            "1" === e[2] ? (T.style.display = "none", I.style.display = "block", F.style.display = "block", P.style.display = "none", k.style.display = "none", j.style.display = "block") : "2" === e[2] && (T.style.display = "block", I.style.display = "none", F.style.display = "none", P.style.display = "block", k.style.display = "block", j.style.display = "none")
        };
    O.addEventListener("change", (function () {
        "C12a" === O.value ? (A(E, "c12a"), d = 1) : "C12b" === O.value ? (A(E, "c12b"), d = 2) : "C21" === O.value ? (A(E, "c21"), d = 3) : "C11" === O.value ? (A(E, "c11"), d = 0) : "C22a" === O.value ? (A(E, "c22a"), d = 4) : "C22b" === O.value ? (A(E, "c22b"), d = 5) : "B21" === O.value ? (A(E, "b21"), d = 6) : "B22" === O.value ? (A(E, "b22"), d = 7) : "B11" === O.value && (A(E, "b11"), d = 8), i.scrollIntoView()
    }));
    var M = document.getElementById("clearInputsBtn"),
        C = o(document.getElementsByClassName("set-to-zero"));
    M.addEventListener("click", (function () {
        C.forEach((function (e) {
            e.value = 0
        }))
    }));
    var L, B, N, D, z, R, G, H, q, V, W, $, K, U, J = function e(t, n, o) {
            var c = this;
            ! function (e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }(this, e), r(this, "getPricesFromDb", (function () {
                return fetch("".concat(window.location.href, "/get-prices"), {
                    method: "GET"
                }).then((function (e) {
                    return e.json()
                })).then((function (e) {
                    c.pricesFromDb = e[c.indexOfData]
                })).catch((function (e) {
                    console.log("Błąd w Fetch" + e)
                })), !0
            })), r(this, "checkEndOfAgreement", (function () {
                switch (parseInt(l.value)) {
                    case 2021:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 0;
                        break;
                    case 2020:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 1;
                        break;
                    case 9999:
                        c.countsPrice2020 = .66, c.countsPrice2021 = 1;
                        break;
                    default:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 0
                }
            })), r(this, "getWear", (function () {
                1 === c.numberOfSpheres ? c.wearOneSphere = h(document.getElementById("wear").value) : 2 === c.numberOfSpheres && (c.weareTwoSpeheresFirst = h(document.getElementById("wearFirst").value), c.weareTwoSpeheresSecond = h(document.getElementById("wearSecond").value), c.wearTwoSpheresSum = (c.weareTwoSpeheresFirst + c.weareTwoSpeheresSecond).toFixed(2), document.getElementById("wearSum").value = c.wearTwoSpheresSum)
            })), r(this, "getProposition", (function () {
                1 === c.numberOfSpheres ? c.proposeOneSphere = h(document.getElementById("proposePrice").value) : 2 === c.numberOfSpheres && (c.proposeTwoSpheresAvr = h(document.getElementById("proposePriceAvr").value), c.proposeTwoSpheresFirst = h(document.getElementById("proposePriceFirst").value), c.proposeTwoSpheresSecond = h(document.getElementById("proposePriceSecond").value))
            })), r(this, "calcOneSphere", (function () {
                c.margeMass = Math.floor((c.proposeOneSphere - h(c.pricesFromDb.tariff.price2022)) * c.wearOneSphere + (c.proposeOneSphere - h(c.pricesFromDb.tariff.price2021)) * c.wearOneSphere * c.countsPrice2021 + (c.proposeOneSphere - h(c.pricesFromDb.tariff.price2020)) * c.wearOneSphere * c.countsPrice2020)
            })), r(this, "calcTwoSpheres", (function () {
                if (1 === v) {
                    var e = (c.proposeTwoSpheresAvr - h(c.pricesFromDb.tariff.price2022.avr)) * c.wearTwoSpheresSum,
                        t = (c.proposeTwoSpheresAvr - h(c.pricesFromDb.tariff.price2021.avr)) * c.wearTwoSpheresSum * c.countsPrice2021,
                        n = (c.proposeTwoSpheresAvr - h(c.pricesFromDb.tariff.price2020.avr)) * c.wearTwoSpheresSum * c.countsPrice2020;
                    c.margeMass = (e + t + n).toFixed(2)
                } else {
                    var r = (c.proposeTwoSpheresFirst - h(c.pricesFromDb.tariff.price2022.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - h(c.pricesFromDb.tariff.price2022.second)) * c.weareTwoSpeheresSecond,
                        o = ((c.proposeTwoSpheresFirst - h(c.pricesFromDb.tariff.price2021.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - h(c.pricesFromDb.tariff.price2021.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2021,
                        a = ((c.proposeTwoSpheresFirst - h(c.pricesFromDb.tariff.price2020.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - h(c.pricesFromDb.tariff.price2020.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2020;
                    c.margeMass = (r + o + a).toFixed(2)
                }
            })), r(this, "createNote", (function () {
                if (1 === c.numberOfSpheres) {
                    var e = document.getElementById("priceNow").value;
                    i.style.padding = "10px", i.innerHTML = 'Grupa taryfowa: <span class ="value-of-calc-data">'.concat(c.name, '</span>, Umowa kończy się: <span class ="value-of-calc-data">').concat(l.value, '</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">').concat(e, '</span>, Cena w cenniku dla taryfy <span class ="value-of-calc-data">').concat(c.name, '</span>: <span class ="value-of-calc-data">').concat(c.pricesFromDb.tariff.price2022, '</span>, Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearOneSphere, '</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">').concat(c.proposeOneSphere, '</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span><br>Osoba kontaktowa:"), i.scrollIntoView()
                } else if (2 === c.numberOfSpheres) {
                    var t = document.getElementById("havePriceAvr").value,
                        n = document.getElementById("havePriceFirst").value,
                        r = document.getElementById("havePriceSecond").value,
                        o = '<span class="value-of-calc-data">',
                        a = "</span>";
                    i.style.padding = "10px", i.innerHTML = "Grupa taryfowa: ".concat(o).concat(c.name).concat(a, ", <br>Umowa kończy się: ").concat(o).concat(l.value).concat(a, ", <br>Klient posiada aktualnie ceny: Średnia: ").concat(o).concat(t).concat(a, " I strefa: ").concat(o).concat(n).concat(a, " II strefa: ").concat(o).concat(r).concat(a, ", <br>Ceny w cenniku na 2022 dla taryfy ").concat(o).concat(c.name).concat(a, ": Średnia: ").concat(o).concat(c.pricesFromDb.tariff.price2022.avr).concat(a, " I strefa ").concat(o).concat(c.pricesFromDb.tariff.price2022.first).concat(a, " II strefa: ").concat(o).concat(c.pricesFromDb.tariff.price2022.second).concat(a, ', <br>Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearTwoSpheresSum, "</span> MWh. <br>Propozycja cenowa: Średnia: ").concat(o).concat(c.proposeTwoSpheresAvr).concat(a, " I strefa: ").concat(o).concat(c.proposeTwoSpheresFirst).concat(a, " II strefa: ").concat(o).concat(c.proposeTwoSpheresSecond).concat(a, ', <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span><br>Osoba kontaktowa:"), i.scrollIntoView()
                }
            })), r(this, "checkWhatIsBetter", (function () {
                if (2 === c.numberOfSpheres) {
                    c.getWear(), c.getProposition();
                    var e = (Number(c.wearTwoSpheresSum) * c.proposeTwoSpheresAvr).toFixed(2),
                        t = (c.weareTwoSpeheresFirst * c.proposeTwoSpheresFirst + c.weareTwoSpeheresSecond * c.proposeTwoSpheresSecond).toFixed(2);
                    console.log("Na płasko klient zapłaci za rok: ".concat(e)), console.log("W podziale na strefy klient zapłaci za rok: ".concat(t))
                }
            })), r(this, "mainCalcFn", (function () {
                c.checkEndOfAgreement(), c.getWear(), c.getProposition(), 1 === c.numberOfSpheres ? c.calcOneSphere() : 2 === c.numberOfSpheres && c.calcTwoSpheres(), c.createNote()
            })), this.numberOfSpheres = t, this.indexOfData = n, this.pricesFromDbDone = this.getPricesFromDb(), this.name = o
        },
        Y = new J(1, 0, "C11"),
        X = new J(2, 1, "C12a"),
        Z = new J(2, 2, "C12b"),
        Q = new J(1, 3, "C21"),
        ee = new J(2, 4, "C22a"),
        te = new J(2, 5, "C22b"),
        ne = new J(1, 6, "B21"),
        re = new J(1, 8, "B11"),
        oe = new J(2, 7, "B22");

    function ce(e) {
        return parseFloat(e.replace(/\,/g, "."))
    }
    document.getElementById("activeCalcSavings").addEventListener("click", (function () {
        L = ce(document.getElementById("wear").value), B = ce(document.getElementById("wearFirst").value), N = ce(document.getElementById("wearSecond").value), D = ce(document.getElementById("priceNow").value), z = ce(document.getElementById("havePriceAvr").value), R = ce(document.getElementById("havePriceFirst").value), G = ce(document.getElementById("havePriceSecond").value), H = ce(document.getElementById("proposePrice").value), q = ce(document.getElementById("proposePriceFirst").value), V = ce(document.getElementById("proposePriceSecond").value), W = ce(document.getElementById("proposePriceAvr").value), $ = ce(document.getElementById("tradeFee").value), K = document.getElementById("tariff").value, U = document.getElementById("summaryCalc");
        var e = (12 * Number($)).toFixed(2);
        if ("1" === K[2]) {
            var t = ((D - H) * L).toFixed(2),
                n = U.innerHTML;
            U.innerHTML = n + '<br> <p class="savings-par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(e, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(t, "</span></p>")
        } else if (0 === v) {
            var r = ((R - q) * B + (G - V) * N).toFixed(2),
                o = U.innerHTML;
            U.innerHTML = o + '<br> <p class="savings-par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(e, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(r, "</span></p>")
        } else {
            var c = ((z - W) * (B + N)).toFixed(2),
                a = U.innerHTML;
            U.innerHTML = a + '<br> <p class="savings-par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(e, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(c, "</span></p>")
        }
    }))
}, function (e, t, n) {
    "use strict";
    n(46);
    var r = n(4),
        o = n(24),
        c = n(1),
        a = /./.toString,
        i = function (e) {
            n(5)(RegExp.prototype, "toString", e, !0)
        };
    n(6)((function () {
        return "/a/b" != a.call({
            source: "a",
            flags: "b"
        })
    })) ? i((function () {
        var e = r(this);
        return "/".concat(e.source, "/", "flags" in e ? e.flags : !c && e instanceof RegExp ? o.call(e) : void 0)
    })) : "toString" != a.name && i((function () {
        return a.call(this)
    }))
}, function (e, t, n) {
    n(1) && "g" != /./g.flags && n(2).f(RegExp.prototype, "flags", {
        configurable: !0,
        get: n(24)
    })
}, function (e, t, n) {
    e.exports = n(18)("native-function-to-string", Function.toString)
}, function (e, t, n) {
    var r = Date.prototype,
        o = r.toString,
        c = r.getTime;
    new Date(NaN) + "" != "Invalid Date" && n(5)(r, "toString", (function () {
        var e = c.call(this);
        return e == e ? o.call(this) : "Invalid Date"
    }))
}, function (e, t, n) {
    "use strict";
    var r = n(25),
        o = {};
    o[n(0)("toStringTag")] = "z", o + "" != "[object z]" && n(5)(Object.prototype, "toString", (function () {
        return "[object " + r(this) + "]"
    }), !0)
}, function (e, t, n) {
    "use strict";
    var r = n(37)(!0);
    n(38)(String, "String", (function (e) {
        this._t = String(e), this._i = 0
    }), (function () {
        var e, t = this._t,
            n = this._i;
        return n >= t.length ? {
            value: void 0,
            done: !0
        } : (e = r(t, n), this._i += e.length, {
            value: e,
            done: !1
        })
    }))
}, function (e, t) {
    e.exports = function (e) {
        if ("function" != typeof e) throw TypeError(e + " is not a function!");
        return e
    }
}, function (e, t, n) {
    "use strict";
    var r = n(27),
        o = n(11),
        c = n(31),
        a = {};
    n(7)(a, n(0)("iterator"), (function () {
        return this
    })), e.exports = function (e, t, n) {
        e.prototype = r(a, {
            next: o(1, n)
        }), c(e, t + " Iterator")
    }
}, function (e, t, n) {
    var r = n(2),
        o = n(4),
        c = n(22);
    e.exports = n(1) ? Object.defineProperties : function (e, t) {
        o(e);
        for (var n, a = c(t), i = a.length, u = 0; i > u;) r.f(e, n = a[u++], t[n]);
        return e
    }
}, function (e, t, n) {
    var r = n(20);
    e.exports = Object("z").propertyIsEnumerable(0) ? Object : function (e) {
        return "String" == r(e) ? e.split("") : Object(e)
    }
}, function (e, t, n) {
    var r = n(10),
        o = n(28),
        c = n(56);
    e.exports = function (e) {
        return function (t, n, a) {
            var i, u = r(t),
                s = o(u.length),
                f = c(a, s);
            if (e && n != n) {
                for (; s > f;)
                    if ((i = u[f++]) != i) return !0
            } else
                for (; s > f; f++)
                    if ((e || f in u) && u[f] === n) return e || f || 0;
            return !e && -1
        }
    }
}, function (e, t, n) {
    var r = n(21),
        o = Math.max,
        c = Math.min;
    e.exports = function (e, t) {
        return (e = r(e)) < 0 ? o(e + t, 0) : c(e, t)
    }
}, function (e, t, n) {
    var r = n(3).document;
    e.exports = r && r.documentElement
}, function (e, t, n) {
    var r = n(8),
        o = n(23),
        c = n(29)("IE_PROTO"),
        a = Object.prototype;
    e.exports = Object.getPrototypeOf || function (e) {
        return e = o(e), r(e, c) ? e[c] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? a : null
    }
}, function (e, t, n) {
    "use strict";
    var r = n(26),
        o = n(15),
        c = n(23),
        a = n(60),
        i = n(61),
        u = n(28),
        s = n(62),
        f = n(63);
    o(o.S + o.F * !n(64)((function (e) {
        Array.from(e)
    })), "Array", {
        from: function (e) {
            var t, n, o, l, p = c(e),
                d = "function" == typeof this ? this : Array,
                v = arguments.length,
                y = v > 1 ? arguments[1] : void 0,
                h = void 0 !== y,
                m = 0,
                g = f(p);
            if (h && (y = r(y, v > 2 ? arguments[2] : void 0, 2)), null == g || d == Array && i(g))
                for (n = new d(t = u(p.length)); t > m; m++) s(n, m, h ? y(p[m], m) : p[m]);
            else
                for (l = g.call(p), n = new d; !(o = l.next()).done; m++) s(n, m, h ? a(l, y, [o.value, m], !0) : o.value);
            return n.length = m, n
        }
    })
}, function (e, t, n) {
    var r = n(4);
    e.exports = function (e, t, n, o) {
        try {
            return o ? t(r(n)[0], n[1]) : t(n)
        } catch (t) {
            var c = e.return;
            throw void 0 !== c && r(c.call(e)), t
        }
    }
}, function (e, t, n) {
    var r = n(16),
        o = n(0)("iterator"),
        c = Array.prototype;
    e.exports = function (e) {
        return void 0 !== e && (r.Array === e || c[o] === e)
    }
}, function (e, t, n) {
    "use strict";
    var r = n(2),
        o = n(11);
    e.exports = function (e, t, n) {
        t in e ? r.f(e, t, o(0, n)) : e[t] = n
    }
}, function (e, t, n) {
    var r = n(25),
        o = n(0)("iterator"),
        c = n(16);
    e.exports = n(13).getIteratorMethod = function (e) {
        if (null != e) return e[o] || e["@@iterator"] || c[r(e)]
    }
}, function (e, t, n) {
    var r = n(0)("iterator"),
        o = !1;
    try {
        var c = [7][r]();
        c.return = function () {
            o = !0
        }, Array.from(c, (function () {
            throw 2
        }))
    } catch (e) {}
    e.exports = function (e, t) {
        if (!t && !o) return !1;
        var n = !1;
        try {
            var c = [7],
                a = c[r]();
            a.next = function () {
                return {
                    done: n = !0
                }
            }, c[r] = function () {
                return a
            }, e(c)
        } catch (e) {}
        return n
    }
}, function (e, t, n) {
    for (var r = n(66), o = n(22), c = n(5), a = n(3), i = n(7), u = n(16), s = n(0), f = s("iterator"), l = s("toStringTag"), p = u.Array, d = {
            CSSRuleList: !0,
            CSSStyleDeclaration: !1,
            CSSValueList: !1,
            ClientRectList: !1,
            DOMRectList: !1,
            DOMStringList: !1,
            DOMTokenList: !0,
            DataTransferItemList: !1,
            FileList: !1,
            HTMLAllCollection: !1,
            HTMLCollection: !1,
            HTMLFormElement: !1,
            HTMLSelectElement: !1,
            MediaList: !0,
            MimeTypeArray: !1,
            NamedNodeMap: !1,
            NodeList: !0,
            PaintRequestList: !1,
            Plugin: !1,
            PluginArray: !1,
            SVGLengthList: !1,
            SVGNumberList: !1,
            SVGPathSegList: !1,
            SVGPointList: !1,
            SVGStringList: !1,
            SVGTransformList: !1,
            SourceBufferList: !1,
            StyleSheetList: !0,
            TextTrackCueList: !1,
            TextTrackList: !1,
            TouchList: !1
        }, v = o(d), y = 0; y < v.length; y++) {
        var h, m = v[y],
            g = d[m],
            b = a[m],
            S = b && b.prototype;
        if (S && (S[f] || i(S, f, p), S[l] || i(S, l, m), u[m] = p, g))
            for (h in r) S[h] || c(S, h, r[h], !0)
    }
}, function (e, t, n) {
    "use strict";
    var r = n(67),
        o = n(68),
        c = n(16),
        a = n(10);
    e.exports = n(38)(Array, "Array", (function (e, t) {
        this._t = a(e), this._i = 0, this._k = t
    }), (function () {
        var e = this._t,
            t = this._k,
            n = this._i++;
        return !e || n >= e.length ? (this._t = void 0, o(1)) : o(0, "keys" == t ? n : "values" == t ? e[n] : [n, e[n]])
    }), "values"), c.Arguments = c.Array, r("keys"), r("values"), r("entries")
}, function (e, t, n) {
    var r = n(0)("unscopables"),
        o = Array.prototype;
    null == o[r] && n(7)(o, r, {}), e.exports = function (e) {
        o[r][e] = !0
    }
}, function (e, t) {
    e.exports = function (e, t) {
        return {
            value: t,
            done: !!e
        }
    }
}, function (e, t, n) {
    n(40)("asyncIterator")
}, function (e, t, n) {
    "use strict";
    var r = n(3),
        o = n(8),
        c = n(1),
        a = n(15),
        i = n(5),
        u = n(71).KEY,
        s = n(6),
        f = n(18),
        l = n(31),
        p = n(12),
        d = n(0),
        v = n(41),
        y = n(40),
        h = n(72),
        m = n(73),
        g = n(4),
        b = n(9),
        S = n(23),
        w = n(10),
        x = n(17),
        E = n(11),
        O = n(27),
        I = n(74),
        T = n(34),
        F = n(42),
        P = n(2),
        k = n(22),
        j = T.f,
        A = P.f,
        _ = I.f,
        M = r.Symbol,
        C = r.JSON,
        L = C && C.stringify,
        B = d("_hidden"),
        N = d("toPrimitive"),
        D = {}.propertyIsEnumerable,
        z = f("symbol-registry"),
        R = f("symbols"),
        G = f("op-symbols"),
        H = Object.prototype,
        q = "function" == typeof M && !!F.f,
        V = r.QObject,
        W = !V || !V.prototype || !V.prototype.findChild,
        $ = c && s((function () {
            return 7 != O(A({}, "a", {
                get: function () {
                    return A(this, "a", {
                        value: 7
                    }).a
                }
            })).a
        })) ? function (e, t, n) {
            var r = j(H, t);
            r && delete H[t], A(e, t, n), r && e !== H && A(H, t, r)
        } : A,
        K = function (e) {
            var t = R[e] = O(M.prototype);
            return t._k = e, t
        },
        U = q && "symbol" == typeof M.iterator ? function (e) {
            return "symbol" == typeof e
        } : function (e) {
            return e instanceof M
        },
        J = function (e, t, n) {
            return e === H && J(G, t, n), g(e), t = x(t, !0), g(n), o(R, t) ? (n.enumerable ? (o(e, B) && e[B][t] && (e[B][t] = !1), n = O(n, {
                enumerable: E(0, !1)
            })) : (o(e, B) || A(e, B, E(1, {})), e[B][t] = !0), $(e, t, n)) : A(e, t, n)
        },
        Y = function (e, t) {
            g(e);
            for (var n, r = h(t = w(t)), o = 0, c = r.length; c > o;) J(e, n = r[o++], t[n]);
            return e
        },
        X = function (e) {
            var t = D.call(this, e = x(e, !0));
            return !(this === H && o(R, e) && !o(G, e)) && (!(t || !o(this, e) || !o(R, e) || o(this, B) && this[B][e]) || t)
        },
        Z = function (e, t) {
            if (e = w(e), t = x(t, !0), e !== H || !o(R, t) || o(G, t)) {
                var n = j(e, t);
                return !n || !o(R, t) || o(e, B) && e[B][t] || (n.enumerable = !0), n
            }
        },
        Q = function (e) {
            for (var t, n = _(w(e)), r = [], c = 0; n.length > c;) o(R, t = n[c++]) || t == B || t == u || r.push(t);
            return r
        },
        ee = function (e) {
            for (var t, n = e === H, r = _(n ? G : w(e)), c = [], a = 0; r.length > a;) !o(R, t = r[a++]) || n && !o(H, t) || c.push(R[t]);
            return c
        };
    q || (i((M = function () {
        if (this instanceof M) throw TypeError("Symbol is not a constructor!");
        var e = p(arguments.length > 0 ? arguments[0] : void 0),
            t = function (n) {
                this === H && t.call(G, n), o(this, B) && o(this[B], e) && (this[B][e] = !1), $(this, e, E(1, n))
            };
        return c && W && $(H, e, {
            configurable: !0,
            set: t
        }), K(e)
    }).prototype, "toString", (function () {
        return this._k
    })), T.f = Z, P.f = J, n(33).f = I.f = Q, n(32).f = X, F.f = ee, c && !n(19) && i(H, "propertyIsEnumerable", X, !0), v.f = function (e) {
        return K(d(e))
    }), a(a.G + a.W + a.F * !q, {
        Symbol: M
    });
    for (var te = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), ne = 0; te.length > ne;) d(te[ne++]);
    for (var re = k(d.store), oe = 0; re.length > oe;) y(re[oe++]);
    a(a.S + a.F * !q, "Symbol", {
        for: function (e) {
            return o(z, e += "") ? z[e] : z[e] = M(e)
        },
        keyFor: function (e) {
            if (!U(e)) throw TypeError(e + " is not a symbol!");
            for (var t in z)
                if (z[t] === e) return t
        },
        useSetter: function () {
            W = !0
        },
        useSimple: function () {
            W = !1
        }
    }), a(a.S + a.F * !q, "Object", {
        create: function (e, t) {
            return void 0 === t ? O(e) : Y(O(e), t)
        },
        defineProperty: J,
        defineProperties: Y,
        getOwnPropertyDescriptor: Z,
        getOwnPropertyNames: Q,
        getOwnPropertySymbols: ee
    });
    var ce = s((function () {
        F.f(1)
    }));
    a(a.S + a.F * ce, "Object", {
        getOwnPropertySymbols: function (e) {
            return F.f(S(e))
        }
    }), C && a(a.S + a.F * (!q || s((function () {
        var e = M();
        return "[null]" != L([e]) || "{}" != L({
            a: e
        }) || "{}" != L(Object(e))
    }))), "JSON", {
        stringify: function (e) {
            for (var t, n, r = [e], o = 1; arguments.length > o;) r.push(arguments[o++]);
            if (n = t = r[1], (b(t) || void 0 !== e) && !U(e)) return m(t) || (t = function (e, t) {
                if ("function" == typeof n && (t = n.call(this, e, t)), !U(t)) return t
            }), r[1] = t, L.apply(C, r)
        }
    }), M.prototype[N] || n(7)(M.prototype, N, M.prototype.valueOf), l(M, "Symbol"), l(Math, "Math", !0), l(r.JSON, "JSON", !0)
}, function (e, t, n) {
    var r = n(12)("meta"),
        o = n(9),
        c = n(8),
        a = n(2).f,
        i = 0,
        u = Object.isExtensible || function () {
            return !0
        },
        s = !n(6)((function () {
            return u(Object.preventExtensions({}))
        })),
        f = function (e) {
            a(e, r, {
                value: {
                    i: "O" + ++i,
                    w: {}
                }
            })
        },
        l = e.exports = {
            KEY: r,
            NEED: !1,
            fastKey: function (e, t) {
                if (!o(e)) return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
                if (!c(e, r)) {
                    if (!u(e)) return "F";
                    if (!t) return "E";
                    f(e)
                }
                return e[r].i
            },
            getWeak: function (e, t) {
                if (!c(e, r)) {
                    if (!u(e)) return !0;
                    if (!t) return !1;
                    f(e)
                }
                return e[r].w
            },
            onFreeze: function (e) {
                return s && l.NEED && u(e) && !c(e, r) && f(e), e
            }
        }
}, function (e, t, n) {
    var r = n(22),
        o = n(42),
        c = n(32);
    e.exports = function (e) {
        var t = r(e),
            n = o.f;
        if (n)
            for (var a, i = n(e), u = c.f, s = 0; i.length > s;) u.call(e, a = i[s++]) && t.push(a);
        return t
    }
}, function (e, t, n) {
    var r = n(20);
    e.exports = Array.isArray || function (e) {
        return "Array" == r(e)
    }
}, function (e, t, n) {
    var r = n(10),
        o = n(33).f,
        c = {}.toString,
        a = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    e.exports.f = function (e) {
        return a && "[object Window]" == c.call(e) ? function (e) {
            try {
                return o(e)
            } catch (e) {
                return a.slice()
            }
        }(e) : o(r(e))
    }
}, function (e, t, n) {
    "use strict";
    var r = n(3),
        o = n(8),
        c = n(20),
        a = n(76),
        i = n(17),
        u = n(6),
        s = n(33).f,
        f = n(34).f,
        l = n(2).f,
        p = n(78).trim,
        d = r.Number,
        v = d,
        y = d.prototype,
        h = "Number" == c(n(27)(y)),
        m = "trim" in String.prototype,
        g = function (e) {
            var t = i(e, !1);
            if ("string" == typeof t && t.length > 2) {
                var n, r, o, c = (t = m ? t.trim() : p(t, 3)).charCodeAt(0);
                if (43 === c || 45 === c) {
                    if (88 === (n = t.charCodeAt(2)) || 120 === n) return NaN
                } else if (48 === c) {
                    switch (t.charCodeAt(1)) {
                        case 66:
                        case 98:
                            r = 2, o = 49;
                            break;
                        case 79:
                        case 111:
                            r = 8, o = 55;
                            break;
                        default:
                            return +t
                    }
                    for (var a, u = t.slice(2), s = 0, f = u.length; s < f; s++)
                        if ((a = u.charCodeAt(s)) < 48 || a > o) return NaN;
                    return parseInt(u, r)
                }
            }
            return +t
        };
    if (!d(" 0o1") || !d("0b1") || d("+0x1")) {
        d = function (e) {
            var t = arguments.length < 1 ? 0 : e,
                n = this;
            return n instanceof d && (h ? u((function () {
                y.valueOf.call(n)
            })) : "Number" != c(n)) ? a(new v(g(t)), n, d) : g(t)
        };
        for (var b, S = n(1) ? s(v) : "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","), w = 0; S.length > w; w++) o(v, b = S[w]) && !o(d, b) && l(d, b, f(v, b));
        d.prototype = y, y.constructor = d, n(5)(r, "Number", d)
    }
}, function (e, t, n) {
    var r = n(9),
        o = n(77).set;
    e.exports = function (e, t, n) {
        var c, a = t.constructor;
        return a !== n && "function" == typeof a && (c = a.prototype) !== n.prototype && r(c) && o && o(e, c), e
    }
}, function (e, t, n) {
    var r = n(9),
        o = n(4),
        c = function (e, t) {
            if (o(e), !r(t) && null !== t) throw TypeError(t + ": can't set as prototype!")
        };
    e.exports = {
        set: Object.setPrototypeOf || ("__proto__" in {} ? function (e, t, r) {
            try {
                (r = n(26)(Function.call, n(34).f(Object.prototype, "__proto__").set, 2))(e, []), t = !(e instanceof Array)
            } catch (e) {
                t = !0
            }
            return function (e, n) {
                return c(e, n), t ? e.__proto__ = n : r(e, n), e
            }
        }({}, !1) : void 0),
        check: c
    }
}, function (e, t, n) {
    var r = n(15),
        o = n(14),
        c = n(6),
        a = n(79),
        i = "[" + a + "]",
        u = RegExp("^" + i + i + "*"),
        s = RegExp(i + i + "*$"),
        f = function (e, t, n) {
            var o = {},
                i = c((function () {
                    return !!a[e]() || "​" != "​" [e]()
                })),
                u = o[e] = i ? t(l) : a[e];
            n && (o[n] = u), r(r.P + r.F * i, "String", o)
        },
        l = f.trim = function (e, t) {
            return e = String(o(e)), 1 & t && (e = e.replace(u, "")), 2 & t && (e = e.replace(s, "")), e
        };
    e.exports = f
}, function (e, t) {
    e.exports = "\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"
}, function (e, t, n) {
    var r = n(2).f,
        o = Function.prototype,
        c = /^\s*function ([^ (]*)/;
    "name" in o || n(1) && r(o, "name", {
        configurable: !0,
        get: function () {
            try {
                return ("" + this).match(c)[1]
            } catch (e) {
                return ""
            }
        }
    })
}, function (e, t, n) {
    "use strict";
    var r = n(4),
        o = n(23),
        c = n(28),
        a = n(21),
        i = n(82),
        u = n(83),
        s = Math.max,
        f = Math.min,
        l = Math.floor,
        p = /\$([$&`']|\d\d?|<[^>]*>)/g,
        d = /\$([$&`']|\d\d?)/g;
    n(84)("replace", 2, (function (e, t, n, v) {
        return [function (r, o) {
            var c = e(this),
                a = null == r ? void 0 : r[t];
            return void 0 !== a ? a.call(r, c, o) : n.call(String(c), r, o)
        }, function (e, t) {
            var o = v(n, e, this, t);
            if (o.done) return o.value;
            var l = r(e),
                p = String(this),
                d = "function" == typeof t;
            d || (t = String(t));
            var h = l.global;
            if (h) {
                var m = l.unicode;
                l.lastIndex = 0
            }
            for (var g = [];;) {
                var b = u(l, p);
                if (null === b) break;
                if (g.push(b), !h) break;
                "" === String(b[0]) && (l.lastIndex = i(p, c(l.lastIndex), m))
            }
            for (var S, w = "", x = 0, E = 0; E < g.length; E++) {
                b = g[E];
                for (var O = String(b[0]), I = s(f(a(b.index), p.length), 0), T = [], F = 1; F < b.length; F++) T.push(void 0 === (S = b[F]) ? S : String(S));
                var P = b.groups;
                if (d) {
                    var k = [O].concat(T, I, p);
                    void 0 !== P && k.push(P);
                    var j = String(t.apply(void 0, k))
                } else j = y(O, p, I, T, P, t);
                I >= x && (w += p.slice(x, I) + j, x = I + O.length)
            }
            return w + p.slice(x)
        }];

        function y(e, t, r, c, a, i) {
            var u = r + e.length,
                s = c.length,
                f = d;
            return void 0 !== a && (a = o(a), f = p), n.call(i, f, (function (n, o) {
                var i;
                switch (o.charAt(0)) {
                    case "$":
                        return "$";
                    case "&":
                        return e;
                    case "`":
                        return t.slice(0, r);
                    case "'":
                        return t.slice(u);
                    case "<":
                        i = a[o.slice(1, -1)];
                        break;
                    default:
                        var f = +o;
                        if (0 === f) return n;
                        if (f > s) {
                            var p = l(f / 10);
                            return 0 === p ? n : p <= s ? void 0 === c[p - 1] ? o.charAt(1) : c[p - 1] + o.charAt(1) : n
                        }
                        i = c[f - 1]
                }
                return void 0 === i ? "" : i
            }))
        }
    }))
}, function (e, t, n) {
    "use strict";
    var r = n(37)(!0);
    e.exports = function (e, t, n) {
        return t + (n ? r(e, t).length : 1)
    }
}, function (e, t, n) {
    "use strict";
    var r = n(25),
        o = RegExp.prototype.exec;
    e.exports = function (e, t) {
        var n = e.exec;
        if ("function" == typeof n) {
            var c = n.call(e, t);
            if ("object" != typeof c) throw new TypeError("RegExp exec method returned something other than an Object or null");
            return c
        }
        if ("RegExp" !== r(e)) throw new TypeError("RegExp#exec called on incompatible receiver");
        return o.call(e, t)
    }
}, function (e, t, n) {
    "use strict";
    n(85);
    var r = n(5),
        o = n(7),
        c = n(6),
        a = n(14),
        i = n(0),
        u = n(43),
        s = i("species"),
        f = !c((function () {
            var e = /./;
            return e.exec = function () {
                var e = [];
                return e.groups = {
                    a: "7"
                }, e
            }, "7" !== "".replace(e, "$<a>")
        })),
        l = function () {
            var e = /(?:)/,
                t = e.exec;
            e.exec = function () {
                return t.apply(this, arguments)
            };
            var n = "ab".split(e);
            return 2 === n.length && "a" === n[0] && "b" === n[1]
        }();
    e.exports = function (e, t, n) {
        var p = i(e),
            d = !c((function () {
                var t = {};
                return t[p] = function () {
                    return 7
                }, 7 != "" [e](t)
            })),
            v = d ? !c((function () {
                var t = !1,
                    n = /a/;
                return n.exec = function () {
                    return t = !0, null
                }, "split" === e && (n.constructor = {}, n.constructor[s] = function () {
                    return n
                }), n[p](""), !t
            })) : void 0;
        if (!d || !v || "replace" === e && !f || "split" === e && !l) {
            var y = /./ [p],
                h = n(a, p, "" [e], (function (e, t, n, r, o) {
                    return t.exec === u ? d && !o ? {
                        done: !0,
                        value: y.call(t, n, r)
                    } : {
                        done: !0,
                        value: e.call(n, t, r)
                    } : {
                        done: !1
                    }
                })),
                m = h[0],
                g = h[1];
            r(String.prototype, e, m), o(RegExp.prototype, p, 2 == t ? function (e, t) {
                return g.call(e, this, t)
            } : function (e) {
                return g.call(e, this)
            })
        }
    }
}, function (e, t, n) {
    "use strict";
    var r = n(43);
    n(15)({
        target: "RegExp",
        proto: !0,
        forced: r !== /./.exec
    }, {
        exec: r
    })
}]);