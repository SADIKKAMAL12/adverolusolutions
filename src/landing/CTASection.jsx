import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I } from "./shared.jsx";

export default function CTASection() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  return (
    <section className="relative py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ff4f7a] to-[#ff2d55] px-8 lg:px-14 py-12 lg:py-14 text-white">
          <motion.div animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(closest-side, #ffffff80, transparent 70%)" }}></motion.div>
          <motion.div animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(closest-side, #ffd6e0, transparent 70%)" }}></motion.div>
          <svg className="absolute right-6 top-6 w-40 h-32 opacity-25" aria-hidden="true">
            <defs><pattern id="dots-cta" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#fff"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-cta)"/>
          </svg>
          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
            <div>
              <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
                className="text-[30px] sm:text-[40px] leading-[1.1] font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
                {t("cta.title")}
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-3 text-[14.5px] text-white/90 leading-[1.6] max-w-xl">{t("cta.sub")}</motion.p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="/#/register" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-[#ff2d55] text-[14px] font-semibold shadow-[0_14px_30px_-12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition">
                {t("cta.btn1")}
                <I.Arrow className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </a>
              <a href="#footer" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-black/20 backdrop-blur text-white text-[14px] font-semibold border border-white/30 hover:bg-black/30 transition">
                <I.Chat className="w-4 h-4" />
                {t("cta.btn2")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
