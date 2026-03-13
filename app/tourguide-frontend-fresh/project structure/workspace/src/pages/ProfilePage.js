import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import useViewport from "../lib/useViewport";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "36px 24px 72px" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 20, alignItems: "center", background: "linear-gradient(135deg, #162235 0%, #253a5a 55%, #34537d 100%)", borderRadius: 28, padding: 28, boxShadow: "0 28px 80px rgba(15,23,42,0.22)", marginBottom: 24 },
  heroIdentity: { display: "flex", gap: 18, alignItems: "center" },
  avatar: { width: 82, height: 82, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flexShrink: 0 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 48px)", lineHeight: 1.05, margin: 0, marginBottom: 10, color: "#f8fafc" },
  text: { fontSize: 15, lineHeight: 1.75, color: "rgba(248,250,252,0.74)", margin: 0 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" },
  buttonGold: { background: "#d4a017", color: "#fff", border: "none", padding: "12px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  buttonGhost: { background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#f8fafc", padding: "11px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: 20 },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 14, color: "#111827" },
  panelText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  infoList: { display: "grid", gap: 14 },
  infoRow: { display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, paddingBottom: 12, borderBottom: "1px solid #f3f4f6" },
  infoLabel: { fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" },
  infoValue: { fontSize: 14, color: "#111827", lineHeight: 1.7 },
  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 },
  pill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 700, color: "#374151" },
  ratePill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.35)", fontSize: 12, fontWeight: 800, color: "#9a6f00" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, marginTop: 18 },
  statCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 700, color: "#6b7280" },
  note: { background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 8, padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "#4b5563", marginTop: 16 },
};

function formatDashboardDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeProfile(data, session) {
  const profile = (data && data.profile) || {};
  const stats = (data && data.stats) || {};
  return {
    name: profile.name || (session && session.name) || "Traveler",
    initials: profile.initials || (session && session.initials) || "TR",
    memberSince: profile.member_since || (session && session.memberSince) || "",
    membership: profile.membership || (session && session.membership) || null,
    consultancyMode: profile.consultancy_mode || "Free & Paid",
    consultationRate: profile.consultation_rate || "Rate not set",
    consultancyBio: profile.consultancy_bio || "No consultancy bio added yet.",
    stats,
  };
}

export default function ProfilePage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);
  const [error, setError] = React.useState("");
  const [profile, setProfile] = React.useState({
    name: "Traveler",
    initials: "TR",
    memberSince: "",
    membership: null,
    consultancyMode: "Free & Paid",
    consultationRate: "Rate not set",
    consultancyBio: "No consultancy bio added yet.",
    stats: { tripsDocumented: 0, countriesVisited: 0, messages: 0, profileViews: 0 },
  });

  React.useEffect(() => {
    let active = true;

    fetchJson("/api/auth/session/")
      .then((sessionData) => {
        if (!active) {
          return null;
        }

        if (!sessionData || !sessionData.authenticated || !sessionData.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/profile"));
          return null;
        }

        const session = writeAuthSession(sessionData.user) || sessionData.user;
        return fetchJson("/api/dashboard/")
          .then((data) => {
            if (active) {
              setProfile(normalizeProfile(data, session));
              setError("");
            }
          })
          .catch((requestError) => {
            if (active) {
              setProfile(normalizeProfile(null, session));
              setError(requestError.message || "Unable to load full profile details.");
            }
          });
      })
      .catch(() => {
        if (active) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/profile"));
        }
      })
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div style={styles.shell}>
        <Navbar activeLabel="Dashboard" />
        <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
          <section style={styles.panel}>
            <h1 style={styles.panelTitle}>Loading profile...</h1>
            <div style={styles.panelText}>Checking your member session and loading your profile details.</div>
          </section>
        </main>
      </div>
    );
  }

  const membershipSummary = profile.membership
    ? [profile.membership.tier, profile.membership.status].filter(Boolean).join(" • ")
    : "Member";
  const stats = [
    { label: "Trips Documented", value: String(profile.stats.tripsDocumented || 0) },
    { label: "Countries Visited", value: String(profile.stats.countriesVisited || 0) },
    { label: "Messages", value: String(profile.stats.messages || 0) },
    { label: "Profile Views", value: String(profile.stats.profileViews || 0) },
  ];

  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={{ ...styles.hero, gridTemplateColumns: isCompact ? "1fr" : styles.hero.gridTemplateColumns, padding: isMobile ? 20 : 28 }}>
          <div style={{ ...styles.heroIdentity, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
            <div style={styles.avatar}>{profile.initials}</div>
            <div>
              <div style={styles.eyebrow}>My Profile</div>
              <h1 style={styles.title}>{profile.name}</h1>
              <p style={styles.text}>{membershipSummary} · Member since {formatDashboardDate(profile.memberSince)}</p>
            </div>
          </div>
          <div style={{ ...styles.heroActions, justifyContent: isCompact ? "flex-start" : "flex-end" }}>
            <Link href="/dashboard" style={styles.buttonGhost}>Back to Dashboard</Link>
            <Link href={`/members?search=${encodeURIComponent(profile.name)}`} style={styles.buttonGold}>Open Public Listing</Link>
          </div>
        </section>

        <section style={{ ...styles.grid, gridTemplateColumns: isCompact ? "1fr" : styles.grid.gridTemplateColumns }}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Profile Overview</h2>
            <div style={styles.infoList}>
              <div style={{ ...styles.infoRow, gridTemplateColumns: isMobile ? "1fr" : styles.infoRow.gridTemplateColumns }}>
                <div style={styles.infoLabel}>Full name</div>
                <div style={styles.infoValue}>{profile.name}</div>
              </div>
              <div style={{ ...styles.infoRow, gridTemplateColumns: isMobile ? "1fr" : styles.infoRow.gridTemplateColumns }}>
                <div style={styles.infoLabel}>Membership</div>
                <div style={styles.infoValue}>{membershipSummary}</div>
              </div>
              <div style={{ ...styles.infoRow, gridTemplateColumns: isMobile ? "1fr" : styles.infoRow.gridTemplateColumns }}>
                <div style={styles.infoLabel}>Member since</div>
                <div style={styles.infoValue}>{formatDashboardDate(profile.memberSince)}</div>
              </div>
            </div>

            <div style={styles.pillRow}>
              <span style={styles.pill}>{profile.consultancyMode}</span>
              <span style={styles.ratePill}>{profile.consultationRate}</span>
            </div>

            <div style={{ ...styles.panelText, marginTop: 16 }}>{profile.consultancyBio}</div>
            {error ? <div style={styles.note}>Profile note: {error}</div> : null}
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Member Activity</h2>
            <div style={styles.statGrid}>
              {stats.map((stat) => (
                <article key={stat.label} style={styles.statCard}>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </article>
              ))}
            </div>

            <div style={styles.note}>
              This page gives the dashboard a direct profile destination. Use the public listing button above when you want to see how your profile appears inside the member directory.
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}