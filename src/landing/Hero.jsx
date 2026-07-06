import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I, PlatformLogo } from "./shared.jsx";

function BillingMockup() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const b = t("billing", { returnObjects: true });
  const txns = [
    { d: lang === "ar" ? "22 مايو 2024" : lang === "fr" ? "22 mai 2024" : "May 22, 2024", desc: "Facebook Ads", amt: "$450.23" },
    { d: lang === "ar" ? "21 مايو 2024" : lang === "fr" ? "21 mai 2024" : "May 21, 2024", desc: "Instagram Ads", amt: "$320.50" },
    { d: lang === "ar" ? "20 مايو 2024" : lang === "fr" ? "20 mai 2024" : "May 20, 2024", desc: "Facebook Ads", amt: "$277.83" },
    { d: lang === "ar" ? "19 مايو 2024" : lang === "fr" ? "19 mai 2024" : "May 19, 2024", desc: "Meta Ads", amt: "$199.00" }
  ];
  return (
    <div className="relative w-full bg-white rounded-[22px] border border-black/[0.06] shadow-[0_30px_60px_-25px_rgba(20,20,40,0.18),0_8px_24px_-12px_rgba(255,45,85,0.18)] overflow-hidden" dir="ltr">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/[0.05]">
        <div className="flex items-center gap-2.5">
          <PlatformLogo k="meta" className="w-7 h-7" />
          <div className="text-[15px] font-semibold text-neutral-900">{b.title}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {b.active}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 pt-5">
        <div className="bg-gradient-to-br from-[#fff8fa] to-white rounded-2xl border border-black/[0.05] p-4">
          <div className="text-[11.5px] text-neutral-500 font-medium">{b.outstanding}</div>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div>
              <div className="text-[24px] font-bold tracking-tight text-neutral-900 tabular-nums">$1,248.36</div>
              <div className="text-[10.5px] text-neutral-400 mt-0.5">{b.anyFees}</div>
            </div>
            <button className="h-7 px-3 rounded-lg bg-[#ff2d55] text-white text-[11.5px] font-semibold shadow-[0_4px_10px_-3px_rgba(255,45,85,0.45)]">{b.payNow}</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-black/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11.5px] text-neutral-500 font-medium">{b.methods}</div>
            <button className="text-[10.5px] text-[#ff2d55] font-semibold inline-flex items-center gap-0.5">
              <I.Plus2 className="w-3 h-3" />
              {b.addMethod}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <I.Card className="w-9 h-7" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-semibold text-neutral-900">{b.creditLine}</span>
                <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{b.default}</span>
              </div>
              <div className="text-[10.5px] text-neutral-500 mt-0.5">
                {b.creditAvail} <span className="text-emerald-600 font-semibold">{b.high}</span>
              </div>
              <div className="text-[10px] text-neutral-400">{b.company}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5">
        <div className="bg-white rounded-2xl border border-black/[0.05] p-4">
          <div className="text-[12px] font-semibold text-neutral-700">{b.spendLimit}</div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
            <span>{b.remaining}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "50%" }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"></motion.div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[10.5px] text-neutral-500">{b.spent}</div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dashed border-black/[0.06] pt-2.5">
            <div className="text-[10.5px] text-neutral-400">{b.resetsManually}</div>
            <button className="text-[11px] font-semibold text-neutral-700 border border-black/10 rounded-md px-2 py-1 hover:bg-neutral-50">{b.resetNow}</button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-5">
        <div className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.05] text-[12px] font-semibold text-neutral-700">{b.recent}</div>
          <div className="px-4 pt-2.5">
            <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr] text-[10.5px] uppercase tracking-wide text-neutral-400 font-semibold pb-2 border-b border-black/[0.04]">
              <div>{b.date}</div><div>{b.desc}</div><div>{b.amount}</div><div>{b.status}</div>
            </div>
            {txns.map((tx, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.7fr] py-2.5 text-[12px] text-neutral-700 border-b border-black/[0.03] last:border-b-0 items-center">
                <div className="text-neutral-500">{tx.d}</div>
                <div className="font-medium">{tx.desc}</div>
                <div className="font-semibold tabular-nums">{tx.amt}</div>
                <div><span className="inline-flex text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{b.paid}</span></div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 text-end">
            <a href="#" className="text-[11.5px] font-semibold text-[#ff2d55] hover:underline">{b.viewAll}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingLogo({ k, className, delay = 0, dur = 6 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2 + delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
        className="bg-white rounded-2xl shadow-[0_18px_40px_-18px_rgba(255,45,85,0.35),0_4px_12px_-4px_rgba(0,0,0,0.08)] p-3"
      >
        <PlatformLogo k={k} className="w-9 h-9" />
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };
  const badges = t("hero.badges", { returnObjects: true });

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fff5f7] via-white to-white"></div>
      <div className="absolute -z-10 top-0 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(closest-side, #ffd6e0, transparent 70%)" }}></div>
      <div className="absolute -z-10 top-32 right-0 w-[520px] h-[520px] rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(closest-side, #ffe5ec, transparent 70%)" }}></div>
      <svg className="absolute -z-10 right-0 top-24 w-72 h-60 opacity-30" aria-hidden="true">
        <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#ff2d55"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 lg:pt-20 pb-16 lg:pb-24 grid lg:grid-cols-[1.05fr_1.15fr] gap-12 lg:gap-10 items-center">
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#ffd6e0] text-[12.5px] font-semibold text-[#ff2d55] shadow-[0_8px_20px_-12px_rgba(255,45,85,0.35)]">
            <I.Check className="w-3.5 h-3.5" />
            {t("hero.badge")}
          </motion.div>
          <motion.h1 variants={item} className="mt-5 text-[44px] sm:text-[52px] lg:text-[62px] leading-[1.05] font-extrabold tracking-tight text-neutral-900" style={{ textWrap: "balance" }}>
            {t("hero.title_1")}{" "}
            <span className="whitespace-nowrap">
              {t("hero.title_with")}{" "}
              <span className="bg-gradient-to-r from-[#ff4f7a] to-[#ff2d55] bg-clip-text text-transparent">{t("hero.title_2")}</span>
            </span>{" "}
            <span className="bg-gradient-to-r from-[#ff4f7a] to-[#ff2d55] bg-clip-text text-transparent">{t("hero.title_3")}</span>
          </motion.h1>
          <motion.p variants={item} className="mt-5 text-[16.5px] leading-[1.6] text-neutral-600 max-w-[540px]">
            {t("hero.sub")}
          </motion.p>
          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <a href="/#/register" className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-b from-[#ff4f7a] to-[#ff2d55] text-white text-[14.5px] font-semibold shadow-[0_14px_30px_-12px_rgba(255,45,85,0.55)] hover:shadow-[0_18px_36px_-12px_rgba(255,45,85,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition">
              {t("hero.cta1")}
              <I.Arrow className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
            </a>
            <a href="#platforms" className="inline-flex items-center h-12 px-5 rounded-xl bg-white border border-black/10 text-[14.5px] font-semibold text-neutral-800 hover:border-[#ff2d55]/30 hover:text-[#ff2d55] hover:bg-[#fff5f7] transition">
              {t("hero.cta2")}
            </a>
          </motion.div>
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-neutral-600">
            {badges.map((bd, i) => (
              <div key={i} className="inline-flex items-center gap-2">
                <I.Check className="w-4 h-4 text-[#ff2d55]" />
                <span className="font-medium">{bd}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative">
          <FloatingLogo k="meta" className="-top-6 left-0 lg:-left-8" delay={0.2} dur={6} />
          <FloatingLogo k="google" className="top-1/3 -left-10 lg:-left-14" delay={0.6} dur={7} />
          <FloatingLogo k="tiktok" className="-top-4 right-2 lg:-right-2" delay={0.4} dur={6.5} />
          <FloatingLogo k="snapchat" className="top-[42%] -right-8 lg:-right-12" delay={0.8} dur={7.5} />
          <FloatingLogo k="bing" className="-bottom-2 right-6 lg:right-10" delay={1.0} dur={6} />
          <motion.div initial={{ opacity: 0, y: 30, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="relative">
            <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-[#ff4f7a]/20 to-[#ff2d55]/0 blur-2xl -z-10"></div>
            <BillingMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
