import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../src/components/Navbar";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #111827 0%, #162236 55%, #1f2d46 100%)", color: "#eef1f5" },
  main: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 72px" },
  panel: { background: "rgba(24,36,56,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", display: "grid", gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c", margin: 0 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.08, margin: 0 },
  text: { fontSize: 15, lineHeight: 1.8, color: "rgba(238,241,245,0.76)", margin: 0 },
  note: { borderRadius: 16, padding: "14px 16px", fontSize: 14, lineHeight: 1.7, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(238,241,245,0.82)" },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  primary: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 800 },
  secondary: { textDecoration: "none", display: "inline-block", border: "1px solid rgba(255,255,255,0.18)", color: "#eef1f5", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700 },
};

export default function CheckoutCancelPage() {
  const router = useRouter();
  const reference = typeof router.query.reference === "string" ? router.query.reference : "";

  return (
    <div style={styles.shell}>
      <Navbar />
      <main style={styles.main}>
        <section style={styles.panel}>
          <p style={styles.eyebrow}>Stripe return</p>
          <h1 style={styles.title}>Checkout was canceled before payment completed.</h1>
          <p style={styles.text}>
            No membership change has been applied. You can return to pricing or dashboard and restart checkout whenever you are ready.
          </p>
          <div style={styles.note}>Reference: {reference || "Unavailable"}</div>
          <div style={styles.actions}>
            <Link href="/pricing" style={styles.primary}>Back to pricing</Link>
            <Link href="/dashboard" style={styles.secondary}>Open dashboard</Link>
          </div>
        </section>
      </main>
    </div>
  );
}