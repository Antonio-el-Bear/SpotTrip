import React from "react";
import Link from "next/link";
import Navbar from "../src/components/Navbar";
import useViewport from "../src/lib/useViewport";

const SECTIONS = [
  {
    title: "Structured travel knowledge",
    body: "TravelRecord is designed as a decision-oriented archive of real trips. The goal is not social posting, but a cleaner way to store, compare, and reuse practical travel knowledge.",
  },
  {
    title: "Experienced member directory",
    body: "Members can discover documented trips, compare experienced authors, and evaluate credibility using trip volume, specializations, and subscriber-only star breakdown signals.",
  },
  {
    title: "Planning support and consultancy",
    body: "Where members enable consultancy, TravelRecord helps surface that expertise. The platform presents profiles and connection paths, while any consultancy arrangement remains between the author and the client.",
  },
  {
    title: "AI-assisted trip building",
    body: "Premium members can also use the AI Trip Builder to generate comparable itineraries, select a preferred option, and keep the result in their dashboard archive.",
  },
];

const PRINCIPLES = [
  "Clear trip records instead of unstructured travel posts",
  "Search and comparison across destinations, classifications, and authors",
  "Member credibility based on documented activity, not follower counts",
  "A platform role limited to discovery, presentation, and contact facilitation",
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f6f1e7 0%, #f8fafc 45%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "44px 24px 80px" },
  hero: { display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "stretch", marginBottom: 28 },
  heroCard: { background: "linear-gradient(135deg, #162235 0%, #223453 55%, #314b76 100%)", color: "#f8fafc", borderRadius: 28, padding: "34px 32px", boxShadow: "0 28px 80px rgba(15,23,42,0.22)" },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.04, margin: 0, marginBottom: 14 },
  text: { fontSize: 15, lineHeight: 1.8, color: "rgba(248,250,252,0.78)", margin: 0 },
  heroPills: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 },
  pill: { border: "1px solid rgba(240,195,92,0.3)", background: "rgba(240,195,92,0.12)", color: "#f6d98b", borderRadius: 999, padding: "9px 13px", fontSize: 12, fontWeight: 700 },
  aside: { background: "rgba(255,255,255,0.86)", border: "1px solid rgba(17,24,39,0.08)", borderRadius: 28, padding: 28, boxShadow: "0 18px 48px rgba(15,23,42,0.08)", display: "grid", gap: 16 },
  asideTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, lineHeight: 1.12, margin: 0, color: "#111827" },
  asideText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563", margin: 0 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  statCard: { background: "#fff", borderRadius: 18, border: "1px solid rgba(17,24,39,0.08)", padding: 16 },
  statValue: { fontSize: 24, fontWeight: 800, color: "#b8860b", marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em" },
  sectionGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18, marginBottom: 28 },
  sectionCard: { background: "rgba(255,255,255,0.9)", borderRadius: 24, border: "1px solid rgba(17,24,39,0.08)", padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.06)" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, marginBottom: 10, color: "#111827" },
  sectionText: { fontSize: 14, lineHeight: 1.8, color: "#4b5563", margin: 0 },
  principleWrap: { background: "#111827", color: "#f8fafc", borderRadius: 28, padding: "30px 28px", boxShadow: "0 24px 70px rgba(15,23,42,0.18)", marginBottom: 28 },
  principleTitle: { fontFamily: "'Playfair Display', serif", fontSize: 30, margin: 0, marginBottom: 16 },
  principleList: { margin: 0, paddingLeft: 20, display: "grid", gap: 10, fontSize: 14, lineHeight: 1.8, color: "rgba(248,250,252,0.82)" },
  cta: { background: "linear-gradient(135deg, rgba(212,160,23,0.16), rgba(17,24,39,0.04))", border: "1px solid rgba(212,160,23,0.24)", borderRadius: 24, padding: "26px 24px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" },
  ctaTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, marginBottom: 8, color: "#111827" },
  ctaText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563", margin: 0, maxWidth: 640 },
  ctaActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  primary: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800 },
  secondary: { textDecoration: "none", display: "inline-block", background: "#fff", color: "#111827", border: "1px solid rgba(17,24,39,0.14)", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800 },
};

export default function AboutPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  return (
    <div style={styles.shell}>
      <Navbar activeLabel="About" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={{ ...styles.hero, gridTemplateColumns: isCompact ? "1fr" : styles.hero.gridTemplateColumns }}>
          <div style={{ ...styles.heroCard, padding: isMobile ? "24px 20px" : styles.heroCard.padding }}>
            <div style={styles.eyebrow}>About TravelRecord</div>
            <h1 style={styles.title}>A structured platform for serious travel documentation.</h1>
            <p style={styles.text}>
              TravelRecord brings together trip records, expert member profiles, and planning tools in one place so travelers can make better decisions from documented experience instead of scattered inspiration.
            </p>
            <div style={styles.heroPills}>
              <span style={styles.pill}>Trip archive</span>
              <span style={styles.pill}>Member expertise</span>
              <span style={styles.pill}>Subscriber insights</span>
              <span style={styles.pill}>AI planning support</span>
            </div>
          </div>

          <aside style={{ ...styles.aside, padding: isMobile ? 20 : 28 }}>
            <h2 style={styles.asideTitle}>What the platform is built to do</h2>
            <p style={styles.asideText}>
              The product is designed around documented trips, practical retrieval, and clear credibility signals. It is intentionally closer to a research workspace than a social feed.
            </p>
            <div style={styles.statGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Trips</div>
                <div style={styles.statLabel}>Structured records</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Members</div>
                <div style={styles.statLabel}>Experienced authors</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Stars</div>
                <div style={styles.statLabel}>Subscriber credibility view</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>AI</div>
                <div style={styles.statLabel}>Trip option builder</div>
              </div>
            </div>
          </aside>
        </section>

        <section style={{ ...styles.sectionGrid, gridTemplateColumns: isCompact ? "1fr" : styles.sectionGrid.gridTemplateColumns }}>
          {SECTIONS.map((section) => (
            <article key={section.title} style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <p style={styles.sectionText}>{section.body}</p>
            </article>
          ))}
        </section>

        <section style={styles.principleWrap}>
          <h2 style={styles.principleTitle}>Core principles</h2>
          <ul style={styles.principleList}>
            {PRINCIPLES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ ...styles.cta, flexDirection: isCompact ? "column" : "row", alignItems: isCompact ? "flex-start" : "center" }}>
          <div>
            <h2 style={styles.ctaTitle}>Explore the live product flow</h2>
            <p style={styles.ctaText}>
              You can browse documented trips, inspect the member directory, or open the AI Trip Builder directly from the public site.
            </p>
          </div>
          <div style={styles.ctaActions}>
            <Link href="/members" style={styles.primary}>Browse members</Link>
            <Link href="/aitripbuilder" style={styles.secondary}>Open AI Trip Builder</Link>
          </div>
        </section>
      </main>
    </div>
  );
}