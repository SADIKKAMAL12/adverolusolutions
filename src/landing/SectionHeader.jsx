import React from "react";
import { motion } from "framer-motion";

export default function SectionHeader({ kicker, title, sub }) {
  return (
    <div className="text-center max-w-3xl mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ffd6e0] text-[12.5px] font-semibold text-[#ff2d55]">
        <span>+</span>{kicker}
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-3 text-[32px] sm:text-[40px] leading-[1.1] font-extrabold tracking-tight text-neutral-900" style={{ textWrap: "balance" }}>
        {title}
      </motion.h2>
      {sub && <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-3 text-[15.5px] text-neutral-600 leading-[1.65]">{sub}</motion.p>}
    </div>
  );
}
