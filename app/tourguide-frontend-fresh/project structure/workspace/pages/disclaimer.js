import React from "react";
import Link from "next/link";
import Navbar from "../src/components/Navbar";
import { DISCLAIMER_SECTIONS, LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR, WEBSITE_DISCLAIMER } from "../src/lib/legalContent";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 40%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 980, margin: "0 auto", padding: "40px 24px 72px" },
  hero: { background: "linear-gradient(135deg, #4a2800 0%, #8a5b00 52%, #d4a017 100%)", color: "#fffaf0", borderRadius: 28, padding: "34px 32px", boxShadow: "0 28px 80px rgba(74,40,0,0.18)", marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff0bf", marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, margin: 0, marginBottom: 14 },
  intro: { fontSize: 15, lineHeight: 1.8, color: "rgba(255,250,240,0.9)", margin: 0 },
  meta: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 },
  metaPill: { border: "1px solid rgba(255,240,191,0.32)", background: "rgba(255,240,191,0.14)", color: "#fff7de", borderRadius: 999, padding: "9px 13px", fontSize: 12, fontWeight: 700 },
  card: { background: "rgba(255,255,255,0.94)", border: "1px solid rgba(17,24,39,0.08)", borderRadius: 24, padding: 26, boxShadow: "0 18px 48px rgba(15,23,42,0.08)" },
  section: { paddingBottom: 22, marginBottom: 22, borderBottom: "1px solid rgba(17,24,39,0.08)" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, marginBottom: 12 },
  paragraph: { fontSize: 15, lineHeight: 1.8, color: "#374151", margin: "0 0 10px" },
  notice: { marginTop: 24, background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 18, padding: 18, fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  actionRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 },
  linkButton: { display: "inline-block", textDecoration: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 800, background: "#d4a017", color: "#fff" },
  secondaryLink: { display: "inline-block", textDecoration: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, border: "1px solid #d1d5db", color: "#111827", background: "#fff" },
};

export default function DisclaimerPage() {
  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Disclaimer" />
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Legal</div>
          <h1 style={styles.title}>Platform Disclaimer</h1>
          <p style={styles.intro}>This page summarizes the liability, external-link, booking, and travel-risk disclaimers from the legal documents supplied for the platform.</p>
          <div style={styles.meta}>
            <span style={styles.metaPill}>Effective: {LEGAL_EFFECTIVE_DATE}</span>
            <span style={styles.metaPill}>Operator: {LEGAL_OPERATOR}</span>
          </div>
        </section>

        <section style={styles.card}>
          {DISCLAIMER_SECTIONS.map((section) => (
            <section key={section.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={styles.paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div style={styles.notice}>{WEBSITE_DISCLAIMER}</div>

          <div style={styles.actionRow}>
            <Link href="/terms-of-use" style={styles.linkButton}>Read terms of use</Link>
            <Link href="/signup" style={styles.secondaryLink}>Return to sign up</Link>
          </div>
        </section>
      </main>
    </div>
  );
}