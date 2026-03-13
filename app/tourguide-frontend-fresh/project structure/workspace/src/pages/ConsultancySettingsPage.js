import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import useViewport from "../lib/useViewport";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "36px 24px 72px" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 20, alignItems: "center", background: "linear-gradient(135deg, #162235 0%, #253a5a 55%, #34537d 100%)", borderRadius: 28, padding: 28, boxShadow: "0 28px 80px rgba(15,23,42,0.22)", marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 46px)", lineHeight: 1.05, margin: 0, marginBottom: 10, color: "#f8fafc" },
  text: { fontSize: 15, lineHeight: 1.75, color: "rgba(248,250,252,0.74)", margin: 0 },
  actionRow: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" },
  buttonGold: { background: "#d4a017", color: "#fff", border: "none", padding: "12px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  buttonGhost: { background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#f8fafc", padding: "11px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.9fr)", gap: 20 },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 14, color: "#111827" },
  panelText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  fieldGrid: { display: "grid", gap: 14 },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" },
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111827", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 160, border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111827", background: "#fff", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" },
  formActions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 },
  note: { background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 8, padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "#4b5563", marginTop: 16 },
  infoList: { display: "grid", gap: 14 },
  infoRow: { display: "grid", gap: 8 },
  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0 16px" },
  pill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 700, color: "#374151" },
  ratePill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.35)", fontSize: 12, fontWeight: 800, color: "#9a6f00" },
};

function toDraft(profile) {
  return {
    mode: profile.consultancy_mode || "Free & Paid",
    rate: profile.consultation_rate || "Set your rate",
    bio: profile.consultancy_bio || "Add a short description for the kind of support you offer to travelers.",
  };
}

export default function ConsultancySettingsPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [profile, setProfile] = React.useState({ consultancy_mode: "Free & Paid", consultation_rate: "Rate not set", consultancy_bio: "No consultancy bio added yet." });
  const [draft, setDraft] = React.useState({ mode: "Free & Paid", rate: "Set your rate", bio: "" });

  React.useEffect(() => {
    let active = true;

    fetchJson("/api/auth/session/")
      .then((sessionData) => {
        if (!active) {
          return null;
        }

        if (!sessionData || !sessionData.authenticated || !sessionData.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/consultancy"));
          return null;
        }

        writeAuthSession(sessionData.user);
        return fetchJson("/api/dashboard/")
          .then((data) => {
            if (active) {
              const nextProfile = (data && data.profile) || {};
              setProfile(nextProfile);
              setDraft(toDraft(nextProfile));
              setLoadError("");
            }
          })
          .catch((error) => {
            if (active) {
              const fallbackProfile = {};
              setProfile(fallbackProfile);
              setDraft(toDraft(fallbackProfile));
              setLoadError(error.message || "Unable to load dashboard profile details.");
            }
          });
      })
      .catch(() => {
        if (active) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/consultancy"));
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

  function saveDraft() {
    setSaving(true);
    setSaveMessage("");
    fetchJson("/api/profile/consultancy/", {
      method: "POST",
      body: JSON.stringify({
        consultancy_mode: draft.mode,
        consultation_rate: draft.rate,
        consultancy_bio: draft.bio,
      }),
    })
      .then((response) => {
        const nextProfile = (response && response.profile) || {
          ...profile,
          consultancy_mode: draft.mode,
          consultation_rate: draft.rate,
          consultancy_bio: draft.bio,
        };
        setProfile(nextProfile);
        setDraft(toDraft(nextProfile));
        setLoadError("");
        setSaveMessage("Consultancy settings saved to your account.");
      })
      .catch((error) => {
        setSaveMessage(error.message || "Unable to save consultancy settings.");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function resetDraft() {
    setDraft(toDraft(profile));
    setSaveMessage("Draft reset to the last saved server values.");
  }

  if (checking) {
    return (
      <div style={styles.shell}>
        <Navbar activeLabel="Dashboard" />
        <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
          <section style={styles.panel}>
            <h1 style={styles.panelTitle}>Loading consultancy settings...</h1>
            <div style={styles.panelText}>Checking your session and preparing the consultancy editor.</div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={{ ...styles.hero, gridTemplateColumns: isCompact ? "1fr" : styles.hero.gridTemplateColumns, padding: isMobile ? 20 : 28 }}>
          <div>
            <div style={styles.eyebrow}>Consultancy Settings</div>
            <h1 style={styles.title}>Manage how your consultancy offer appears.</h1>
            <p style={styles.text}>Use this page to keep your consultancy mode, rate, and profile summary in one place. Changes saved here now persist to your account.</p>
          </div>
          <div style={{ ...styles.actionRow, justifyContent: isCompact ? "flex-start" : "flex-end" }}>
            <Link href="/dashboard" style={styles.buttonGhost}>Back to Dashboard</Link>
            <Link href="/profile" style={styles.buttonGold}>Open Profile</Link>
          </div>
        </section>

        <section style={{ ...styles.grid, gridTemplateColumns: isCompact ? "1fr" : styles.grid.gridTemplateColumns }}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Edit Consultancy Details</h2>
            <div style={styles.fieldGrid}>
              <label>
                <div style={styles.label}>Consultancy Mode</div>
                <input style={styles.input} value={draft.mode} onChange={(event) => setDraft((current) => ({ ...current, mode: event.target.value }))} />
              </label>
              <label>
                <div style={styles.label}>Consultation Rate</div>
                <input style={styles.input} value={draft.rate} onChange={(event) => setDraft((current) => ({ ...current, rate: event.target.value }))} />
              </label>
              <label>
                <div style={styles.label}>Consultancy Bio</div>
                <textarea style={styles.textarea} value={draft.bio} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} />
              </label>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.buttonGold} onClick={saveDraft} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" style={{ ...styles.buttonGhost, color: "#374151", border: "1px solid #e5e7eb" }} onClick={resetDraft} disabled={saving}>Reset Draft</button>
            </div>
            {saveMessage ? <div style={styles.note}>{saveMessage}</div> : null}
            {loadError ? <div style={styles.note}>Load note: {loadError}</div> : null}
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Current Preview</h2>
            <div style={styles.panelText}>This preview mirrors the values that the dashboard and profile page will display from your saved account profile.</div>
            <div style={styles.pillRow}>
              <span style={styles.pill}>{draft.mode || "Not set"}</span>
              <span style={styles.ratePill}>{draft.rate || "Rate not set"}</span>
            </div>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <div style={styles.label}>Saved profile summary</div>
                <div style={styles.panelText}>{draft.bio || "No consultancy bio added yet."}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.label}>Last saved value</div>
                <div style={styles.panelText}>{profile.consultancy_bio || "No consultancy bio added yet."}</div>
              </div>
            </div>
            <div style={styles.note}>If you leave this page and come back later, the saved consultancy settings will be loaded from the backend.</div>
          </section>
        </section>
      </main>
    </div>
  );
}