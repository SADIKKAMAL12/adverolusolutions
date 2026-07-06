import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I } from "./shared.jsx";
import SectionHeader from "./SectionHeader.jsx";

export default function Features() {
  const { t } = useTranslation();
  const items = t("features.items", { returnObjects: true });
  const icons = [I.Bolt, I.Shield, I.Lock, I.Headset, I.Check, I.Monitor];
  return (
    <section id="features" className="relative py-20 lg:py-24">
      <SectionHeader kicker={t("features.kicker")} title={t("features.title")} />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
        {items.map((f, i) => {
          const Ic = icons[i];
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative text-center px-3 py-6 rounded-2xl hover:bg-white hover:shadow-[0_18px_40px_-22px_rgba(255,45,85,0.4)] transition-all">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff4f7a] to-[#ff2d55] text-white grid place-items-center shadow-[0_10px_24px_-10px_rgba(255,45,85,0.6)] group-hover:scale-110 transition-transform">
                <Ic className="w-5 h-5" />
              </div>
              <div className="mt-3 text-[13.5px] font-bold text-neutral-900">{f.t}</div>
              <p className="mt-1 text-[11.5px] text-neutral-500 leading-[1.5]">{f.d}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
