import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Platforms from "./Platforms";
import Features from "./Features";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import CTASection from "./CTASection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Platforms />
        <Features />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
