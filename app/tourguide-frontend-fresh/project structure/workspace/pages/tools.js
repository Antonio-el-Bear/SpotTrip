import React from "react";
import Link from "next/link";
import Navbar from "../src/components/Navbar";
import useViewport from "../src/lib/useViewport";

const tools = [
  { title: "Travel diary", summary: "Keep planning notes, route ideas, and consultant follow-up items in one place.", link: "/dashboard" },
  { title: "Live deals", summary: "Compare active flight, attraction, and tours feeds where provider configuration is available.", link: "/deals" },
  { title: "AI trip builder", summary: "Generate and save a structured itinerary directly into your private trip archive.", link: "/aitripbuilder" },
  { title: "Expert directory", summary: "Find members and contributors aligned to geography or trip classification.", link: "/members" },
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)" },
  main: { maxWidth: 1080, margin: "0 auto", padding: "38px 24px 68px" },
  hero: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 28, boxShadow: "0 18px 50px rgba(15,23,42,0.06)", marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, margin: 0, marginBottom: 12, color: "#111827" },
  text: { fontSize: 15, lineHeight: 1.75, color: "#4b5563", maxWidth: 760 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 22, boxShadow: "0 16px 40px rgba(15,23,42,0.05)", display: "grid", gap: 12 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#111827", margin: 0 },
  summary: { fontSize: 14, lineHeight: 1.7, color: "#4b5563" },
  link: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800 },
};

export default function ToolsPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Travel workspace tools</div>
          <h1 style={styles.title}>Travel tools now have a live route in the active app.</h1>
          <p style={styles.text}>
            This page closes the gap between destination browsing, planning support, AI generation, and member expertise by exposing the working toolchain from one place.
          </p>
        </section>

        <section style={styles.grid}>
          {tools.map((tool) => (
            <article key={tool.title} style={styles.card}>
              <h2 style={styles.cardTitle}>{tool.title}</h2>
              <div style={styles.summary}>{tool.summary}</div>
              <Link href={tool.link} style={styles.link}>Open tool</Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}