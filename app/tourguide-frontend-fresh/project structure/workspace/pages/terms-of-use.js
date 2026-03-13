import React from "react";
import Link from "next/link";
import Navbar from "../src/components/Navbar";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR, TERMS_SECTIONS, WEBSITE_DISCLAIMER } from "../src/lib/legalContent";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 40%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 980, margin: "0 auto", padding: "40px 24px 72px" },
  hero: { background: "linear-gradient(135deg, #162235 0%, #253a5a 55%, #34537d 100%)", color: "#f8fafc", borderRadius: 28, padding: "34px 32px", boxShadow: "0 28px 80px rgba(15,23,42,0.22)", marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, margin: 0, marginBottom: 14 },
  intro: { fontSize: 15, lineHeight: 1.8, color: "rgba(248,250,252,0.78)", margin: 0 },
  meta: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 },
  metaPill: { border: "1px solid rgba(240,195,92,0.3)", background: "rgba(240,195,92,0.12)", color: "#f6d98b", borderRadius: 999, padding: "9px 13px", fontSize: 12, fontWeight: 700 },
  card: { background: "rgba(255,255,255,0.94)", border: "1px solid rgba(17,24,39,0.08)", borderRadius: 24, padding: 26, boxShadow: "0 18px 48px rgba(15,23,42,0.08)" },
  section: { paddingBottom: 22, marginBottom: 22, borderBottom: "1px solid rgba(17,24,39,0.08)" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, marginBottom: 12 },
  paragraph: { fontSize: 15, lineHeight: 1.8, color: "#374151", margin: "0 0 10px" },
  notice: { marginTop: 24, background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 18, padding: 18, fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  actionRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 },
  linkButton: { display: "inline-block", textDecoration: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 800, background: "#d4a017", color: "#fff" },
  secondaryLink: { display: "inline-block", textDecoration: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, border: "1px solid #d1d5db", color: "#111827", background: "#fff" },
};

export default function TermsOfUsePage() {
  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Terms" />
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Legal</div>
          <h1 style={styles.title}>Platform Terms of Use</h1>
          <p style={styles.intro}>These terms apply to use of the platform and summarize the obligations, restrictions, and liability limits set out in the source terms provided for the ListedTours website and services.</p>
          <div style={styles.meta}>
            <span style={styles.metaPill}>Effective: {LEGAL_EFFECTIVE_DATE}</span>
            <span style={styles.metaPill}>Operator: {LEGAL_OPERATOR}</span>
          </div>
        </section>

        <section style={styles.card}>
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} style={styles.paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div style={styles.notice}>{WEBSITE_DISCLAIMER}</div>

          <div style={styles.actionRow}>
            <Link href="/disclaimer" style={styles.linkButton}>Read disclaimer</Link>
            <Link href="/signup" style={styles.secondaryLink}>Return to sign up</Link>
          </div>
        </section>
      </main>
    </div>
  );
}