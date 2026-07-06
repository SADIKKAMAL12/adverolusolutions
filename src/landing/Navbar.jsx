import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I } from "./shared.jsx";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const setLang = (l) => i18n.changeLanguage(l);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 4);
    onS(); window.addEventListener("scroll", onS);
    return () => window.removeEventListener("scroll", onS);
  }, []);

  const links = [
    { k: "home", href: "#home" },
    { k: "platforms", href: "#platforms" },
    { k: "pricing", href: "#pricing" },
    { k: "features", href: "#features" },
    { k: "faq", href: "#faq" },
    { k: "contact", href: "#footer" }
  ];
  const langs = [{ c: "EN", v: "en" }, { c: "FR", v: "fr" }, { c: "AR", v: "ar" }];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-[0_2px_20px_-12px_rgba(255,45,85,0.25)]" : "bg-white/60 backdrop-blur-md"}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between gap-6">
        <a href="#home" className="flex items-center shrink-0">
          <img src="/assets/logo.png" alt="AdverSolutions" className="h-8 w-auto" />
        </a>
        <nav className="hidden lg:flex items-center gap-1 text-[14.5px] font-medium text-neutral-700">
          {links.map((l, i) => (
            <a key={l.k} href={l.href} className={`px-3.5 py-2 rounded-lg hover:text-[#ff2d55] hover:bg-[#fff5f7] transition ${i === 0 ? "text-[#ff2d55]" : ""}`}>
              {t(`nav.${l.k}`)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <div className="relative hidden sm:block">
            <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-black/10 text-[13px] font-semibold text-neutral-700 hover:border-[#ff2d55]/40 hover:bg-[#fff5f7] transition">
              <I.Globe className="w-4 h-4" />
              {lang.toUpperCase()}
              <I.Caret className="w-3.5 h-3.5 opacity-60" />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute top-11 end-0 w-32 rounded-xl bg-white border border-black/5 shadow-xl shadow-black/5 p-1 z-50">
                  {langs.map(l => (
                    <button key={l.v} onClick={() => { setLang(l.v); setOpen(false); }} className={`w-full text-start px-3 py-2 rounded-lg text-[13.5px] hover:bg-[#fff5f7] ${lang === l.v ? "text-[#ff2d55] font-semibold" : "text-neutral-700"}`}>
                      {l.c} {l.v === "ar" ? "— العربية" : l.v === "fr" ? "— Français" : "— English"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="/#/login" className="hidden sm:inline-flex items-center h-9 px-4 rounded-lg border border-black/10 text-[13.5px] font-semibold text-neutral-800 hover:border-[#ff2d55]/40 hover:text-[#ff2d55] hover:bg-[#fff5f7] transition">
            {t("nav.login")}
          </a>
          <a href="/#/register" className="inline-flex items-center h-9 px-4 rounded-lg bg-gradient-to-b from-[#ff4f7a] to-[#ff2d55] text-white text-[13.5px] font-semibold shadow-[0_6px_18px_-6px_rgba(255,45,85,0.6)] hover:shadow-[0_10px_24px_-6px_rgba(255,45,85,0.7)] hover:-translate-y-px active:translate-y-0 transition">
            {t("nav.cta")}
          </a>
          <button className="lg:hidden ms-1 w-9 h-9 grid place-items-center rounded-lg border border-black/10" onClick={() => setMobile(true)} aria-label="menu">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobile(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="absolute end-0 top-0 h-full w-[300px] bg-white p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <img src="/assets/logo.png" className="h-7" alt="" />
                <button onClick={() => setMobile(false)} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-neutral-100">✕</button>
              </div>
              {links.map(l => (
                <a key={l.k} href={l.href} onClick={() => setMobile(false)} className="px-3 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#fff5f7] hover:text-[#ff2d55]">{t(`nav.${l.k}`)}</a>
              ))}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {langs.map(l => (
                  <button key={l.v} onClick={() => setLang(l.v)} className={`h-9 rounded-lg border text-[13px] font-semibold ${lang === l.v ? "border-[#ff2d55] text-[#ff2d55] bg-[#fff5f7]" : "border-black/10 text-neutral-700"}`}>{l.c}</button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href="/#/login" className="h-10 rounded-lg border border-black/10 text-[13.5px] font-semibold text-neutral-800 flex items-center justify-center">{t("nav.login")}</a>
                <a href="/#/register" className="h-10 rounded-lg bg-gradient-to-b from-[#ff4f7a] to-[#ff2d55] text-white text-[13.5px] font-semibold flex items-center justify-center">{t("nav.cta")}</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
