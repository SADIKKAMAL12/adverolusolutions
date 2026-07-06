import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { I } from "./shared.jsx";
import SectionHeader from "./SectionHeader.jsx";

function FAQItem({ q, a, open, onClick }) {
  return (
    <div className={`rounded-2xl border transition-all ${open ? "border-[#ffd6e0] bg-white shadow-[0_18px_40px_-22px_rgba(255,45,85,0.3)]" : "border-black/[0.06] bg-white hover:border-[#ffd6e0]"}`}>
      <button onClick={onClick} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start">
        <span className="text-[14.5px] font-semibold text-neutral-900">{q}</span>
        <span className={`shrink-0 w-7 h-7 grid place-items-center rounded-full transition ${open ? "bg-[#ff2d55] text-white rotate-45" : "bg-[#fff5f7] text-[#ff2d55]"}`}>
          <I.Plus2 className="w-3.5 h-3.5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-4 text-[13.5px] text-neutral-600 leading-[1.65]">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(0);
  const items = t("faq.items", { returnObjects: true });
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);
  return (
    <section id="faq" className="relative py-20 lg:py-24">
      <SectionHeader kicker={t("faq.kicker")} title={t("faq.title")} sub={t("faq.sub")} />
      <div className="max-w-5xl mx-auto px-5 lg:px-8 mt-10 grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {left.map((it, idx) => {
            const i = idx * 2;
            return <FAQItem key={i} q={it.q} a={it.a} open={open === i} onClick={() => setOpen(open === i ? -1 : i)} />;
          })}
        </div>
        <div className="flex flex-col gap-3">
          {right.map((it, idx) => {
            const i = idx * 2 + 1;
            return <FAQItem key={i} q={it.q} a={it.a} open={open === i} onClick={() => setOpen(open === i ? -1 : i)} />;
          })}
        </div>
      </div>
    </section>
  );
}
