(function(){
  "use strict";

  /** @param {number} min */
  function r(min, max){
    return Math.random()*(max-min)+min;
  }

  function isSameOriginLink(a){
    try{
      const u=new URL(a.href, location.href);
      return u.origin===location.origin;
    }catch{return false;}
  }

  function mountVfx(){
    const type=(document.body.getAttribute("data-vfx")||"").trim();
    if(!type) return;

    // Performance-aware quality mode (can be overridden per-page):
    // <body data-vfx-quality="low|high">
    const qAttr=(document.body.getAttribute("data-vfx-quality")||"").trim();
    /** @type {"low"|"high"} */
    let quality = (qAttr === "low" || qAttr === "high") ? /** @type {any} */(qAttr) : "low";
    if(!qAttr){
      const hc = Number(navigator.hardwareConcurrency || 0);
      // deviceMemory is not supported everywhere
      // @ts-ignore
      const dm = Number(navigator.deviceMemory || 0);
      const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Default is low (smooth). Upgrade to high only for stronger devices.
      if(!reduceMotion && ((dm && dm >= 8) || (hc && hc >= 8))) quality = "high";
    }

    // Expose to CSS so we can reduce expensive background effects too.
    if(!document.body.hasAttribute("data-vfx-quality")){
      document.body.setAttribute("data-vfx-quality", quality);
    }

    const layer=document.createElement("div");
    layer.className="vfx";
    layer.setAttribute("aria-hidden","true");
    layer.setAttribute("data-type", type);
    layer.setAttribute("data-quality", quality);
    document.body.prepend(layer);

    const countRaw=Number(document.body.getAttribute("data-vfx-count")||"");

    const defaultCount = (type === "sparkles") ? 10 : 12;
    const requested = (Number.isFinite(countRaw) && countRaw > 0) ? Math.floor(countRaw) : defaultCount;
    const cap = (quality === "low") ? 12 : 18;
    const count = Math.max(6, Math.min(requested, cap));

    for(let i=0;i<count;i++){
      const p=document.createElement("i");
      p.className="vfx__p";

      // Shared variables
      p.style.setProperty("--x", String(r(4, 96)));
      const sizeMin = (quality === "low") ? (type === "sparkles" ? 4 : 9) : (type === "sparkles" ? 4 : 10);
      const sizeMax = (quality === "low") ? (type === "sparkles" ? 7 : 16) : (type === "sparkles" ? 8 : 22);
      p.style.setProperty("--s", String(Math.round(r(sizeMin, sizeMax))));
      p.style.setProperty("--o", String(r(.35,.7)));
      const dMin = (type === "confetti") ? 7 : 10;
      const dMax = (type === "confetti") ? 13 : 18;
      // Longer durations feel smoother and reduce perceived lag
      const dur = (quality === "low") ? r(dMin + 2, dMax + 4) : r(dMin + 1, dMax + 3);
      p.style.setProperty("--d", dur.toFixed(2) + "s");
      p.style.setProperty("--delay", String(Math.round(r(-14, -1)))+"s");
      const drift = (quality === "low") ? Math.round(r(-36, 36)) : Math.round(r(-60, 60));
      p.style.setProperty("--drift", String(drift));
      const r0=Math.round(r(-16, 16));
      const r1=r0 + (Math.random()<0.5 ? -1 : 1) * Math.round(r(40, 140));
      p.style.setProperty("--r0", r0+"deg");
      p.style.setProperty("--r1", r1+"deg");

      // subtle sideways wobble for sparkles
      p.style.setProperty("--dx", String(Math.round(r(-10, 10)))+"px");

      if(type==="sparkles"){
        p.style.setProperty("--y", String(r(10, 86)));
        const sd = (quality === "low") ? r(3.4, 6.2) : r(3.0, 5.6);
        p.style.setProperty("--d", sd.toFixed(2) + "s");
        p.style.setProperty("--delay", String(r(-2.5, 0).toFixed(2))+"s");
        const dx = (quality === "low") ? Math.round(r(-12, 12)) : Math.round(r(-18, 18));
        p.style.setProperty("--dx", String(dx) + "px");
      }

      if(type==="confetti"){
        const colors=["rgba(255,255,255,.75)","rgba(255,77,141,.62)","rgba(216,132,177,.62)","rgba(255,119,184,.55)"];
        p.style.setProperty("--c", colors[Math.floor(Math.random()*colors.length)]);
        p.style.setProperty("--s", String(Math.round(r(7, 14))));
        const cd = (quality === "low") ? r(9.5, 14.5) : r(8.5, 13.5);
        p.style.setProperty("--d", cd.toFixed(2) + "s");
        p.style.setProperty("--delay", String(r(-7, 0).toFixed(2))+"s");
      }

      if(type==="hearts"){
        const span=document.createElement("span");
        p.appendChild(span);
      }

      layer.appendChild(p);
    }
  }

  function mountTransitions(){
    document.addEventListener("click", (e)=>{
      const t=/** @type {HTMLElement|null} */(e.target);
      const a=t && (t.closest ? t.closest("a") : null);
      if(!a) return;
      if(a.target==="_blank" || a.hasAttribute("download")) return;
      if(a.getAttribute("href")?.startsWith("#")) return;
      if(!isSameOriginLink(a)) return;

      // Allow modifiers / open in new tab
      // @ts-ignore
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      const href=a.href;
      document.body.classList.add("is-leaving");
      window.setTimeout(()=>{ location.href=href; }, 260);
    }, {capture:true});
  }

  function boot(){
    // Default: keep animations ON even if the OS/browser requests reduced motion.
    // If you want to respect reduced motion, set: <body data-motion="respect"> in the HTML.
    if(!document.body.hasAttribute("data-motion")){
      document.body.setAttribute("data-motion","force");
    }

    document.body.setAttribute("data-theme-ready","0");
    mountVfx();
    mountTransitions();

    // Fade in after first paint
    requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ document.body.setAttribute("data-theme-ready","1"); }); });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();

