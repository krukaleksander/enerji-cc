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
            var s, l, f, p, d = e & u.F,
                v = e & u.G,
                h = e & u.S,
                y = e & u.P,
                m = e & u.B,
                g = v ? r : h ? r[t] || (r[t] = {}) : (r[t] || {}).prototype,
                S = v ? o : o[t] || (o[t] = {}),
                b = S.prototype || (S.prototype = {});
            for (s in v && (n = t), n) f = ((l = !d && g && void 0 !== g[s]) ? g : n)[s], p = m && l ? a(f, r) : y && "function" == typeof f ? a(Function.call, f) : f, g && i(g, s, f, e & u.U), S[s] != f && c(S, s, p), y && b[s] != f && (b[s] = f)
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
        l = n(58),
        f = n(0)("iterator"),
        p = !([].keys && "next" in [].keys()),
        d = function () {
            return this
        };
    e.exports = function (e, t, n, v, h, y, m) {
        u(n, t, v);
        var g, S, b, w = function (e) {
                if (!p && e in F) return F[e];
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
            O = "values" == h,
            E = !1,
            F = e.prototype,
            T = F[f] || F["@@iterator"] || h && F[h],
            I = T || w(h),
            P = h ? O ? w("entries") : I : void 0,
            _ = "Array" == t && F.entries || T;
        if (_ && (b = l(_.call(new e))) !== Object.prototype && b.next && (s(b, x, !0), r || "function" == typeof b[f] || i(b, f, d)), O && T && "values" !== T.name && (E = !0, I = function () {
                return T.call(this)
            }), r && !m || !p && !E && F[f] || i(F, f, I), a[t] = I, a[x] = d, h)
            if (g = {
                    values: O ? I : w("values"),
                    keys: y ? I : w("keys"),
                    entries: P
                }, m)
                for (S in g) S in F || c(F, S, g[S]);
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
        l = void 0 !== /()??/.exec("")[1];
    (s || l) && (u = function (e) {
        var t, n, r, o, u = this;
        return l && (n = new RegExp("^" + u.source + "$(?!\\s)", c.call(u))), s && (t = u.lastIndex), r = i.call(u, e), s && r && (u.lastIndex = u.global ? r.index + r[0].length : t), l && r && r.length > 1 && a.call(r[0], n, (function () {
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
        u = (document.getElementById("btnCopyCalc"), document.getElementById("onePriceForAll")),
        s = document.getElementById("tariff"),
        l = document.getElementById("endOfAgreementMonth"),
        f = document.getElementById("endOfAgreement"),
        p = document.getElementById("endOfNewAgreement"),
        d = document.getElementById("activeCalcSavings"),
        v = 0,
        h = 0;
    u.checked = !1, m("tariff", "C11"), m("endOfAgreement", "2020"), m("endOfAgreementMonth", "1"), m("endOfNewAgreement", "2023");
    var y = function (e) {
        return parseFloat(e.replace(/\,/g, "."))
    };

    function m(e, t) {
        document.getElementById(e).value = t
    }
    var g = function () {
        a.style.padding = "0px", a.innerHTML = "", d.style.display = "none", !0
    };
    u.addEventListener("click", (function () {
        h = 0 === h ? 1 : 0
    }));
    var S = function () {
        d.style.display = "block", 0 === v ? Z.mainCalcFn() : 1 === v ? J.mainCalcFn() : 2 === v ? Y.mainCalcFn() : 3 === v ? X.mainCalcFn() : 4 === v ? Q.mainCalcFn() : 5 === v ? ee.mainCalcFn() : 6 === v ? te.mainCalcFn() : 7 === v ? re.mainCalcFn() : 8 === v ? ne.mainCalcFn() : console.log("co jest kurka wódka?")
    };
    o(document.getElementsByClassName("note-remover")).forEach((function (e) {
        e.addEventListener("focus", g)
    })), i.addEventListener("click", S), window.addEventListener("keypress", (function (e) {
        "Enter" === e.key && S()
    }));
    var b = document.querySelector("div.change-price-panel"),
        w = document.querySelector("button.show-price-change"),
        x = document.querySelector("div.change-price-close");
    w.addEventListener("click", (function () {
        b.style.display = "block"
    })), x.addEventListener("click", (function () {
        b.style.display = "none"
    }));
    var O = ["c11", "c12a", "c12b", "c21", "c22a", "c22b", "b21", "b22", "b11"],
        E = document.querySelector(".intakec11c21"),
        F = document.querySelector(".intakec12ac12b"),
        T = document.querySelector(".propositionc11c21"),
        I = document.querySelector(".propositionc12ac12b"),
        P = document.querySelector(".havePricesc12ac12b"),
        _ = document.querySelector(".have-prices-c11"),
        A = function (e, t) {
            e.forEach((function (e) {
                document.querySelector(".tariff".concat(e, "-wrapper")).style.display = "none"
            })), document.querySelector(".tariff".concat(t, "-wrapper")).style.display = "block", k(t)
        },
        k = function (e) {
            "1" === e[2] ? (F.style.display = "none", E.style.display = "block", T.style.display = "block", I.style.display = "none", P.style.display = "none", _.style.display = "block") : "2" === e[2] && (F.style.display = "block", E.style.display = "none", T.style.display = "none", I.style.display = "block", P.style.display = "block", _.style.display = "none")
        };
    s.addEventListener("change", (function () {
        "C12a" === s.value ? (A(O, "c12a"), v = 1) : "C12b" === s.value ? (A(O, "c12b"), v = 2) : "C21" === s.value ? (A(O, "c21"), v = 3) : "C11" === s.value ? (A(O, "c11"), v = 0) : "C22a" === s.value ? (A(O, "c22a"), v = 4) : "C22b" === s.value ? (A(O, "c22b"), v = 5) : "B21" === s.value ? (A(O, "b21"), v = 6) : "B22" === s.value ? (A(O, "b22"), v = 7) : "B11" === s.value && (A(O, "b11"), v = 8), a.scrollIntoView()
    }));
    var j = document.getElementById("clearInputsBtn"),
        C = o(document.getElementsByClassName("set-to-zero"));
    j.addEventListener("click", (function () {
        C.forEach((function (e) {
            e.value = 0
        }))
    })), g();
    var M, N, L, B, D, z, R, q, W, H, G, V, $, K, U = function e(t, n, o) {
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
            })), r(this, "checkEndOfNewAgreement", (function (e, t) {
                var n = [],
                    r = e;
                9999 === e && (r = 2019), n.push(e), [2020, 2021, 2022, 2023].forEach((function (e) {
                    e > r && e <= t && n.push(e)
                })), n.indexOf(2020) > -1 ? c.calc2020 = 1 : c.calc2020 = 0, n.indexOf(2021) > -1 ? c.calc2021 = 1 : c.calc2021 = 0, n.indexOf(2022) > -1 ? c.calc2022 = 1 : c.calc2022 = 0, n.indexOf(2023) > -1 ? c.calc2023 = 1 : c.calc2023 = 0
            })), r(this, "checkEndOfAgreementMonth", (function (e) {
                return parseFloat(((e - 1) / 12).toFixed(2))
            })), r(this, "checkEndOfAgreement", (function () {
                switch (c.checkEndOfNewAgreement(+f.value, +p.value), parseInt(f.value)) {
                    case 2022:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 0, c.countsPrice2022 = 0 + c.checkEndOfAgreementMonth(+l.value);
                        break;
                    case 2021:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 0 + c.checkEndOfAgreementMonth(+l.value), c.countsPrice2022 = 1;
                        break;
                    case 2020:
                        c.countsPrice2020 = 0 + c.checkEndOfAgreementMonth(+l.value), c.countsPrice2021 = 1, c.countsPrice2022 = 1;
                        break;
                    case 9999:
                        c.countsPrice2020 = .08, c.countsPrice2021 = 1, c.countsPrice2022 = 1;
                        break;
                    default:
                        c.countsPrice2020 = 0, c.countsPrice2021 = 0, c.countsPrice2022 = 0
                }
            })), r(this, "getWear", (function () {
                1 === c.numberOfSpheres ? c.wearOneSphere = y(document.getElementById("wear").value) : 2 === c.numberOfSpheres && (c.weareTwoSpeheresFirst = y(document.getElementById("wearFirst").value), c.weareTwoSpeheresSecond = y(document.getElementById("wearSecond").value), c.wearTwoSpheresSum = (c.weareTwoSpeheresFirst + c.weareTwoSpeheresSecond).toFixed(2), document.getElementById("wearSum").value = c.wearTwoSpheresSum)
            })), r(this, "getProposition", (function () {
                1 === c.numberOfSpheres ? c.proposeOneSphere = y(document.getElementById("proposePrice").value) : 2 === c.numberOfSpheres && (c.proposeTwoSpheresAvr = y(document.getElementById("proposePriceAvr").value), c.proposeTwoSpheresFirst = y(document.getElementById("proposePriceFirst").value), c.proposeTwoSpheresSecond = y(document.getElementById("proposePriceSecond").value))
            })), r(this, "calcOneSphere", (function () {
                c.margeMass = Math.floor((c.proposeOneSphere - y(c.pricesFromDb.tariff.price2023)) * c.wearOneSphere * c.calc2023 + (c.proposeOneSphere - y(c.pricesFromDb.tariff.price2022)) * c.wearOneSphere * c.countsPrice2022 * c.calc2022 + (c.proposeOneSphere - y(c.pricesFromDb.tariff.price2021)) * c.wearOneSphere * c.countsPrice2021 * c.calc2021 + (c.proposeOneSphere - y(c.pricesFromDb.tariff.price2020)) * c.wearOneSphere * c.countsPrice2020 * c.calc2020)
            })), r(this, "calcTwoSpheres", (function () {
                if (1 === h) {
                    var e = (c.proposeTwoSpheresAvr - y(c.pricesFromDb.tariff.price2023.avr)) * c.wearTwoSpheresSum * c.calc2023,
                        t = (c.proposeTwoSpheresAvr - y(c.pricesFromDb.tariff.price2022.avr)) * c.wearTwoSpheresSum * c.countsPrice2022 * c.calc2022,
                        n = (c.proposeTwoSpheresAvr - y(c.pricesFromDb.tariff.price2021.avr)) * c.wearTwoSpheresSum * c.countsPrice2021 * c.calc2021,
                        r = (c.proposeTwoSpheresAvr - y(c.pricesFromDb.tariff.price2020.avr)) * c.wearTwoSpheresSum * c.countsPrice2020 * c.calc2020;
                    c.margeMass = (e + t + n + r).toFixed(2)
                } else {
                    var o = (c.proposeTwoSpheresFirst - y(c.pricesFromDb.tariff.price2023.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - y(c.pricesFromDb.tariff.price2023.second)) * c.weareTwoSpeheresSecond * c.calc2023,
                        i = ((c.proposeTwoSpheresFirst - y(c.pricesFromDb.tariff.price2022.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - y(c.pricesFromDb.tariff.price2022.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2022 * c.calc2022,
                        a = ((c.proposeTwoSpheresFirst - y(c.pricesFromDb.tariff.price2021.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - y(c.pricesFromDb.tariff.price2021.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2021 * c.calc2021,
                        u = ((c.proposeTwoSpheresFirst - y(c.pricesFromDb.tariff.price2020.first)) * c.weareTwoSpeheresFirst + (c.proposeTwoSpheresSecond - y(c.pricesFromDb.tariff.price2020.second)) * c.weareTwoSpeheresSecond) * c.countsPrice2020 * c.calc2020;
                    c.margeMass = (o + i + a + u).toFixed(2)
                }
            })), r(this, "createNote", (function () {
                if (1 === c.numberOfSpheres) {
                    var e = document.getElementById("priceNow").value;
                    a.style.padding = "10px", a.innerHTML = 'Grupa taryfowa: <span class ="value-of-calc-data">'.concat(c.name, '</span>, Umowa kończy się: <span class ="value-of-calc-data">').concat(f.value, '</span>, Klient posiada aktualnie cenę: <span class="value-of-calc-data">').concat(e, '</span>, Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearOneSphere, '</span> MWh. Propozycja cenowa: <span class ="value-of-calc-data">').concat(c.proposeOneSphere, '</span>, Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span>"), a.scrollIntoView()
                } else if (2 === c.numberOfSpheres) {
                    var t = document.getElementById("havePriceAvr").value,
                        n = document.getElementById("havePriceFirst").value,
                        r = document.getElementById("havePriceSecond").value,
                        o = '<span class="value-of-calc-data">',
                        i = "</span>";
                    a.style.padding = "10px", a.innerHTML = "Grupa taryfowa: ".concat(o).concat(c.name).concat(i, ", <br>Umowa kończy się: ").concat(o).concat(f.value).concat(i, ", <br>Klient posiada aktualnie ceny: Średnia: ").concat(o).concat(t).concat(i, " I strefa: ").concat(o).concat(n).concat(i, " II strefa: ").concat(o).concat(r).concat(i, '<br>Zużycie roczne: <span class ="value-of-calc-data">').concat(c.wearTwoSpheresSum, "</span> MWh. <br>Propozycja cenowa: Średnia: ").concat(o).concat(c.proposeTwoSpheresAvr).concat(i, " I strefa: ").concat(o).concat(c.proposeTwoSpheresFirst).concat(i, " II strefa: ").concat(o).concat(c.proposeTwoSpheresSecond).concat(i, ', <br>Masa marży: ~ <span class ="value-of-calc-data marge-mass-span">').concat(c.margeMass, "</span>"), a.scrollIntoView()
                }
            })), r(this, "checkWhatIsBetter", (function () {
                if (2 === c.numberOfSpheres) {
                    c.getWear(), c.getProposition();
                    (Number(c.wearTwoSpheresSum) * c.proposeTwoSpheresAvr).toFixed(2), (c.weareTwoSpeheresFirst * c.proposeTwoSpheresFirst + c.weareTwoSpeheresSecond * c.proposeTwoSpheresSecond).toFixed(2)
                }
            })), r(this, "mainCalcFn", (function () {
                c.checkEndOfAgreement(), c.getWear(), c.getProposition(), 1 === c.numberOfSpheres ? c.calcOneSphere() : 2 === c.numberOfSpheres && c.calcTwoSpheres(), c.createNote()
            })), this.numberOfSpheres = t, this.indexOfData = n, this.pricesFromDbDone = this.getPricesFromDb(), this.name = o, this.calc2020 = 0, this.calc2021 = 0, this.calc2022 = 0, this.calc2023 = 0
        },
        Z = new U(1, 0, "C11"),
        J = new U(2, 1, "C12a"),
        Y = new U(2, 2, "C12b"),
        X = new U(1, 3, "C21"),
        Q = new U(2, 4, "C22a"),
        ee = new U(2, 5, "C22b"),
        te = new U(1, 6, "B21"),
        ne = new U(1, 8, "B11"),
        re = new U(2, 7, "B22");

    function oe(e) {
        return parseFloat(e.replace(/\,/g, "."))
    }
    document.getElementById("activeCalcSavings").addEventListener("click", (function () {
        M = oe(document.getElementById("wear").value), N = oe(document.getElementById("wearFirst").value), L = oe(document.getElementById("wearSecond").value), B = oe(document.getElementById("priceNow").value), D = oe(document.getElementById("havePriceAvr").value), z = oe(document.getElementById("havePriceFirst").value), R = oe(document.getElementById("havePriceSecond").value), q = oe(document.getElementById("proposePrice").value), W = oe(document.getElementById("proposePriceFirst").value), H = oe(document.getElementById("proposePriceSecond").value), G = oe(document.getElementById("proposePriceAvr").value), V = oe(document.getElementById("tradeFee").value), $ = document.getElementById("tariff").value, K = document.getElementById("summaryCalc");
        var e, t, n = (12 * Number(V)).toFixed(2);
        if (K.innerHTML = (e = K.innerHTML, -13 != (t = e.indexOf("savings-note") - 12) ? e.slice(0, t) : e), "1" === $[2]) {
            var r = ((B - q) * M).toFixed(2),
                o = K.innerHTML;
            K.innerHTML = o + '<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(n, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(r, '</span></p><p class="savings-par">Oszczędności suma:  <span>').concat(Number(r) + Number(n), "</span></p></div>")
        } else if (0 === h) {
            var c = ((z - W) * N + (R - H) * L).toFixed(2),
                i = K.innerHTML;
            K.innerHTML = i + '<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(n, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(c, '</span></p><p class="savings-par">Oszczędności suma:  <span>').concat(Number(c) + Number(n), "</span></p></div>")
        } else {
            var a = ((D - G) * (N + L)).toFixed(2),
                u = K.innerHTML;
            K.innerHTML = u + '<div class="savings-note"><p class="savings-note__par">Klient oszczędzi na opłacie handlowej:  <span>'.concat(n, '.</span></p><p class="savings-par">Dodatkowo na prądzie:  <span>').concat(a, '</span></p><p class="savings-par">Oszczędności suma:  <span>').concat(Number(a) + Number(n), "</span></p></div>")
        }
    }));
    var ce = {
        calcWearContainer: document.querySelector(".calc-wear"),
        hideWearContBtn: document.querySelector(".calc-wear__hide"),
        calcWearBtn: document.querySelector(".calc-wear__btn"),
        scorePlace: document.querySelector(".calc-wear__score"),
        mainCalcFn: function () {
            this.wearFistSphere = Number(document.querySelector(".calc-wear__input--first-sphere").value), this.wearSecondSphere = Number(document.querySelector(".calc-wear__input--second-sphere").value), this.wearDays = Number(document.querySelector(".calc-wear__input--days").value), this.sum = 365 * (this.wearFistSphere / this.wearDays + this.wearSecondSphere / this.wearDays) / 1e3, this.scorePlace.innerHTML = "Zużycie roczne w I strefie <span>".concat((this.wearFistSphere / this.wearDays * 365 / 1e3).toFixed(2), " mWh</span>\n        <br>\n        Zużycie roczne w II strefie <span>").concat((this.wearSecondSphere / this.wearDays * 365 / 1e3).toFixed(2), " mWh</span>\n        <br>\n        Zużycie roczne suma <span>").concat(this.sum.toFixed(2), " mWh</span>\n        ")
        },
        addAnimationToCont: function (e) {
            this.calcWearContainer.style.animation = e ? "showCalcWear 1s linear both" : "none"
        }
    };
    document.querySelector(".show-calc-wear").addEventListener("click", (function () {
        ce.calcWearContainer.style.display = "flex", ce.addAnimationToCont(!0)
    })), document.querySelector(".calc-wear__hide").addEventListener("click", (function () {
        ce.calcWearContainer.style.display = "none", ce.addAnimationToCont(!1)
    })), document.querySelector(".calc-wear__btn").addEventListener("click", (function () {
        ce.mainCalcFn()
    }))
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
                l = c(i, s);
            if (e && n != n) {
                for (; s > l;)
                    if ((a = u[l++]) != a) return !0
            } else
                for (; s > l; l++)
                    if ((e || l in u) && u[l] === n) return e || l || 0;
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
        l = n(63);
    o(o.S + o.F * !n(64)((function (e) {
        Array.from(e)
    })), "Array", {
        from: function (e) {
            var t, n, o, f, p = c(e),
                d = "function" == typeof this ? this : Array,
                v = arguments.length,
                h = v > 1 ? arguments[1] : void 0,
                y = void 0 !== h,
                m = 0,
                g = l(p);
            if (y && (h = r(h, v > 2 ? arguments[2] : void 0, 2)), null == g || d == Array && a(g))
                for (n = new d(t = u(p.length)); t > m; m++) s(n, m, y ? h(p[m], m) : p[m]);
            else
                for (f = g.call(p), n = new d; !(o = f.next()).done; m++) s(n, m, y ? i(f, h, [o.value, m], !0) : o.value);
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
    for (var r = n(66), o = n(22), c = n(5), i = n(3), a = n(7), u = n(16), s = n(0), l = s("iterator"), f = s("toStringTag"), p = u.Array, d = {
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
        }, v = o(d), h = 0; h < v.length; h++) {
        var y, m = v[h],
            g = d[m],
            S = i[m],
            b = S && S.prototype;
        if (b && (b[l] || a(b, l, p), b[f] || a(b, f, m), u[m] = p, g))
            for (y in r) b[y] || c(b, y, r[y], !0)
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
        l = n(18),
        f = n(31),
        p = n(12),
        d = n(0),
        v = n(41),
        h = n(40),
        y = n(72),
        m = n(73),
        g = n(4),
        S = n(9),
        b = n(23),
        w = n(10),
        x = n(17),
        O = n(11),
        E = n(27),
        F = n(74),
        T = n(34),
        I = n(42),
        P = n(2),
        _ = n(22),
        A = T.f,
        k = P.f,
        j = F.f,
        C = r.Symbol,
        M = r.JSON,
        N = M && M.stringify,
        L = d("_hidden"),
        B = d("toPrimitive"),
        D = {}.propertyIsEnumerable,
        z = l("symbol-registry"),
        R = l("symbols"),
        q = l("op-symbols"),
        W = Object.prototype,
        H = "function" == typeof C && !!I.f,
        G = r.QObject,
        V = !G || !G.prototype || !G.prototype.findChild,
        $ = c && s((function () {
            return 7 != E(k({}, "a", {
                get: function () {
                    return k(this, "a", {
                        value: 7
                    }).a
                }
            })).a
        })) ? function (e, t, n) {
            var r = A(W, t);
            r && delete W[t], k(e, t, n), r && e !== W && k(W, t, r)
        } : k,
        K = function (e) {
            var t = R[e] = E(C.prototype);
            return t._k = e, t
        },
        U = H && "symbol" == typeof C.iterator ? function (e) {
            return "symbol" == typeof e
        } : function (e) {
            return e instanceof C
        },
        Z = function (e, t, n) {
            return e === W && Z(q, t, n), g(e), t = x(t, !0), g(n), o(R, t) ? (n.enumerable ? (o(e, L) && e[L][t] && (e[L][t] = !1), n = E(n, {
                enumerable: O(0, !1)
            })) : (o(e, L) || k(e, L, O(1, {})), e[L][t] = !0), $(e, t, n)) : k(e, t, n)
        },
        J = function (e, t) {
            g(e);
            for (var n, r = y(t = w(t)), o = 0, c = r.length; c > o;) Z(e, n = r[o++], t[n]);
            return e
        },
        Y = function (e) {
            var t = D.call(this, e = x(e, !0));
            return !(this === W && o(R, e) && !o(q, e)) && (!(t || !o(this, e) || !o(R, e) || o(this, L) && this[L][e]) || t)
        },
        X = function (e, t) {
            if (e = w(e), t = x(t, !0), e !== W || !o(R, t) || o(q, t)) {
                var n = A(e, t);
                return !n || !o(R, t) || o(e, L) && e[L][t] || (n.enumerable = !0), n
            }
        },
        Q = function (e) {
            for (var t, n = j(w(e)), r = [], c = 0; n.length > c;) o(R, t = n[c++]) || t == L || t == u || r.push(t);
            return r
        },
        ee = function (e) {
            for (var t, n = e === W, r = j(n ? q : w(e)), c = [], i = 0; r.length > i;) !o(R, t = r[i++]) || n && !o(W, t) || c.push(R[t]);
            return c
        };
    H || (a((C = function () {
        if (this instanceof C) throw TypeError("Symbol is not a constructor!");
        var e = p(arguments.length > 0 ? arguments[0] : void 0),
            t = function (n) {
                this === W && t.call(q, n), o(this, L) && o(this[L], e) && (this[L][e] = !1), $(this, e, O(1, n))
            };
        return c && V && $(W, e, {
            configurable: !0,
            set: t
        }), K(e)
    }).prototype, "toString", (function () {
        return this._k
    })), T.f = X, P.f = Z, n(33).f = F.f = Q, n(32).f = Y, I.f = ee, c && !n(19) && a(W, "propertyIsEnumerable", Y, !0), v.f = function (e) {
        return K(d(e))
    }), i(i.G + i.W + i.F * !H, {
        Symbol: C
    });
    for (var te = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), ne = 0; te.length > ne;) d(te[ne++]);
    for (var re = _(d.store), oe = 0; re.length > oe;) h(re[oe++]);
    i(i.S + i.F * !H, "Symbol", {
        for: function (e) {
            return o(z, e += "") ? z[e] : z[e] = C(e)
        },
        keyFor: function (e) {
            if (!U(e)) throw TypeError(e + " is not a symbol!");
            for (var t in z)
                if (z[t] === e) return t
        },
        useSetter: function () {
            V = !0
        },
        useSimple: function () {
            V = !1
        }
    }), i(i.S + i.F * !H, "Object", {
        create: function (e, t) {
            return void 0 === t ? E(e) : J(E(e), t)
        },
        defineProperty: Z,
        defineProperties: J,
        getOwnPropertyDescriptor: X,
        getOwnPropertyNames: Q,
        getOwnPropertySymbols: ee
    });
    var ce = s((function () {
        I.f(1)
    }));
    i(i.S + i.F * ce, "Object", {
        getOwnPropertySymbols: function (e) {
            return I.f(b(e))
        }
    }), M && i(i.S + i.F * (!H || s((function () {
        var e = C();
        return "[null]" != N([e]) || "{}" != N({
            a: e
        }) || "{}" != N(Object(e))
    }))), "JSON", {
        stringify: function (e) {
            for (var t, n, r = [e], o = 1; arguments.length > o;) r.push(arguments[o++]);
            if (n = t = r[1], (S(t) || void 0 !== e) && !U(e)) return m(t) || (t = function (e, t) {
                if ("function" == typeof n && (t = n.call(this, e, t)), !U(t)) return t
            }), r[1] = t, N.apply(M, r)
        }
    }), C.prototype[B] || n(7)(C.prototype, B, C.prototype.valueOf), f(C, "Symbol"), f(Math, "Math", !0), f(r.JSON, "JSON", !0)
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
        l = function (e) {
            i(e, r, {
                value: {
                    i: "O" + ++a,
                    w: {}
                }
            })
        },
        f = e.exports = {
            KEY: r,
            NEED: !1,
            fastKey: function (e, t) {
                if (!o(e)) return "symbol" == typeof e ? e : ("string" == typeof e ? "S" : "P") + e;
                if (!c(e, r)) {
                    if (!u(e)) return "F";
                    if (!t) return "E";
                    l(e)
                }
                return e[r].i
            },
            getWeak: function (e, t) {
                if (!c(e, r)) {
                    if (!u(e)) return !0;
                    if (!t) return !1;
                    l(e)
                }
                return e[r].w
            },
            onFreeze: function (e) {
                return s && f.NEED && u(e) && !c(e, r) && l(e), e
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
        l = n(34).f,
        f = n(2).f,
        p = n(78).trim,
        d = r.Number,
        v = d,
        h = d.prototype,
        y = "Number" == c(n(27)(h)),
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
                    for (var i, u = t.slice(2), s = 0, l = u.length; s < l; s++)
                        if ((i = u.charCodeAt(s)) < 48 || i > o) return NaN;
                    return parseInt(u, r)
                }
            }
            return +t
        };
    if (!d(" 0o1") || !d("0b1") || d("+0x1")) {
        d = function (e) {
            var t = arguments.length < 1 ? 0 : e,
                n = this;
            return n instanceof d && (y ? u((function () {
                h.valueOf.call(n)
            })) : "Number" != c(n)) ? i(new v(g(t)), n, d) : g(t)
        };
        for (var S, b = n(1) ? s(v) : "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","), w = 0; b.length > w; w++) o(v, S = b[w]) && !o(d, S) && f(d, S, l(v, S));
        d.prototype = h, h.constructor = d, n(5)(r, "Number", d)
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
        l = function (e, t, n) {
            var o = {},
                a = c((function () {
                    return !!i[e]() || "​" != "​" [e]()
                })),
                u = o[e] = a ? t(f) : i[e];
            n && (o[n] = u), r(r.P + r.F * a, "String", o)
        },
        f = l.trim = function (e, t) {
            return e = String(o(e)), 1 & t && (e = e.replace(u, "")), 2 & t && (e = e.replace(s, "")), e
        };
    e.exports = l
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
        l = Math.min,
        f = Math.floor,
        p = /\$([$&`']|\d\d?|<[^>]*>)/g,
        d = /\$([$&`']|\d\d?)/g;
    n(84)("replace", 2, (function (e, t, n, v) {
        return [function (r, o) {
            var c = e(this),
                i = null == r ? void 0 : r[t];
            return void 0 !== i ? i.call(r, c, o) : n.call(String(c), r, o)
        }, function (e, t) {
            var o = v(n, e, this, t);
            if (o.done) return o.value;
            var f = r(e),
                p = String(this),
                d = "function" == typeof t;
            d || (t = String(t));
            var y = f.global;
            if (y) {
                var m = f.unicode;
                f.lastIndex = 0
            }
            for (var g = [];;) {
                var S = u(f, p);
                if (null === S) break;
                if (g.push(S), !y) break;
                "" === String(S[0]) && (f.lastIndex = a(p, c(f.lastIndex), m))
            }
            for (var b, w = "", x = 0, O = 0; O < g.length; O++) {
                S = g[O];
                for (var E = String(S[0]), F = s(l(i(S.index), p.length), 0), T = [], I = 1; I < S.length; I++) T.push(void 0 === (b = S[I]) ? b : String(b));
                var P = S.groups;
                if (d) {
                    var _ = [E].concat(T, F, p);
                    void 0 !== P && _.push(P);
                    var A = String(t.apply(void 0, _))
                } else A = h(E, p, F, T, P, t);
                F >= x && (w += p.slice(x, F) + A, x = F + E.length)
            }
            return w + p.slice(x)
        }];

        function h(e, t, r, c, i, a) {
            var u = r + e.length,
                s = c.length,
                l = d;
            return void 0 !== i && (i = o(i), l = p), n.call(a, l, (function (n, o) {
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
                        var l = +o;
                        if (0 === l) return n;
                        if (l > s) {
                            var p = f(l / 10);
                            return 0 === p ? n : p <= s ? void 0 === c[p - 1] ? o.charAt(1) : c[p - 1] + o.charAt(1) : n
                        }
                        a = c[l - 1]
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
        l = !c((function () {
            var e = /./;
            return e.exec = function () {
                var e = [];
                return e.groups = {
                    a: "7"
                }, e
            }, "7" !== "".replace(e, "$<a>")
        })),
        f = function () {
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
        if (!d || !v || "replace" === e && !l || "split" === e && !f) {
            var h = /./ [p],
                y = n(i, p, "" [e], (function (e, t, n, r, o) {
                    return t.exec === u ? d && !o ? {
                        done: !0,
                        value: h.call(t, n, r)
                    } : {
                        done: !0,
                        value: e.call(n, t, r)
                    } : {
                        done: !1
                    }
                })),
                m = y[0],
                g = y[1];
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