import { r as c, j as e, c as h, R as N, a as E } from "./utils-BMb77LDV.js";
function k({ value: f = 22, onChange: t }) {
  const [r, l] = c.useState(f), [a, p] = c.useState(!1), d = c.useRef(null), i = 16, g = 32, v = (s) => {
    p(!0), x(s);
  }, x = (s) => {
    if (!d.current) return;
    const n = d.current.getBoundingClientRect(), o = n.left + n.width / 2, u = n.top + n.height / 2, j = s.clientX - o, _ = s.clientY - u;
    let m = Math.atan2(_, j) * (180 / Math.PI) + 90;
    m > 180 && (m -= 360);
    const y = (Math.max(-135, Math.min(135, m)) + 135) / 270, T = i + y * (g - i), w = Math.round(T * 2) / 2;
    l(w), t && t(w);
  };
  c.useEffect(() => {
    const s = (o) => {
      a && x(o);
    }, n = () => {
      p(!1);
    };
    return window.addEventListener("pointermove", s), window.addEventListener("pointerup", n), () => {
      window.removeEventListener("pointermove", s), window.removeEventListener("pointerup", n);
    };
  }, [a]);
  const b = (r - i) / (g - i) * 270 - 135;
  return /* @__PURE__ */ e.jsxs("div", { className: "relative w-80 h-80 rounded-full bg-surface-darker shadow-rim p-2 flex items-center justify-center select-none touch-none", children: [
    /* @__PURE__ */ e.jsx("div", { className: "absolute inset-4 rounded-full bg-surface-dark shadow-soft-out flex items-center justify-center pointer-events-none", children: Array.from({ length: 33 }).map((s, n) => {
      const o = n / 32 * 270 - 135, u = o <= b;
      return /* @__PURE__ */ e.jsx(
        "div",
        {
          className: h(
            "absolute w-0.5 origin-bottom transition-all duration-300 rounded-[1px]",
            u ? "bg-tech-orange shadow-[0_0_6px_var(--color-tech-orange)] z-10" : "bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.08)]"
          ),
          style: {
            height: "10px",
            top: "1px",
            left: "50%",
            transformOrigin: "50% 144px",
            transform: `translateX(-50%) rotate(${o}deg)`
          }
        },
        n
      );
    }) }),
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        ref: d,
        onPointerDown: v,
        className: h(
          "w-56 h-56 rounded-full bg-surface-dark shadow-soft-out flex items-center justify-center relative z-10 border border-black/20 cursor-grab active:cursor-grabbing",
          a && "scale-[0.98] transition-transform duration-100"
        ),
        children: [
          /* @__PURE__ */ e.jsx("div", { className: "w-full h-full rounded-full bg-gradient-to-br from-white/5 to-transparent absolute inset-0 pointer-events-none" }),
          /* @__PURE__ */ e.jsx(
            "div",
            {
              className: h(
                "absolute inset-0 rounded-full",
                !a && "transition-transform duration-300 ease-out"
              ),
              style: { transform: `rotate(${b}deg)` },
              children: /* @__PURE__ */ e.jsx("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-tech-orange shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_0_8px_var(--color-tech-orange)] ring-1 ring-black/50 border border-black/20" })
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col items-center justify-center z-20 pointer-events-none", children: [
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-[10px] text-gray-600 tracking-widest mb-1", children: "SETPOINT" }),
            /* @__PURE__ */ e.jsx("span", { className: "font-tech text-6xl font-bold text-gray-200 text-glow-blue tabular-nums leading-none", children: r.toFixed(1) })
          ] })
        ]
      }
    )
  ] });
}
class M extends HTMLElement {
  // 1. setConfig: HA calls this when the card is loaded with the YAML config
  setConfig(t) {
    if (!t.entity)
      throw new Error("You need to define an entity (climate.something)");
    this._config = t;
  }
  // 2. set hass: HA calls this whenever the state changes
  set hass(t) {
    this._hass = t, this.render();
  }
  // 3. Render the React Component
  render() {
    this.root || (this.root = N.createRoot(this));
    const t = this._config.entity, r = this._hass.states[t], l = r ? parseFloat(r.attributes.temperature || r.state) : 22;
    this.root.render(
      /* @__PURE__ */ e.jsx(E.StrictMode, { children: /* @__PURE__ */ e.jsx("div", { className: "tactile-card-container", style: { display: "flex", justifyContent: "center", padding: "16px" }, children: /* @__PURE__ */ e.jsx(
        k,
        {
          value: l,
          onChange: (a) => {
            this._hass.callService("climate", "set_temperature", {
              entity_id: t,
              temperature: a
            });
          }
        }
      ) }) })
    );
  }
  // 4. Card Size (optional)
  getCardSize() {
    return 4;
  }
}
customElements.define("tactile-thermostat-card", M);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tactile-thermostat-card",
  name: "Tactile Thermostat",
  description: "A futuristic tactile thermostat knob"
});
