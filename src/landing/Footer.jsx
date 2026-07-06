import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const platforms = t("platforms.cards", { returnObjects: true });
  return (
    <footer id="footer" className="relative bg-[#0b0b0d] text-neutral-300 pt-14 pb-7 mt-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff2d55]/40 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <img src="/assets/logo.png" alt="AdverSolutions" className="h-8 brightness-110" />
          <p className="mt-4 text-[13px] text-neutral-400 leading-[1.6] max-w-xs">{t("footer.tag")}</p>
          <div className="mt-5 flex items-center gap-2">
            {["facebook", "instagram", "telegram", "youtube"].map(s => (
              <a key={s} href="#" className="w-9 h-9 grid place-items-center rounded-full bg-white/5 hover:bg-[#ff2d55] hover:text-white transition border border-white/5">
                <span className="text-[12px] font-bold uppercase">{s[0]}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[13px] font-bold text-white mb-3">{t("footer.navTitle")}</div>
          <ul className="space-y-2 text-[13px]">
            {["home", "platforms", "pricing", "features", "faq"].map(k => (
              <li key={k}><a href={`#${k}`} className="hover:text-[#ff4f7a] transition">{t(`nav.${k}`)}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[13px] font-bold text-white mb-3">{t("footer.platTitle")}</div>
          <ul className="space-y-2 text-[13px]">
            {platforms.map((c, i) => (
              <li key={i}><a href="#platforms" className="hover:text-[#ff4f7a] transition">{c.name}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[13px] font-bold text-white mb-3">{t("footer.contactTitle")}</div>
          <ul className="space-y-2 text-[13px]">
            <li className="text-neutral-400">contact@adversolutions.agency</li>
            <li className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t("footer.live")}
            </li>
            <li className="pt-2 space-y-1.5 text-neutral-500">
              <a href="#" className="block hover:text-[#ff4f7a] transition">{t("footer.terms")}</a>
              <a href="#" className="block hover:text-[#ff4f7a] transition">{t("footer.privacy")}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 pt-5 border-t border-white/5 text-[12px] text-neutral-500 text-center">
        {t("footer.copy")}
      </div>
    </footer>
  );
}
