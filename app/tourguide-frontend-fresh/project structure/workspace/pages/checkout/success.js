import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../src/components/Navbar";
import { fetchJson } from "../../src/lib/api";
import { writeAuthSession } from "../../src/lib/authSession";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 980, margin: "0 auto", padding: "40px 24px 72px" },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 28, boxShadow: "0 28px 80px rgba(15,23,42,0.08)", padding: 32, display: "grid", gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9a6f00", margin: 0 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.08, margin: 0 },
  text: { fontSize: 15, lineHeight: 1.8, color: "#4b5563", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 },
  card: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18, display: "grid", gap: 6 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280" },
  value: { fontSize: 20, fontWeight: 800, color: "#111827" },
  note: { borderRadius: 16, padding: "14px 16px", fontSize: 14, lineHeight: 1.7, background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", color: "#6b7280" },
  success: { background: "#ecfdf3", border: "1px solid #bbf7d0", color: "#166534" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  primary: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 800 },
  secondary: { textDecoration: "none", display: "inline-block", border: "1px solid #d1d5db", color: "#374151", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700 },
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const reference = typeof router.query.reference === "string" ? router.query.reference : "";
  const [checkoutRequest, setCheckoutRequest] = React.useState(null);
  const [membership, setMembership] = React.useState(null);
  const [error, setError] = React.useState("");
  const [polling, setPolling] = React.useState(true);

  React.useEffect(() => {
    if (!router.isReady || !reference) {
      return;
    }

    let active = true;
    let attempts = 0;

    async function loadStatus() {
      attempts += 1;
      try {
        const [statusData, sessionData] = await Promise.all([
          fetchJson("/api/checkout/request/" + encodeURIComponent(reference) + "/"),
          fetchJson("/api/auth/session/"),
        ]);

        if (!active) {
          return;
        }

        if (sessionData && sessionData.authenticated && sessionData.user) {
          writeAuthSession(sessionData.user);
        }

        setCheckoutRequest(statusData.checkoutRequest || null);
        setMembership(statusData.membership || null);
        setError("");

        const isComplete = statusData.checkoutRequest && statusData.checkoutRequest.status === "Paid";
        if (isComplete || attempts >= 10) {
          setPolling(false);
          return;
        }

        window.setTimeout(loadStatus, 2000);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || "Unable to load Stripe checkout status.");
        setPolling(false);
      }
    }

    loadStatus();

    return () => {
      active = false;
    };
  }, [router.isReady, reference]);

  const isPaid = checkoutRequest && checkoutRequest.status === "Paid";

  return (
    <div style={styles.shell}>
      <Navbar />
      <main style={styles.main}>
        <section style={styles.panel}>
          <p style={styles.eyebrow}>Stripe return</p>
          <h1 style={styles.title}>Payment received. We are confirming your tier.</h1>
          <p style={styles.text}>
            Stripe has returned to the app. This page checks the backend record until the webhook marks the checkout as paid and the membership tier is activated.
          </p>

          {!reference ? <div style={{ ...styles.note, ...styles.error }}>Missing checkout reference. Return to pricing and start checkout again.</div> : null}
          {error ? <div style={{ ...styles.note, ...styles.error }}>{error}</div> : null}
          {reference && !error ? (
            <div style={{ ...styles.note, ...(isPaid ? styles.success : null) }}>
              {isPaid
                ? "Payment confirmed and membership updated."
                : polling
                  ? "Waiting for Stripe webhook confirmation. This usually takes a few seconds."
                  : "Stripe returned, but the membership is still waiting for confirmation. You can retry from this page or open the dashboard to check again."}
            </div>
          ) : null}

          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.label}>Reference</div>
              <div style={styles.value}>{reference || "Unavailable"}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.label}>Checkout Status</div>
              <div style={styles.value}>{checkoutRequest ? checkoutRequest.status : (polling ? "Checking..." : "Unavailable")}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.label}>Current Tier</div>
              <div style={styles.value}>{membership ? membership.tier : (polling ? "Refreshing..." : "Unknown")}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.label}>Membership Status</div>
              <div style={styles.value}>{membership ? membership.status : (polling ? "Refreshing..." : "Unknown")}</div>
            </div>
          </div>

          <div style={styles.actions}>
            <Link href="/dashboard" style={styles.primary}>Open dashboard</Link>
            <Link href="/pricing" style={styles.secondary}>Back to pricing</Link>
          </div>
        </section>
      </main>
    </div>
  );
}