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
        i = "function" == typeof c;
    (e.exports = function (e) {
        return r[e] || (r[e] = i && c[e] || (i ? c : o)("Symbol." + e))
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
        i = Object.defineProperty;
    t.f = n(1) ? Object.defineProperty : function (e, t, n) {
        if (r(e), t = c(t, !0), r(n), o) try {
            return i(e, t, n)
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
        i = n(12)("src"),
        a = n(47),
        u = ("" + a).split("toString");
    n(13).inspectSource = function (e) {
        return a.call(e)
    }, (e.exports = function (e, t, n, a) {
        var s = "function" == typeof n;
        s && (c(n, "name") || o(n, "name", t)), e[t] !== n && (s && (c(n, i) || o(n, i, e[t] ? "" + e[t] : u.join(String(t)))), e === r ? e[t] = n : a ? e[t] ? e[t] = n : o(e, t, n) : (delete e[t], o(e, t, n)))
    })(Function.prototype, "toString", (function () {
        return "function" == typeof this && this[i] || a.call(this)
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
        i = n(5),
        a = n(26),
        u = function (e, t, n) {
            var s, f, l, p, y = e & u.F,
                v = e & u.G,
                d = e & u.S,
                h = e & u.P,
                m = e & u.B,
                g = v ? r : d ? r[t] || (r[t] = {}) : (r[t] || {}).prototype,
                b = v ? o : o[t] || (o[t] = {}),
                S = b.prototype || (b.prototype = {});
            for (s in v && (n = t), n) l = ((f = !y && g && void 0 !== g[s]) ? g : n)[s], p = m && f ? a(l, r) : h && "function" == typeof l ? a(Function.call, l) : l, g && i(g, s, l, e & u.U), b[s] != l && c(b, s, p), h && S[s] != l && (S[s] = l)
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
        var t, n, i;
        return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (n = function (e, t) {
            try {
                return e[t]
            } catch (e) {}
        }(t = Object(e), o)) ? n : c ? r(t) : "Object" == (i = r(t)) && "function" == typeof t.callee ? "Arguments" : i
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
        i = n(29)("IE_PROTO"),
        a = function () {},
        u = function () {
            var e, t = n(36)("iframe"),
                r = c.length;
            for (t.style.display = "none", n(57).appendChild(t), t.src = "javascript:", (e = t.contentWindow.document).open(), e.write("<script>document.F=Object<\/script>"), e.close(), u = e.F; r--;) delete u.prototype[c[r]];
            return u()
        };
    e.exports = Object.create || function (e, t) {
        var n;
        return null !== e ? (a.prototype = r(e), n = new a, a.prototype = null, n[i] = e) : n = u(), void 0 === t ? n : o(n, t)
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
        i = n(17),
        a = n(8),
        u = n(35),
        s = Object.getOwnPropertyDescriptor;
    t.f = n(1) ? s : function (e, t) {
        if (e = c(e), t = i(t, !0), u) try {
            return s(e, t)
        } catch (e) {}
        if (a(e, t)) return o(!r.f.call(e, t), e[t])
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
            var c, i, a = String(o(t)),
                u = r(n),
                s = a.length;
            return u < 0 || u >= s ? e ? "" : void 0 : (c = a.charCodeAt(u)) < 55296 || c > 56319 || u + 1 === s || (i = a.charCodeAt(u + 1)) < 56320 || i > 57343 ? e ? a.charAt(u) : c : e ? a.slice(u, u + 2) : i - 56320 + (c - 55296 << 10) + 65536
        }
    }
}, function (e, t, n) {
    "use strict";
    var r = n(19),
        o = n(15),
        c = n(5),
        i = n(7),
        a = n(16),
        u = n(52),
        s = n(31),
        f = n(58),
        l = n(0)("iterator"),
        p = !([].keys && "next" in [].keys()),
        y = function () {
            return this
        };
    e.exports = function (e, t, n, v, d, h, m) {
        u(n, t, v);
        var g, b, S, w = function (e) {
                if (!p && e in T) return T[e];
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
            O = "values" == d,
            E = !1,
            T = e.prototype,
            F = T[l] || T["@@iterator"] || d && T[d],
            I = F || w(d),
            P = d ? O ? w("entries") : I : void 0,
            k = "Array" == t && T.entries || F;
        if (k && (S = f(k.call(new e))) !== Object.prototype && S.next && (s(S, x, !0), r || "function" == typeof S[l] || i(S, l, y)), O && F && "values" !== F.name && (E = !0, I = function () {
                return F.call(this)
            }), r && !m || !p && !E && T[l] || i(T, l, I), a[t] = I, a[x] = y, d)
            if (g = {
                    values: O ? I : w("values"),
                    keys: h ? I : w("keys"),
                    entries: P
                }, m)
                for (b in g) b in T || c(T, b, g[b]);
            else o(o.P + o.F * (p || E), t, g);
        return g
    }
}, function (e, t, n) {
    var r = n(8),
        o = n(10),
        c = n(55)(!1),
        i = n(29)("IE_PROTO");
    e.exports = function (e, t) {
        var n, a = o(e),
            u = 0,
            s = [];
        for (n in a) n != i && r(a, n) && s.push(n);
        for (; t.length > u;) r(a, n = t[u++]) && (~c(s, n) || s.push(n));
        return s
    }
}, function (e, t, n) {
    var r = n(3),
        o = n(13),
        c = n(19),
        i = n(41),
        a = n(2).f;
    e.exports = function (e) {
        var t = o.Symbol || (o.Symbol = c ? {} : r.Symbol || {});
        "_" == e.charAt(0) || e in t || a(t, e, {
            value: i.f(e)
        })
    }
}, function (e, t, n) {
    t.f = n(0)
}, function (e, t) {
    t.f = Object.getOwnPropertySymbols
}, function (e, t, n) {
    "use strict";
    var r, o, c = n(24),
        i = RegExp.prototype.exec,
        a = String.prototype.replace,
        u = i,
        s = (r = /a/, o = /b*/g, i.call(r, "a"), i.call(o, "a"), 0 !== r.lastIndex || 0 !== o.lastIndex),
        f = void 0 !== /()??/.exec("")[1];
    (s || f) && (u = function (e) {
        var t, n, r, o, u = this;
        return f && (n = new RegExp("^" + u.source + "$(?!\\s)", c.call(u))), s && (t = u.lastIndex), r = i.call(u, e), s && r && (u.lastIndex = u.global ? r.index + r[0].length : t), f && r && r.length > 1 && a.call(r[0], n, (function () {
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
    var i = document.getElementById("btnCalc"),
        a = document.getElementById("summaryCalc"),
        u = (document.getElementById("btnCopyCalc"), document.querySelector(".when-option-2020")),
        s = document.querySelector(".when-option-2019"),
        f = document.getElementById("onePriceForAll"),
        l = (document.getElementById("tariff"), document.getElementById("endOfAgreement")),
        p = document.getElementById("info35zl"),
        y = 0,
        v = 0;
    h("tariff", "C11"), h("endOfAgreement", "2021");
    var d = function (e) {
        return parseFloat(e.replace(/\,/g, "."))
    };

    function h(e, t) {
        document.getElementById(e).value = t
    }
    var m = function () {
        a.style.padding = "0px", a.innerHTML = "", p.style.display = "none", !0
    };
    f.addEventListener("click", (function () {
        v = 0 === v ? 1 : 0
    }));
    var g = function () {
        p.style.display = "block", 0 === y ? N.mainCalcFn() : 1 === y ? L.mainCalcFn() : 2 === y ? D.mainCalcFn() : 3 === y ? B.mainCalcFn() : 4 === y ? R.mainCalcFn() : 5 === y ? z.mainCalcFn() : 6 === y ? G.mainCalcFn() : 7 === y ? V.mainCalcFn() : 8 === y ? q.mainCalcFn() : console.log("co jest kurka wódka?")
    };
    o(document.getElementsByClassName("note-remover")).forEach((function (e) {
        e.addEventListener("focus", m)
    })), i.addEventListener("click", g), l.addEventListener("change", (function () {
        var e = [s, u];
        "2021" === l.value ? e.forEach((function (e) {
            e.style.display = "none"
        })) : "2020" === l.value ? (s.style.display = "none", u.style.display = "block") : "9999" === l.value && e.forEach((function (e) {
            e.style.display = "block"
        }))
    })), window.addEventListener("keypress", (function (e) {
        "Enter" === e.key && g()
    }));
    var b = document.querySelector("div.change-price-panel"),
        S = document.querySelector("button.show-price-change"),
        w = document.querySelector("div.change-price-close");
    S.addEventListener("click", (function () {
        b.style.display = "block"
    })), w.addEventListener("click", (function () {
        b.style.display = "none"
    }));
    var x = ["c11", "c12a", "c12b", "c21", "c22a", "c22b", "b21", "b22", "b11"],
        O = document.getElementById("tariff"),
        E = document.querySelector(".intakec11c21"),
        T = document.querySelector(".intakec12ac12b"),
        F = document.querySelector(".propositionc11c21"),
        I = document.querySelector(".propositionc12ac12b"),
        P = document.querySelector(".havePricesc12ac12b"),
        k = document.querySelector(".have-prices-c11"),
        _ = function (e, t) {
            e.forEach((function (e) {
                document.querySelector(".tariff".concat(e, "-wrapper")).style.display = "none"
            })), document.querySelector(".tariff".concat(t, "-wrapper")).style.display = "block", j(t)
        },
        j = function (e) {
            "1" === e[2] ? (T.style.display = "none", E.style.display = "block", F.style.display = "block", I.style.display = "none", P.style.display = "none", k.style.display = "block") : "2" === e[2] && (T.style.display = "block", E.style.display = "none", F.style.display = "none", I.style.display = "block", P.style.display = "block", k.style.display = "none")
        };
    O.addEventListener("change", (function () {
        "C12a" === O.value ? (_(x, "c12a"), y = 1) : "C12b" === O.value ? (_(x, "c12b"), y = 2) : "C21" === O.value ? (_(x, "c21"), y = 3) : "C11" === O.value ? (_(x, "c11"), y = 0) : "C22a" === O.value ? (_(x, "c22a"), y = 4) : "C22b" === O.value ? (_(x, "c22b"), y = 5) : "B21" === O.value ? (_(x, "b21"), y = 6) : "B22" === O.value ? (_(x, "b22"), y = 7) : "B11" === O.value && (_(x, "b11"), y = 8), a.scrollIntoView()
    }));
    var A = document.getElementById("clearInputsBtn"),
        C = o(document.getElementsByClassName("set-to-zero"));
    A.addEventListener("click", (function () {
        C.forEach((function (e) {
            e.value = 0
        }))
    }));
    var M = function e(t, n, o) {
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
                1 === c.numberOfSpheres ? c.wearOneSphere = d(document.getElementById("wear").value) : 2 === c.numberOfSpheres && (c.weareTwoSpeheresFirst = d(document.getElementById("wearFirst").value), c.weareTwoSpeheresSecond = d(document.getElementById("wearSecond").value), c.wearTwoSpheresSum = (c.weareTwoSpeheresFirst + c.weareTwoSpeheresSecond).toFixed(2), document.getElementById("wearSum").value = c.wearTwoSpheresSum)
            })), r(this, "getProposition", (function () {
                1 === c.numberOfSpheres ? c.proposeOneSphere = d(document.getElementById("proposePrice").value) : 2 === c.numberOfSpheres && (c.proposeTwoSpheresAvr = d(document.getElementById("proposePriceAvr").value), c.proposeTwoSpheresFirst = d(document.getElementById("proposePriceFirst").value), c.proposeTwoSpheresSecond = d(document.getElementById("proposePriceSecond").value))
            })), r(this, "calcOneSphere", (function () {
                c.margeMass = Math.floor((c.proposeOneSphere - d(c.pricesFromDb.tariff.price2022)) * c.wearOneSphere + (c.proposeOneSphere - d(c.pricesFromDb.tariff.price2021)) * c.wearOneSphere * c.countsPrice2021 + (c.proposeOneSphere - d(c.pricesFromDb.tariff.price2020)) * c.wearOneSphere * c.countsPrice2020)
            })), r(this, "calcTwoSpheres", (function () {
                if (1 === v) {
                    var e = (c.proposeTwoSpheresAvr - d(c.pricesFromDb.tariff.price2022.avr)) * c.wearTwoSpheresSum,
                        t = (c.proposeTwoSpheresAvr - d(c.pricesFromDb.tariff.price2021.avr)) * c.wearTwoSpheresSum * c.countsPrice2021,
                        n = (c.proposeTwoSpheresAvr - d(c.pricesFromDb.tariff.price2020.avr)) * c.wearTwoSpheresSum * c.countsPrice2020;
                    c.margeMass = (e + t + n).toFixed(2)
                } else {
                    var r = (c.proposeTwoSpheresFirst - d(c.pricesFromDb.tariff.price2022.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - d(c.pricesFromDb.tariff.price2022.second)) * c.weareTwoSpeheresSecond,
                        o = ((c.proposeTwoSpheresFirst - d(c.pricesFromDb.tariff.price2021.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - d(c.pricesFromDb.tariff.price2021.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2021,
                        i = ((c.proposeTwoSpheresFirst - d(c.pricesFromDb.tariff.price2020.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - d(c.pricesFromDb.tariff.price2020.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2020;
                    c.margeMass = (r + o + i).toFixed(2)
                }
            })), r(this, "createNote", (function () {
                if (1 === c.numberOfSpheres) {
                    var e = document.getElementById("priceNow").value;
                    a.style.padding = "10px", a.innerHTML = 'Grupa taryfowa: <span class ="value-of-calc-data">'.concat(c.name, '</span>, Umowa kończy się: <span class ="value-of-calc-data">').concat(l.value, '</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">').concat(e, '</span>, Cena w cenniku dla taryfy <span class ="value-of-calc-data">').concat(c.name, '</span>: <span class ="value-of-calc-data">').concat(c.pricesFromDb.tariff.price2022, '</span>, Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearOneSphere, '</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">').concat(c.proposeOneSphere, '</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span><br>Osoba kontaktowa:"), a.scrollIntoView()
                } else if (2 === c.numberOfSpheres) {
                    var t = document.getElementById("havePriceAvr").value,
                        n = document.getElementById("havePriceFirst").value,
                        r = document.getElementById("havePriceSecond").value,
                        o = '<span class="value-of-calc-data">',
                        i = "</span>";
                    a.style.padding = "10px", a.innerHTML = "Grupa taryfowa: ".concat(o).concat(c.name).concat(i, ", <br>Umowa kończy się: ").concat(o).concat(l.value).concat(i, ", <br>Klient posiada aktualnie ceny: Średnia: ").concat(o).concat(t).concat(i, " I strefa: ").concat(o).concat(n).concat(i, " II strefa: ").concat(o).concat(r).concat(i, ", <br>Ceny w cenniku na 2022 dla taryfy ").concat(o).concat(c.name).concat(i, ": Średnia: ").concat(o).concat(c.pricesFromDb.tariff.price2022.avr).concat(i, " I strefa ").concat(o).concat(c.pricesFromDb.tariff.price2022.first).concat(i, " II strefa: ").concat(o).concat(c.pricesFromDb.tariff.price2022.second).concat(i, ', <br>Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearTwoSpheresSum, "</span> MWh. <br>Propozycja cenowa: Średnia: ").concat(o).concat(c.proposeTwoSpheresAvr).concat(i, " I strefa: ").concat(o).concat(c.proposeTwoSpheresFirst).concat(i, " II strefa: ").concat(o).concat(c.proposeTwoSpheresSecond).concat(i, ', <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span><br>Osoba kontaktowa:"), a.scrollIntoView()
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
        N = new M(1, 0, "C11"),
        L = new M(2, 1, "C12a"),
        D = new M(2, 2, "C12b"),
        B = new M(1, 3, "C21"),
        R = new M(2, 4, "C22a"),
        z = new M(2, 5, "C22b"),
        G = new M(1, 6, "B21"),
        q = new M(1, 8, "B11"),
        V = new M(2, 7, "B22")
}, function (e, t, n) {
    "use strict";
    n(46);
    var r = n(4),
        o = n(24),
        c = n(1),
        i = /./.toString,
        a = function (e) {
            n(5)(RegExp.prototype, "toString", e, !0)
        };
    n(6)((function () {
        return "/a/b" != i.call({
            source: "a",
            flags: "b"
        })
    })) ? a((function () {
        var e = r(this);
        return "/".concat(e.source, "/", "flags" in e ? e.flags : !c && e instanceof RegExp ? o.call(e) : void 0)
    })) : "toString" != i.name && a((function () {
        return i.call(this)
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
        i = {};
    n(7)(i, n(0)("iterator"), (function () {
        return this
    })), e.exports = function (e, t, n) {
        e.prototype = r(i, {
            next: o(1, n)
        }), c(e, t + " Iterator")
    }
}, function (e, t, n) {
    var r = n(2),
        o = n(4),
        c = n(22);
    e.exports = n(1) ? Object.defineProperties : function (e, t) {
        o(e);
        for (var n, i = c(t), a = i.length, u = 0; a > u;) r.f(e, n = i[u++], t[n]);
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
        return function (t, n, i) {
            var a, u = r(t),
                s = o(u.length),
                f = c(i, s);
            if (e && n != n) {
                for (; s > f;)
                    if ((a = u[f++]) != a) return !0
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
        i = Object.prototype;
    e.exports = Object.getPrototypeOf || function (e) {
        return e = o(e), r(e, c) ? e[c] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? i : null
    }
}, function (e, t, n) {
    "use strict";
    var r = n(26),
        o = n(15),
        c = n(23),
        i = n(60),
        a = n(61),
        u = n(28),
        s = n(62),
        f = n(63);
    o(o.S + o.F * !n(64)((function (e) {
        Array.from(e)
    })), "Array", {
        from: function (e) {
            var t, n, o, l, p = c(e),
                y = "function" == typeof this ? this : Array,
                v = arguments.length,
                d = v > 1 ? arguments[1] : void 0,
                h = void 0 !== d,
                m = 0,
                g = f(p);
            if (h && (d = r(d, v > 2 ? arguments[2] : void 0, 2)), null == g || y == Array && a(g))
                for (n = new y(t = u(p.length)); t > m; m++) s(n, m, h ? d(p[m], m) : p[m]);
            else
                for (l = g.call(p), n = new y; !(o = l.next()).done; m++) s(n, m, h ? i(l, d, [o.value, m], !0) : o.value);
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
                i = c[r]();
            i.next = function () {
                return {
                    done: n = !0
                }
            }, c[r] = function () {
                return i
            }, e(c)
        } catch (e) {}
        return n
    }
}, function (e, t, n) {
    for (var r = n(66), o = n(22), c = n(5), i = n(3), a = n(7), u = n(16), s = n(0), f = s("iterator"), l = s("toStringTag"), p = u.Array, y = {
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
        }, v = o(y), d = 0; d < v.length; d++) {
        var h, m = v[d],
            g = y[m],
            b = i[m],
            S = b && b.prototype;
        if (S && (S[f] || a(S, f, p), S[l] || a(S, l, m), u[m] = p, g))
            for (h in r) S[h] || c(S, h, r[h], !0)
    }
}, function (e, t, n) {
    "use strict";
    var r = n(67),
        o = n(68),
        c = n(16),
        i = n(10);
    e.exports = n(38)(Array, "Array", (function (e, t) {
        this._t = i(e), this._i = 0, this._k = t
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
        i = n(15),
        a = n(5),
        u = n(71).KEY,
        s = n(6),
        f = n(18),
        l = n(31),
        p = n(12),
        y = n(0),
        v = n(41),
        d = n(40),
        h = n(72),
        m = n(73),
        g = n(4),
        b = n(9),
        S = n(23),
        w = n(10),
        x = n(17),
        O = n(11),
        E = n(27),
        T = n(74),
        F = n(34),
        I = n(42),
        P = n(2),
        k = n(22),
        _ = F.f,
        j = P.f,
        A = T.f,
        C = r.Symbol,
        M = r.JSON,
        N = M && M.stringify,
        L = y("_hidden"),
        D = y("toPrimitive"),
        B = {}.propertyIsEnumerable,
        R = f("symbol-registry"),
        z = f("symbols"),
        G = f("op-symbols"),
        q = Object.prototype,
        V = "function" == typeof C && !!I.f,
        W = r.QObject,
        $ = !W || !W.prototype || !W.prototype.findChild,
        U = c && s((function () {
            return 7 != E(j({}, "a", {
                get: function () {
                    return j(this, "a", {
                        value: 7
                    }).a
                }
            })).a
        })) ? function (e, t, n) {
            var r = _(q, t);
            r && delete q[t], j(e, t, n), r && e !== q && j(q, t, r)
        } : j,
        H = function (e) {
            var t = z[e] = E(C.prototype);
            return t._k = e, t
        },
        K = V && "symbol" == typeof C.iterator ? function (e) {
            return "symbol" == typeof e
        } : function (e) {
            return e instanceof C
        },
        J = function (e, t, n) {
            return e === q && J(G, t, n), g(e), t = x(t, !0), g(n), o(z, t) ? (n.enumerable ? (o(e, L) && e[L][t] && (e[L][t] = !1), n = E(n, {
                enumerable: O(0, !1)
            })) : (o(e, L) || j(e, L, O(1, {})), e[L][t] = !0), U(e, t, n)) : j(e, t, n)
        },
        Y = function (e, t) {
            g(e);
            for (var n, r = h(t = w(t)), o = 0, c = r.length; c > o;) J(e, n = r[o++], t[n]);
            return e
        },
        X = function (e) {
            var t = B.call(this, e = x(e, !0));
            return !(this === q && o(z, e) && !o(G, e)) && (!(t || !o(this, e) || !o(z, e) || o(this, L) && this[L][e]) || t)
        },
        Z = function (e, t) {
            if (e = w(e), t = x(t, !0), e !== q || !o(z, t) || o(G, t)) {
                var n = _(e, t);
                return !n || !o(z, t) || o(e, L) && e[L][t] || (n.enumerable = !0), n
            }
        },
        Q = function (e) {
            for (var t, n = A(w(e)), r = [], c = 0; n.length > c;) o(z, t = n[c++]) || t == L || t == u || r.push(t);
            return r
        },
        ee = function (e) {
            for (var t, n = e === q, r = A(n ? G : w(e)), c = [], i = 0; r.length > i;) !o(z, t = r[i++]) || n && !o(q, t) || c.push(z[t]);
            return c
        };
    V || (a((C = function () {
        if (this instanceof C) throw TypeError("Symbol is not a constructor!");
        var e = p(arguments.length > 0 ? arguments[0] : void 0),
            t = function (n) {
                this === q && t.call(G, n), o(this, L) && o(this[L], e) && (this[L][e] = !1), U(this, e, O(1, n))
            };
        return c && $ && U(q, e, {
            configurable: !0,
            set: t
        }), H(e)
    }).prototype, "toString", (function () {
        return this._k
    })), F.f = Z, P.f = J, n(33).f = T.f = Q, n(32).f = X, I.f = ee, c && !n(19) && a(q, "propertyIsEnumerable", X, !0), v.f = function (e) {
        return H(y(e))
    }), i(i.G + i.W + i.F * !V, {
        Symbol: C
    });
    for (var te = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), ne = 0; te.length > ne;) y(te[ne++]);
    for (var re = k(y.store), oe = 0; re.length > oe;) d(re[oe++]);
    i(i.S + i.F * !V, "Symbol", {
        for: function (e) {
            return o(R, e += "") ? R[e] : R[e] = C(e)
        },
        keyFor: function (e) {
            if (!K(e)) throw TypeError(e + " is not a symbol!");
            for (var t in R)
                if (R[t] === e) return t
        },
        useSetter: function () {
            $ = !0
        },
        useSimple: function () {
            $ = !1
        }
    }), i(i.S + i.F * !V, "Object", {
        create: function (e, t) {
            return void 0 === t ? E(e) : Y(E(e), t)
        },
        defineProperty: J,
        defineProperties: Y,
        getOwnPropertyDescriptor: Z,
        getOwnPropertyNames: Q,
        getOwnPropertySymbols: ee
    });
    var ce = s((function () {
        I.f(1)
    }));
    i(i.S + i.F * ce, "Object", {
        getOwnPropertySymbols: function (e) {
            return I.f(S(e))
        }
    }), M && i(i.S + i.F * (!V || s((function () {
        var e = C();
        return "[null]" != N([e]) || "{}" != N({
            a: e
        }) || "{}" != N(Object(e))
    }))), "JSON", {
        stringify: function (e) {
            for (var t, n, r = [e], o = 1; arguments.length > o;) r.push(arguments[o++]);
            if (n = t = r[1], (b(t) || void 0 !== e) && !K(e)) return m(t) || (t = function (e, t) {
                if ("function" == typeof n && (t = n.call(this, e, t)), !K(t)) return t
            }), r[1] = t, N.apply(M, r)
        }
    }), C.prototype[D] || n(7)(C.prototype, D, C.prototype.valueOf), l(C, "Symbol"), l(Math, "Math", !0), l(r.JSON, "JSON", !0)
}, function (e, t, n) {
    var r = n(12)("meta"),
        o = n(9),
        c = n(8),
        i = n(2).f,
        a = 0,
        u = Object.isExtensible || function () {
            return !0
        },
        s = !n(6)((function () {
            return u(Object.preventExtensions({}))
        })),
        f = function (e) {
            i(e, r, {
                value: {
                    i: "O" + ++a,
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
            for (var i, a = n(e), u = c.f, s = 0; a.length > s;) u.call(e, i = a[s++]) && t.push(i);
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
        i = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    e.exports.f = function (e) {
        return i && "[object Window]" == c.call(e) ? function (e) {
            try {
                return o(e)
            } catch (e) {
                return i.slice()
            }
        }(e) : o(r(e))
    }
}, function (e, t, n) {
    "use strict";
    var r = n(3),
        o = n(8),
        c = n(20),
        i = n(76),
        a = n(17),
        u = n(6),
        s = n(33).f,
        f = n(34).f,
        l = n(2).f,
        p = n(78).trim,
        y = r.Number,
        v = y,
        d = y.prototype,
        h = "Number" == c(n(27)(d)),
        m = "trim" in String.prototype,
        g = function (e) {
            var t = a(e, !1);
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
                    for (var i, u = t.slice(2), s = 0, f = u.length; s < f; s++)
                        if ((i = u.charCodeAt(s)) < 48 || i > o) return NaN;
                    return parseInt(u, r)
                }
            }
            return +t
        };
    if (!y(" 0o1") || !y("0b1") || y("+0x1")) {
        y = function (e) {
            var t = arguments.length < 1 ? 0 : e,
                n = this;
            return n instanceof y && (h ? u((function () {
                d.valueOf.call(n)
            })) : "Number" != c(n)) ? i(new v(g(t)), n, y) : g(t)
        };
        for (var b, S = n(1) ? s(v) : "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","), w = 0; S.length > w; w++) o(v, b = S[w]) && !o(y, b) && l(y, b, f(v, b));
        y.prototype = d, d.constructor = y, n(5)(r, "Number", y)
    }
}, function (e, t, n) {
    var r = n(9),
        o = n(77).set;
    e.exports = function (e, t, n) {
        var c, i = t.constructor;
        return i !== n && "function" == typeof i && (c = i.prototype) !== n.prototype && r(c) && o && o(e, c), e
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
        i = n(79),
        a = "[" + i + "]",
        u = RegExp("^" + a + a + "*"),
        s = RegExp(a + a + "*$"),
        f = function (e, t, n) {
            var o = {},
                a = c((function () {
                    return !!i[e]() || "​" != "​" [e]()
                })),
                u = o[e] = a ? t(l) : i[e];
            n && (o[n] = u), r(r.P + r.F * a, "String", o)
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
        i = n(21),
        a = n(82),
        u = n(83),
        s = Math.max,
        f = Math.min,
        l = Math.floor,
        p = /\$([$&`']|\d\d?|<[^>]*>)/g,
        y = /\$([$&`']|\d\d?)/g;
    n(84)("replace", 2, (function (e, t, n, v) {
        return [function (r, o) {
            var c = e(this),
                i = null == r ? void 0 : r[t];
            return void 0 !== i ? i.call(r, c, o) : n.call(String(c), r, o)
        }, function (e, t) {
            var o = v(n, e, this, t);
            if (o.done) return o.value;
            var l = r(e),
                p = String(this),
                y = "function" == typeof t;
            y || (t = String(t));
            var h = l.global;
            if (h) {
                var m = l.unicode;
                l.lastIndex = 0
            }
            for (var g = [];;) {
                var b = u(l, p);
                if (null === b) break;
                if (g.push(b), !h) break;
                "" === String(b[0]) && (l.lastIndex = a(p, c(l.lastIndex), m))
            }
            for (var S, w = "", x = 0, O = 0; O < g.length; O++) {
                b = g[O];
                for (var E = String(b[0]), T = s(f(i(b.index), p.length), 0), F = [], I = 1; I < b.length; I++) F.push(void 0 === (S = b[I]) ? S : String(S));
                var P = b.groups;
                if (y) {
                    var k = [E].concat(F, T, p);
                    void 0 !== P && k.push(P);
                    var _ = String(t.apply(void 0, k))
                } else _ = d(E, p, T, F, P, t);
                T >= x && (w += p.slice(x, T) + _, x = T + E.length)
            }
            return w + p.slice(x)
        }];

        function d(e, t, r, c, i, a) {
            var u = r + e.length,
                s = c.length,
                f = y;
            return void 0 !== i && (i = o(i), f = p), n.call(a, f, (function (n, o) {
                var a;
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
                        a = i[o.slice(1, -1)];
                        break;
                    default:
                        var f = +o;
                        if (0 === f) return n;
                        if (f > s) {
                            var p = l(f / 10);
                            return 0 === p ? n : p <= s ? void 0 === c[p - 1] ? o.charAt(1) : c[p - 1] + o.charAt(1) : n
                        }
                        a = c[f - 1]
                }
                return void 0 === a ? "" : a
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
        i = n(14),
        a = n(0),
        u = n(43),
        s = a("species"),
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
        var p = a(e),
            y = !c((function () {
                var t = {};
                return t[p] = function () {
                    return 7
                }, 7 != "" [e](t)
            })),
            v = y ? !c((function () {
                var t = !1,
                    n = /a/;
                return n.exec = function () {
                    return t = !0, null
                }, "split" === e && (n.constructor = {}, n.constructor[s] = function () {
                    return n
                }), n[p](""), !t
            })) : void 0;
        if (!y || !v || "replace" === e && !f || "split" === e && !l) {
            var d = /./ [p],
                h = n(i, p, "" [e], (function (e, t, n, r, o) {
                    return t.exec === u ? y && !o ? {
                        done: !0,
                        value: d.call(t, n, r)
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