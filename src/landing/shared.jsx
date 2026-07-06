import React from "react";

export const PLATFORM_LOGOS = {
  meta: "/assets/meta.png",
  google: "/assets/google.webp",
  tiktok: "/assets/tiktok.png",
  snapchat: "/assets/snapchat.png",
  bing: "/assets/bing.png"
};
export const PLATFORM_KEYS = ["meta", "google", "tiktok", "snapchat", "bing"];

export function PlatformLogo({ k, className = "w-8 h-8" }) {
  return <img src={PLATFORM_LOGOS[k]} alt={k} className={`${className} object-contain`} draggable="false" />;
}

export const I = {
  Bolt: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>,
  Shield: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" fill="currentColor"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Lock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2"/></svg>,
  Headset: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12a8 8 0 1116 0v5a3 3 0 01-3 3h-2v-7h5M4 12v5a3 3 0 003 3h2v-7H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Monitor: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="4" width="18" height="13" rx="2" fill="currentColor"/><path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>,
  Arrow: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Card: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="6" width="18" height="13" rx="2" fill="#fde7ee"/><rect x="3" y="9" width="18" height="3" fill="#ff2d55"/><rect x="6" y="15" width="5" height="2" rx="1" fill="#ff2d55"/></svg>,
  Chat: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 5h16v11H8l-4 4V5z" fill="currentColor"/></svg>,
  Globe: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.6"/></svg>,
  Caret: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus2: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
};
