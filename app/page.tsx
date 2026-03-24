"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import AbstractBackground from "@/app/components/AbstractBackground";

export default function LandingPage() {
  const router = useRouter();

  const handleScrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  // Minimal fade-in observer hook
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".fade-up-element");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-on-surface selection:bg-primary/20 selection:text-primary font-body">
      {/* 0. NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-background/80 glass-panel border-b border-outline-variant flex items-center justify-between px-4 md:px-12">
        <div className="text-on-surface hover:text-primary font-bold tracking-[0.2em] text-xl cursor-default select-none transition-colors duration-300 font-headline">
          FORGE
        </div>
        <button
          onClick={() => router.push("/signin")}
          className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold tracking-wide uppercase"
        >
          Sign In
        </button>
      </nav>

      <main className="flex flex-col">
        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 md:px-6 overflow-hidden bg-background">
          {/* Abstract Background positioned absolutely behind content */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70 pointer-events-none">
            <AbstractBackground variant="wave" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-[5rem] font-bold text-on-surface mb-6 uppercase tracking-tight leading-[1.1] font-headline"
              style={{ animation: "fadeInUp 1s ease-out forwards" }}
            >
              TRANSFORM YOUR <span className="text-primary drop-shadow-[0_0_12px_rgba(192,193,255,0.4)]">LIFE.</span>
            </h1>
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-light text-on-surface-variant mb-8 tracking-wide font-headline"
              style={{ animation: "fadeInUp 1s ease-out 0.2s both" }}
            >
              ONE HABIT AT A TIME.
            </h2>
            <p
              className="text-base md:text-xl text-on-surface-variant font-medium max-w-2xl mb-12"
              style={{ animation: "fadeInUp 1s ease-out 0.4s both" }}
            >
              AI-powered 30-day transformation plans tailored to you. Track daily
              habits, build streaks, and become the person you want to be.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
              style={{ animation: "fadeInUp 1s ease-out 0.6s both" }}
            >
              <button
                onClick={() => router.push("/onboarding")}
                className="w-full sm:w-auto px-8 h-14 lit-gradient text-background rounded-full text-[15px] font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(192,193,255,0.3)]"
              >
                Get Started Free
              </button>
              <button
                onClick={handleScrollToHowItWorks}
                className="w-full sm:w-auto px-8 h-14 ghost-border bg-surface-low text-on-surface-variant hover:text-on-surface hover:bg-surface-high hover:border-outline rounded-full text-[15px] font-bold tracking-wide active:scale-[0.98] transition-all duration-300"
              >
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* 2. SOCIAL PROOF STATS */}
        <section className="py-12 border-y border-outline-variant bg-surface glass-panel z-10 relative">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out">
            <div>
              <p className="text-3xl font-bold font-headline text-primary mb-2 drop-shadow-[0_0_8px_rgba(192,193,255,0.3)]">1,000+</p>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                Plans Generated
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-primary mb-2 drop-shadow-[0_0_8px_rgba(192,193,255,0.3)]">95%</p>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                Completion Rate
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-primary mb-2 drop-shadow-[0_0_8px_rgba(192,193,255,0.3)]">30-Day</p>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                Transformation
              </p>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 md:py-32 bg-background z-10 relative">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-5xl font-bold text-center mb-16 tracking-tight fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out font-headline">
              THREE STEPS TO <span className="text-primary italic">TRANSFORMATION</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  icon: "✨",
                  title: "ANSWER QUESTIONS",
                  desc: "Tell us about your goals, fitness level, and lifestyle. Our AI analyzes your profile to create a personalized plan.",
                },
                {
                  num: "02",
                  icon: "📋",
                  title: "GET YOUR PLAN",
                  desc: "Receive a comprehensive 30-day blueprint with workouts, nutrition, grooming, and daily habits tailored to you.",
                },
                {
                  num: "03",
                  icon: "📈",
                  title: "TRACK & TRANSFORM",
                  desc: "Check off daily habits, build streaks, and watch your progress. Consistency compounds into transformation.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group ghost-border bg-surface-low rounded-[24px] p-8 hover:border-outline transition-all duration-500 hover:bg-surface-high shadow-lg fade-up-element opacity-0 translate-y-8 ease-out"
                  style={{ transitionDelay: `${i * 150}ms`, transitionDuration: "1000ms" }}
                >
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-3xl opacity-80 pl-2">{step.icon}</span>
                    <span className="text-6xl font-bold font-headline text-outline-variant group-hover:text-outline transition-colors duration-500">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold font-headline mb-4 tracking-wide text-on-surface">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed text-sm md:text-base">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURES GRID SECTION */}
        <section className="py-24 md:py-32 bg-surface-lowest border-t border-outline-variant z-10 relative">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-5xl font-bold font-headline text-center mb-16 tracking-tight fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out text-on-surface">
              BUILT FOR REAL <span className="text-primary italic">RESULTS</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🤖",
                  title: "AI-Powered Plans",
                  desc: "Personalized 30-day blueprints generated by advanced AI based on your unique profile and goals.",
                },
                {
                  icon: "✅",
                  title: "Daily Habit Tracker",
                  desc: "Track 5 key habits daily. Build streaks, see completion rates, and stay accountable.",
                },
                {
                  icon: "📊",
                  title: "Progress Dashboard",
                  desc: "Real-time metrics showing your streaks, completion rates, and 30-day journey progress.",
                },
                {
                  icon: "➕",
                  title: "Custom Habits",
                  desc: "Add your own habits beyond the AI recommendations. Fully personalized to your routine.",
                },
                {
                  icon: "🗂️",
                  title: "Plan Vault",
                  desc: "Save unlimited plans. Access your history anytime. Track your evolution over time.",
                },
                {
                  icon: "📸",
                  title: "Visual Calibration",
                  desc: "Upload a photo for refined grooming and posture recommendations based on your face shape.",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="group ghost-border bg-surface-low rounded-[20px] p-8 hover:border-outline hover:bg-surface-high transition-all duration-300 shadow-xl fade-up-element opacity-0 translate-y-8 ease-out"
                  style={{ transitionDelay: `${(i % 3) * 100}ms`, transitionDuration: "1000ms" }}
                >
                  <div className="text-3xl mb-6 opacity-90">{feat.icon}</div>
                  <h3 className="text-[17px] font-bold font-headline mb-3 tracking-wide text-on-surface">
                    {feat.title}
                  </h3>
                  <p className="text-on-surface-variant text-[15px] font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. TRUST BUILDER SECTION */}
        <section className="py-24 md:py-32 bg-background border-t border-outline-variant z-10 relative">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-5xl font-bold font-headline mb-16 tracking-tight fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out text-on-surface">
              WHY FORGE <span className="text-primary italic">WORKS</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 sm:gap-8 fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-200">
              {[
                {
                  title: "Personalized",
                  desc: "No generic advice. Every plan is unique to you.",
                },
                {
                  title: "Science-Backed",
                  desc: "Built on proven habit formation psychology.",
                },
                {
                  title: "Zero Fluff",
                  desc: "Clear, actionable steps. No vague motivation.",
                },
                {
                  title: "100% Free",
                  desc: "Start your transformation today. Basic access is free.",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full ghost-border bg-surface-high flex items-center justify-center mb-6 shadow-md">
                    <span className="text-on-surface font-bold text-lg">{i + 1}</span>
                  </div>
                  <h3 className="text-[17px] font-bold font-headline mb-2 text-on-surface">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant font-medium text-sm text-center max-w-[200px]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA SECTION */}
        <section className="py-24 md:py-40 bg-surface-lowest border-t border-outline-variant relative overflow-hidden z-10 flex flex-col items-center justify-center text-center px-6">
          {/* Subtle glow effect behind CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

          <h2 className="text-3xl md:text-6xl font-bold text-on-surface font-headline mb-2 tracking-tight fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out relative z-10">
            STOP WAITING.
          </h2>
          <h2 className="text-3xl md:text-6xl font-bold font-headline text-primary/70 mb-8 tracking-tight fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-100 relative z-10">
            START BUILDING.
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant max-w-xl mx-auto mb-12 font-medium fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-200 relative z-10">
            Your transformation starts today. Create your personalized plan in
            under 5 minutes.
          </p>

          <div className="fade-up-element opacity-0 translate-y-8 transition-all duration-1000 ease-out delay-300 relative z-10">
            <button
              onClick={() => router.push("/onboarding")}
              className="px-10 h-16 lit-gradient text-background rounded-full text-lg font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(192,193,255,0.3)]"
            >
              Get Started — It's Free
            </button>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="py-8 bg-background border-t border-outline-variant z-10 text-[11px] uppercase tracking-[0.15em] font-bold text-on-surface-variant relative">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t-0">
            <p>
              © {new Date().getFullYear()} Forge. Transform through consistency.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `,
      }} />
    </div>
  );
}
