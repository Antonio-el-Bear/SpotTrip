import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../src/components/Navbar";
import useViewport from "../src/lib/useViewport";

const DESTINATIONS = [
  {
    name: "Paris, France",
    country: "France",
    theme: "Art and culture",
    summary: "Museum-rich city breaks, river evenings, and neighborhood walking itineraries.",
    highlights: ["Louvre", "Eiffel Tower", "Montmartre"],
    nextStep: "/deals",
  },
  {
    name: "Tokyo, Japan",
    country: "Japan",
    theme: "Urban exploration",
    summary: "High-density city planning with food districts, rail access, and temple routes.",
    highlights: ["Shibuya", "Asakusa", "Tsukiji"],
    nextStep: "/trips/1",
  },
  {
    name: "Cusco, Peru",
    country: "Peru",
    theme: "Altitude and heritage",
    summary: "Gateway to heritage routes, acclimatization planning, and guided trek logistics.",
    highlights: ["Sacred Valley", "Machu Picchu access", "Historic center"],
    nextStep: "/trips/2",
  },
  {
    name: "Bergen, Norway",
    country: "Norway",
    theme: "Nature systems",
    summary: "Fjord access, weather windows, and shoulder-season planning for northern itineraries.",
    highlights: ["Fjord cruise", "Floyen", "Rail connections"],
    nextStep: "/trips/3",
  },
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f5f0e6 0%, #f8fafc 42%, #eef2f7 100%)" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "40px 24px 70px" },
  hero: { background: "linear-gradient(135deg, #18324a 0%, #244865 55%, #355f7d 100%)", color: "#fff", borderRadius: 28, padding: "42px 34px", boxShadow: "0 24px 70px rgba(24,50,74,0.22)", marginBottom: 30 },
  eyebrow: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 800, color: "#f2cd73", marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.03, margin: 0, marginBottom: 14 },
  intro: { fontSize: 16, lineHeight: 1.75, maxWidth: 760, color: "rgba(255,255,255,0.82)", marginBottom: 18 },
  noteRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  pill: { border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 14px", fontSize: 12, fontWeight: 700 },
  controlBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 22 },
  searchTag: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 999, padding: "10px 14px", fontSize: 13, color: "#374151", fontWeight: 700 },
  actionLink: { textDecoration: "none", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 },
  card: { background: "rgba(255,255,255,0.88)", border: "1px solid rgba(24,50,74,0.08)", borderRadius: 22, padding: 22, boxShadow: "0 18px 44px rgba(15,23,42,0.07)", display: "grid", gap: 12 },
  country: { fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9a6f00", fontWeight: 800 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, color: "#142230" },
  theme: { fontSize: 13, fontWeight: 700, color: "#355f7d" },
  text: { fontSize: 14, lineHeight: 1.7, color: "#4b5563", margin: 0 },
  list: { margin: 0, paddingLeft: 18, color: "#374151", fontSize: 14, lineHeight: 1.7 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 6 },
  secondary: { textDecoration: "none", color: "#142230", fontWeight: 800, fontSize: 13, borderBottom: "1px solid rgba(20,34,48,0.2)" },
};

export default function DestinationsPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const rawSearch = typeof router.query.search === "string" ? router.query.search.trim().toLowerCase() : "";
  const visible = DESTINATIONS.filter((item) => {
    if (!rawSearch) {
      return true;
    }

    return [item.name, item.country, item.theme, item.summary, item.highlights.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(rawSearch);
  });

  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Search Trips" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={{ ...styles.hero, padding: isMobile ? "28px 20px" : styles.hero.padding }}>
          <div style={styles.eyebrow}>Destination Index</div>
          <h1 style={styles.title}>Browse destination-ready trip ideas and route them into the right planning flow.</h1>
          <p style={styles.intro}>
            This page gives the homepage search and featured-trip section a real destination target. It is designed as a structured browsing layer rather than a dead placeholder.
          </p>
          <div style={styles.noteRow}>
            <span style={styles.pill}>Searchable destination records</span>
            <span style={styles.pill}>Links into live trips and deals</span>
            <span style={styles.pill}>Ready for backend expansion</span>
          </div>
        </section>

        <div style={styles.controlBar}>
          <div style={styles.searchTag}>{rawSearch ? `Filtered by: ${router.query.search}` : "Showing all destination summaries"}</div>
          <Link href="/deals" style={styles.actionLink}>Open live deals</Link>
        </div>

        <section style={{ ...styles.grid, gridTemplateColumns: isCompact ? "1fr" : styles.grid.gridTemplateColumns }}>
          {visible.map((item) => (
            <article key={item.name} style={styles.card}>
              <div style={styles.country}>{item.country}</div>
              <h2 style={styles.cardTitle}>{item.name}</h2>
              <div style={styles.theme}>{item.theme}</div>
              <p style={styles.text}>{item.summary}</p>
              <ul style={styles.list}>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div style={styles.footer}>
                <Link href={item.nextStep} style={styles.secondary}>Open related workflow</Link>
                <Link href="/aitripbuilder" style={styles.actionLink}>Plan from this idea</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}