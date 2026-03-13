import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import useViewport from "../lib/useViewport";

const FALLBACK_PLANS = [
  {
    title: "Premium Subscription",
    subtitle: "EUR 35/year",
    description: "Unlock member profiles, detailed itineraries, contact information, travel maps, and private messaging.",
    button: "Subscribe",
    featured: false,
  },
  {
    title: "Priority Listing",
    subtitle: "EUR 35/slot/year",
    description: "Promote trips to the top of results. Each slot covers up to 2 countries and 2 classifications.",
    button: "Get Priority",
    featured: false,
  },
  {
    title: "Both Plans",
    subtitle: "From EUR 100/year",
    description: "Combine premium access with boosted listing placement in a single Stripe checkout.",
    button: "Get Both",
    featured: true,
  },
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #111827 0%, #162236 55%, #1f2d46 100%)", color: "#eef1f5" },
  main: { maxWidth: 1160, margin: "0 auto", padding: "40px 24px 72px" },
  hero: { marginBottom: 30, display: "grid", gap: 14 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.04, margin: 0 },
  text: { fontSize: 15, lineHeight: 1.75, color: "rgba(238,241,245,0.74)", maxWidth: 760 },
  callout: { display: "inline-block", background: "rgba(240,195,92,0.12)", border: "1px solid rgba(240,195,92,0.28)", borderRadius: 999, padding: "9px 14px", fontSize: 12, fontWeight: 700, color: "#f6d98b" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 24 },
  summaryCard: { background: "rgba(24,36,56,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.24)" },
  summaryLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  summaryValue: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f8fafc", marginBottom: 6 },
  summaryText: { fontSize: 13, lineHeight: 1.7, color: "rgba(238,241,245,0.7)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 },
  card: { background: "rgba(24,36,56,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", display: "grid", gap: 14 },
  featured: { background: "rgba(31,45,70,0.98)", border: "1px solid rgba(240,195,92,0.34)", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", display: "grid", gap: 14 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 },
  price: { fontSize: 30, fontWeight: 800, color: "#f6d98b" },
  summary: { fontSize: 14, lineHeight: 1.7, color: "rgba(238,241,245,0.72)" },
  button: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer" },
  subAction: { textDecoration: "none", display: "inline-block", color: "#eef1f5", borderBottom: "1px solid rgba(255,255,255,0.18)", fontSize: 13, fontWeight: 700 },
  notice: { marginTop: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "rgba(238,241,245,0.86)" },
};

function planKeyFromTitle(title) {
  if (!title) {
    return "subscription";
  }
  if (title.indexOf("Priority") !== -1) {
    return "priority";
  }
  if (title.indexOf("Both") !== -1) {
    return "bundle";
  }
  return "subscription";
}

function formatDashboardDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BillingPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);
  const [authUser, setAuthUser] = React.useState(null);
  const [pricingOptions, setPricingOptions] = React.useState(FALLBACK_PLANS);
  const [checkoutRequest, setCheckoutRequest] = React.useState(null);
  const [checkoutError, setCheckoutError] = React.useState("");
  const [submittingPlan, setSubmittingPlan] = React.useState("");
  const selected = typeof router.query.plan === "string" ? router.query.plan.toLowerCase() : "";
  const checkoutState = typeof router.query.checkout === "string" ? router.query.checkout.toLowerCase() : "";
  const checkoutReference = typeof router.query.reference === "string" ? router.query.reference : "";

  React.useEffect(() => {
    let active = true;

    fetchJson("/api/auth/session/")
      .then((data) => {
        if (!active) {
          return null;
        }

        if (!data || !data.authenticated || !data.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/billing"));
          return null;
        }

        const session = writeAuthSession(data.user) || data.user;
        setAuthUser(session);
        return fetchJson("/api/dashboard/")
          .then((dashboardData) => {
            if (active && dashboardData && Array.isArray(dashboardData.pricingOptions) && dashboardData.pricingOptions.length) {
              setPricingOptions(dashboardData.pricingOptions.map((item) => ({
                ...item,
                subtitle: item.subtitle || item.price || "Membership option",
              })));
            }
          })
          .catch(function() {});
      })
      .catch(() => {
        if (active) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/billing"));
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

  function submitCheckout(plan) {
    const planKey = planKeyFromTitle(plan.title || plan.name || "");
    setSubmittingPlan(planKey);
    setCheckoutError("");
    fetchJson("/api/checkout/stripe/session/", {
      method: "POST",
      body: JSON.stringify({
        planKey,
        source: "billing-page",
        notes: "Created from dedicated billing page for Stripe checkout.",
      }),
    })
      .then((data) => {
        setCheckoutRequest(data.checkoutRequest || null);
        if (data && data.checkoutUrl && typeof window !== "undefined") {
          window.location.assign(data.checkoutUrl);
          return;
        }

        setCheckoutError("Stripe checkout started but no redirect URL was returned.");
      })
      .catch((error) => {
        setCheckoutError(error.message || "Unable to create checkout request.");
      })
      .finally(() => {
        setSubmittingPlan("");
      });
  }

  if (checking) {
    return (
      <div style={styles.shell}>
        <Navbar activeLabel="Dashboard" />
        <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
          <section style={styles.notice}>Loading billing details...</section>
        </main>
      </div>
    );
  }

  const membership = authUser && authUser.membership ? authUser.membership : null;
  const membershipSummary = membership ? [membership.tier, membership.status].filter(Boolean).join(" • ") : "Member";
  const priorityRemaining = membership ? Math.max((membership.prioritySlotsTotal || 0) - (membership.prioritySlotsUsed || 0), 0) : 0;

  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Billing and membership</div>
          <h1 style={styles.title}>Manage subscription and priority listing from one page.</h1>
          <p style={styles.text}>This is the dedicated dashboard billing destination for membership access, priority promotion, and Stripe checkout.</p>
          {selected ? <div style={styles.callout}>Requested plan: {selected}</div> : null}
          {checkoutState === "success" ? <div style={styles.callout}>Stripe returned successfully{checkoutReference ? ` for ${checkoutReference}` : ""}.</div> : null}
          {checkoutState === "cancel" ? <div style={styles.callout}>Stripe checkout was canceled{checkoutReference ? ` for ${checkoutReference}` : ""}.</div> : null}
        </section>

        <section style={{ ...styles.summaryGrid, gridTemplateColumns: isCompact ? "1fr" : styles.summaryGrid.gridTemplateColumns }}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Current tier</div>
            <div style={styles.summaryValue}>{membershipSummary}</div>
            <div style={styles.summaryText}>Started {membership ? formatDashboardDate(membership.startedAt) : "Not scheduled"}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Renewal or expiry</div>
            <div style={styles.summaryValue}>{membership ? formatDashboardDate(membership.expiresAt) : "Not scheduled"}</div>
            <div style={styles.summaryText}>This page keeps the pricing flow separate from the dashboard itself.</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Priority slots</div>
            <div style={styles.summaryValue}>{priorityRemaining}</div>
            <div style={styles.summaryText}>Remaining of {membership ? membership.prioritySlotsTotal || 0 : 0} total promoted listing slots.</div>
          </article>
        </section>

        <section style={styles.grid}>
          {pricingOptions.map((plan) => {
            const planKey = planKeyFromTitle(plan.title || plan.name || "");
            const isSelected = selected === planKey;
            const title = plan.title || plan.name;
            const description = plan.description || plan.desc || plan.summary;
            return (
              <article key={title} style={plan.featured ? styles.featured : styles.card}>
                <h2 style={styles.name}>{title}</h2>
                <div style={styles.price}>{plan.subtitle || plan.price || "Membership option"}</div>
                <div style={styles.summary}>{description}</div>
                <button type="button" style={styles.button} onClick={() => submitCheckout(plan)} disabled={submittingPlan === planKey}>
                  {submittingPlan === planKey ? "Opening Stripe checkout..." : (isSelected ? `Continue with ${title}` : (plan.button || "Continue"))}
                </button>
                <Link href="/dashboard" style={styles.subAction}>Return to dashboard</Link>
              </article>
            );
          })}
        </section>

        {checkoutError ? <section style={styles.notice}>Checkout error: {checkoutError}</section> : null}
        {checkoutRequest ? <section style={styles.notice}>Stripe checkout created: {checkoutRequest.reference} · {checkoutRequest.planName} · {checkoutRequest.status}.</section> : null}
      </main>
    </div>
  );
}