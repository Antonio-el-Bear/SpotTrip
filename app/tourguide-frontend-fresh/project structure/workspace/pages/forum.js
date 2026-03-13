import React from "react";
import Link from "next/link";
import Navbar from "../src/components/Navbar";
import useViewport from "../src/lib/useViewport";

const threads = [
  {
    title: "How do you validate a community-based tourism itinerary before booking?",
    author: "Dr. Helena Vasquez",
    replies: 14,
    latest: "Shared a checklist for logistics, local operators, and seasonal risk review.",
  },
  {
    title: "Best way to compare northern lights trips without overpaying?",
    author: "James Worthington",
    replies: 9,
    latest: "Members compared rail-based routes versus package tours and timing windows.",
  },
  {
    title: "Reliable ways to structure food-focused city breaks?",
    author: "Akiko Tanaka",
    replies: 21,
    latest: "Practical advice on neighborhoods, booking windows, and pacing meal-heavy days.",
  },
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)" },
  main: { maxWidth: 1120, margin: "0 auto", padding: "38px 24px 68px" },
  hero: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 22, marginBottom: 28 },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 26, boxShadow: "0 18px 50px rgba(15,23,42,0.06)" },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 40, lineHeight: 1.05, margin: 0, marginBottom: 12, color: "#111827" },
  text: { fontSize: 15, lineHeight: 1.75, color: "#4b5563", margin: 0 },
  ctaRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 },
  primary: { textDecoration: "none", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800 },
  secondary: { textDecoration: "none", border: "1px solid #d1d5db", color: "#374151", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700 },
  statGrid: { display: "grid", gap: 14 },
  statCard: { border: "1px solid rgba(212,160,23,0.18)", background: "rgba(212,160,23,0.06)", borderRadius: 18, padding: 16 },
  statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800, color: "#9a6f00", marginBottom: 8 },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#111827" },
  list: { display: "grid", gap: 16 },
  item: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 22, padding: 22, boxShadow: "0 16px 40px rgba(15,23,42,0.05)" },
  itemTitle: { fontFamily: "'Playfair Display', serif", fontSize: 25, color: "#111827", margin: 0, marginBottom: 10 },
  meta: { fontSize: 13, color: "#6b7280", fontWeight: 700, marginBottom: 12 },
  itemText: { fontSize: 14, lineHeight: 1.7, color: "#4b5563", marginBottom: 14 },
};

export default function ForumPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Members" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={{ ...styles.hero, gridTemplateColumns: isCompact ? "1fr" : styles.hero.gridTemplateColumns }}>
          <div style={styles.panel}>
            <div style={styles.eyebrow}>Discussion Board</div>
            <h1 style={styles.title}>Forum conversations are now reachable from the live app.</h1>
            <p style={styles.text}>
              This first pass restores a real forum destination instead of a 404. It works as a structured discussion hub and directs users into the member directory and trip records that already exist.
            </p>
            <div style={styles.ctaRow}>
              <Link href="/members" style={styles.primary}>Find expert contributors</Link>
              <Link href="/dashboard" style={styles.secondary}>Open your workspace</Link>
            </div>
          </div>
          <div style={styles.statGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Current scope</div>
              <div style={styles.statValue}>Read + navigate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Next enhancement</div>
              <div style={styles.statValue}>Persisted threads</div>
            </div>
          </div>
        </section>

        <section style={styles.list}>
          {threads.map((thread) => (
            <article key={thread.title} style={styles.item}>
              <h2 style={styles.itemTitle}>{thread.title}</h2>
              <div style={styles.meta}>Started by {thread.author} · {thread.replies} replies</div>
              <div style={styles.itemText}>{thread.latest}</div>
              <div style={styles.ctaRow}>
                <Link href="/members" style={styles.secondary}>Open related members</Link>
                <Link href="/leaderboard" style={styles.secondary}>See trending trip records</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}