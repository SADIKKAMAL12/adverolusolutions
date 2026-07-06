import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I, PlatformLogo, PLATFORM_KEYS } from "./shared.jsx";
import SectionHeader from "./SectionHeader.jsx";

export default function Platforms() {
  const { t } = useTranslation();
  const cards = t("platforms.cards", { returnObjects: true });
  return (
    <section id="platforms" className="relative py-20 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#fffafb] to-white"></div>
      <SectionHeader kicker={t("platforms.kicker")} title={t("platforms.title")} sub={t("platforms.sub")} />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {cards.map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="group relative bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_4px_18px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_24px_50px_-22px_rgba(255,45,85,0.35)] hover:border-[#ffd6e0] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#fafafa] grid place-items-center mb-4">
              <PlatformLogo k={PLATFORM_KEYS[i]} className="w-7 h-7" />
            </div>
            <div className="text-[16.5px] font-bold text-neutral-900">{c.name}</div>
            <p className="mt-1.5 text-[13px] text-neutral-600 leading-[1.55]">{c.desc}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {t("platforms.available")}
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#ff2d55] bg-[#fff0f4] border border-[#ffd6e0] px-2 py-0.5 rounded-full">
                <I.Check className="w-3 h-3" />
                {t("platforms.verified")}
              </span>
            </div>
            <a href="#pricing" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#ff2d55] group-hover:gap-2 transition-all">
              {t("platforms.learnMore")}
              <I.Arrow className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
