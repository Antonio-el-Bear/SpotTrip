import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../src/components/Navbar";
import { writeAuthSession } from "../src/lib/authSession";
import { fetchJson } from "../src/lib/api";
import useViewport from "../src/lib/useViewport";

const PLANS = [
  {
    key: "subscription",
    name: "Premium Membership",
    price: "€35/year",
    summary: "Access member profiles, detailed itineraries, maps, and private contact paths.",
    features: ["Member directory access", "Detailed trip records", "Private planning workspace"],
  },
  {
    key: "priority",
    name: "Priority Listing",
    price: "€35/slot/year",
    summary: "Boost your documented trips higher in search and visibility flows.",
    features: ["Search visibility boost", "Country/classification targeting", "More consultancy discovery"],
  },
  {
    key: "bundle",
    name: "Subscribe + Boost",
    price: "From €70/year",
    summary: "Combine access and promotion in one checkout intent.",
    features: ["Membership benefits", "Priority placement", "Single request flow"],
  },
];

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #111827 0%, #162236 55%, #1f2d46 100%)", color: "#eef1f5" },
  main: { maxWidth: 1160, margin: "0 auto", padding: "40px 24px 72px" },
  hero: { marginBottom: 30 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.04, margin: 0, marginBottom: 14 },
  text: { fontSize: 15, lineHeight: 1.75, color: "rgba(238,241,245,0.74)", maxWidth: 760 },
  callout: { marginTop: 16, display: "inline-block", background: "rgba(240,195,92,0.12)", border: "1px solid rgba(240,195,92,0.28)", borderRadius: 999, padding: "9px 14px", fontSize: 12, fontWeight: 700, color: "#f6d98b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 },
  card: { background: "rgba(24,36,56,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", display: "grid", gap: 14 },
  featured: { background: "rgba(31,45,70,0.98)", border: "1px solid rgba(240,195,92,0.34)", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.24)", display: "grid", gap: 14 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 },
  price: { fontSize: 30, fontWeight: 800, color: "#f6d98b" },
  summary: { fontSize: 14, lineHeight: 1.7, color: "rgba(238,241,245,0.72)" },
  list: { margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "rgba(238,241,245,0.78)" },
  button: { textDecoration: "none", display: "inline-block", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer" },
  subAction: { textDecoration: "none", display: "inline-block", color: "#eef1f5", borderBottom: "1px solid rgba(255,255,255,0.18)", fontSize: 13, fontWeight: 700 },
  notice: { marginTop: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "rgba(238,241,245,0.86)" },
};

function buildSignupHref(planKey) {
  const next = `/pricing?plan=${encodeURIComponent(planKey)}&from=signup`;
  return `/signup?plan=${encodeURIComponent(planKey)}&next=${encodeURIComponent(next)}`;
}

export default function PricingPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const router = useRouter();
  const selected = typeof router.query.plan === "string" ? router.query.plan.toLowerCase() : "";
  const fromSignup = router.query.from === "signup";
  const checkoutState = typeof router.query.checkout === "string" ? router.query.checkout.toLowerCase() : "";
  const checkoutReference = typeof router.query.reference === "string" ? router.query.reference : "";
  const [authUser, setAuthUser] = React.useState(null);
  const [checkoutRequest, setCheckoutRequest] = React.useState(null);
  const [checkoutError, setCheckoutError] = React.useState("");
  const [submittingPlan, setSubmittingPlan] = React.useState("");

  React.useEffect(() => {
    let active = true;

    fetchJson("/api/auth/session/")
      .then((data) => {
        if (!active || !data || !data.authenticated || !data.user) {
          return;
        }

        setAuthUser(writeAuthSession(data.user) || data.user);
      })
      .catch(function() {});

    return () => {
      active = false;
    };
  }, []);

  function submitCheckout(plan) {
    if (!authUser) {
      router.push(buildSignupHref(plan.key));
      return;
    }

    setSubmittingPlan(plan.key);
    setCheckoutError("");
    fetchJson("/api/checkout/stripe/session/", {
      method: "POST",
      body: JSON.stringify({
        planKey: plan.key,
        source: "pricing-page",
        notes: "Created from pricing page for Stripe checkout.",
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

  return (
    <div style={styles.shell}>
      <Navbar />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Pricing and access</div>
          <h1 style={styles.title}>The pricing flow now has a live destination instead of dead buttons.</h1>
          <p style={styles.text}>
            This page now sends authenticated users into Stripe Checkout and upgrades their membership automatically after Stripe confirms payment to the backend webhook.
          </p>
          {selected ? <div style={styles.callout}>Requested plan: {router.query.plan}</div> : null}
          {fromSignup ? <div style={{ ...styles.callout, marginLeft: 12 }}>Account ready. Continue with your selected plan.</div> : null}
          {checkoutState === "success" ? <div style={{ ...styles.callout, marginLeft: 12 }}>Stripe returned successfully{checkoutReference ? ` for ${checkoutReference}` : ""}. Your dashboard tier will refresh after webhook confirmation.</div> : null}
          {checkoutState === "cancel" ? <div style={{ ...styles.callout, marginLeft: 12 }}>Stripe checkout was canceled{checkoutReference ? ` for ${checkoutReference}` : ""}.</div> : null}
        </section>

        <section style={styles.grid}>
          {PLANS.map((plan) => (
            <article key={plan.key} style={plan.key === "bundle" ? styles.featured : styles.card}>
              <h2 style={styles.name}>{plan.name}</h2>
              <div style={styles.price}>{plan.price}</div>
              <div style={styles.summary}>{plan.summary}</div>
              <ul style={styles.list}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button type="button" style={styles.button} onClick={() => submitCheckout(plan)} disabled={submittingPlan === plan.key}>
                {authUser ? (submittingPlan === plan.key ? "Opening Stripe checkout..." : "Pay with Stripe") : "Create account to continue"}
              </button>
              <Link href={authUser ? "/dashboard" : buildSignupHref(plan.key)} style={styles.subAction}>
                {authUser ? "Review from dashboard" : "Start with sign up"}
              </Link>
            </article>
          ))}
        </section>

        {checkoutError ? <section style={styles.notice}>Checkout error: {checkoutError}</section> : null}
        {checkoutRequest ? (
          <section style={styles.notice}>
            Stripe checkout created: {checkoutRequest.reference} · {checkoutRequest.planName} · {checkoutRequest.status}. This payment session is linked to the backend membership workflow and will auto-activate the correct tier after Stripe confirms payment.
          </section>
        ) : null}
      </main>
    </div>
  );
}