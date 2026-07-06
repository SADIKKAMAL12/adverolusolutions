import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I, PlatformLogo } from "./shared.jsx";
import SectionHeader from "./SectionHeader.jsx";

export default function Pricing() {
  const { t } = useTranslation();
  const cards = t("pricing.cards", { returnObjects: true });
  const platformKeys = ["meta", "google", "tiktok"];
  return (
    <section id="pricing" className="relative py-20 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-[#fff8fa]"></div>
      <SectionHeader kicker={t("pricing.kicker")} title={t("pricing.title")} sub={t("pricing.sub")} />
      <div className="max-w-6xl mx-auto px-5 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {cards.map((c, i) => {
          const featured = i === 1;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl p-7 transition-all ${
                featured
                  ? "bg-white border-2 border-[#ff2d55] shadow-[0_30px_60px_-25px_rgba(255,45,85,0.5)] lg:scale-[1.02]"
                  : "bg-white border border-black/[0.06] shadow-[0_8px_28px_-18px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_50px_-22px_rgba(255,45,85,0.3)] hover:border-[#ffd6e0]"
              }`}>
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-white bg-gradient-to-r from-[#ff4f7a] to-[#ff2d55] shadow-[0_8px_20px_-8px_rgba(255,45,85,0.7)]">
                  {t("pricing.popular")}
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <PlatformLogo k={platformKeys[i]} className="w-7 h-7" />
                <div className="text-[18px] font-bold text-neutral-900">{c.name}</div>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <div className="text-[44px] leading-none font-extrabold tracking-tight text-neutral-900 tabular-nums">{c.price}</div>
                <div className="text-[12.5px] text-neutral-500 mb-1.5">{t("pricing.perAccount")}</div>
              </div>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-2 text-[13px] text-neutral-700">
                  <I.Check className="w-4 h-4 text-emerald-500" />
                  <span>{t("pricing.minTopup")} : <span className="font-semibold text-neutral-900">{c.min}</span></span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-neutral-700">
                  <I.Check className="w-4 h-4 text-emerald-500" />
                  <span>{t("pricing.topupFees")} : <span className="font-semibold text-neutral-900">{c.fees}</span></span>
                </li>
                {c.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[13px] text-neutral-700">
                    <I.Check className="w-4 h-4 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/register" className={`mt-6 inline-flex w-full items-center justify-center h-11 rounded-xl text-[14px] font-semibold transition ${
                featured
                  ? "bg-gradient-to-b from-[#ff4f7a] to-[#ff2d55] text-white shadow-[0_12px_24px_-10px_rgba(255,45,85,0.55)] hover:-translate-y-0.5"
                  : i === 0 ? "bg-[#1877f2] text-white hover:bg-[#1668d8]" : "bg-neutral-900 text-white hover:bg-black"
              }`}>{c.cta}</a>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 text-center text-[12px] text-neutral-500 inline-flex w-full items-center justify-center gap-1.5">
        <I.Lock className="w-3.5 h-3.5" /> {t("pricing.pay")}
      </div>
    </section>
  );
}
