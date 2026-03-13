import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { readAuthSession, writeAuthSession } from "../lib/authSession";
import { fetchJson } from "../lib/api";
import useViewport from "../lib/useViewport";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" },
  hero: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "stretch" },
  heroCard: { background: "linear-gradient(135deg, #162235 0%, #253a5a 55%, #34537d 100%)", color: "#f8fafc", borderRadius: 28, padding: "34px 32px", boxShadow: "0 28px 80px rgba(15,23,42,0.22)" },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.04, margin: 0, marginBottom: 14 },
  text: { fontSize: 15, lineHeight: 1.8, color: "rgba(248,250,252,0.78)", margin: 0 },
  pillRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 },
  pill: { border: "1px solid rgba(240,195,92,0.3)", background: "rgba(240,195,92,0.12)", color: "#f6d98b", borderRadius: 999, padding: "9px 13px", fontSize: 12, fontWeight: 700 },
  panel: { background: "rgba(255,255,255,0.92)", border: "1px solid rgba(17,24,39,0.08)", borderRadius: 28, padding: 28, boxShadow: "0 18px 48px rgba(15,23,42,0.08)", display: "grid", gap: 18 },
  tabs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#f3f4f6", borderRadius: 14, padding: 6 },
  tab: { border: "none", borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", background: "transparent", color: "#4b5563" },
  tabActive: { border: "none", borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", background: "#fff", color: "#111827", boxShadow: "0 10px 24px rgba(15,23,42,0.08)" },
  panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 30, margin: 0, color: "#111827" },
  panelText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563", margin: 0 },
  fieldGrid: { display: "grid", gap: 14 },
  field: { display: "grid", gap: 8 },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" },
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 14, padding: "13px 14px", fontSize: 14, color: "#111827", background: "#fff", fontFamily: "inherit" },
  help: { fontSize: 12, color: "#6b7280", lineHeight: 1.6 },
  consentCard: { display: "grid", gap: 12, background: "#fffaf0", border: "1px solid rgba(212,160,23,0.24)", borderRadius: 16, padding: 16 },
  consentTitle: { fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a6f00" },
  consentText: { fontSize: 13, lineHeight: 1.7, color: "#4b5563" },
  consentLinks: { display: "flex", gap: 12, flexWrap: "wrap" },
  consentCheckRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  checkbox: { width: 18, height: 18, marginTop: 2 },
  checkboxLabel: { fontSize: 13, lineHeight: 1.7, color: "#111827" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  primary: { border: "none", borderRadius: 14, background: "#d4a017", color: "#fff", padding: "13px 16px", fontSize: 14, fontWeight: 800, cursor: "pointer" },
  secondaryRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
  link: { color: "#111827", fontSize: 13, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid rgba(17,24,39,0.18)" },
  notice: { borderRadius: 14, padding: "12px 14px", fontSize: 13, lineHeight: 1.7 },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" },
  success: { background: "#ecfdf3", border: "1px solid #bbf7d0", color: "#166534" },
  sessionCard: { background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 16, padding: 16, display: "grid", gap: 8 },
  sessionTitle: { fontSize: 13, fontWeight: 800, color: "#9a6f00", letterSpacing: "0.08em", textTransform: "uppercase" },
  sessionText: { fontSize: 14, color: "#4b5563", lineHeight: 1.7 },
};

function getInitialForm(mode) {
  return {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedLegal: false,
    mode,
  };
}

function validate(mode, form) {
  if (!form.email.trim()) {
    return "Email is required.";
  }
  if (!form.password.trim()) {
    return "Password is required.";
  }
  if (mode === "signup") {
    if (!form.name.trim()) {
      return "Full name is required.";
    }
    if (form.password.length < 8) {
      return "Use at least 8 characters for the password.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords must match.";
    }
    if (!form.acceptedLegal) {
      return "You must read and accept the Terms of Use and Disclaimer before creating an account.";
    }
  }
  return "";
}

function getSafeNextPath(router) {
  var next = typeof router.query.next === "string" ? router.query.next : "";
  if (next && next.charAt(0) === "/") {
    return next;
  }

  return "/dashboard";
}

function buildAuthHref(mode, router) {
  var params = new URLSearchParams();
  if (typeof router.query.plan === "string" && router.query.plan) {
    params.set("plan", router.query.plan);
  }
  if (typeof router.query.next === "string" && router.query.next) {
    params.set("next", router.query.next);
  }

  var query = params.toString();
  return "/" + mode + (query ? "?" + query : "");
}

export default function AuthPage({ initialMode = "login" }) {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const [mode, setMode] = React.useState(initialMode);
  const [form, setForm] = React.useState(getInitialForm(initialMode));
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [existingSession, setExistingSession] = React.useState(null);

  React.useEffect(() => {
    setMode(initialMode);
    setForm(getInitialForm(initialMode));
    setError("");
    setSuccess("");
  }, [initialMode]);

  React.useEffect(() => {
    fetchJson("/api/auth/session/")
      .then((data) => {
        if (data && data.authenticated && data.user) {
          var session = writeAuthSession(data.user);
          setExistingSession(session || data.user);
          if (initialMode === "login" && typeof router.query.next === "string" && router.query.next) {
            router.replace(getSafeNextPath(router));
          }
          return;
        }

        setExistingSession(readAuthSession());
      })
      .catch(() => {
        setExistingSession(readAuthSession());
      });
  }, []);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function switchMode(nextMode) {
    router.push(buildAuthHref(nextMode, router));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate(mode, form);
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup/" : "/api/auth/login/";
      const payload = {
        email: form.email,
        password: form.password,
      };

      if (mode === "signup") {
        payload.name = form.name;
        payload.confirmPassword = form.confirmPassword;
        payload.acceptedLegal = form.acceptedLegal;
      }

      const data = await fetchJson(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const session = writeAuthSession(data.user);
      setExistingSession(session || data.user || null);
      setSuccess(mode === "signup" ? "Account created. Redirecting..." : "Signed in. Redirecting...");

      window.setTimeout(() => {
        router.push(getSafeNextPath(router));
      }, 450);
    } catch (requestError) {
      setError(requestError.message || "Authentication failed.");
      setSaving(false);
      return;
    }
  }

  var selectedPlan = typeof router.query.plan === "string" ? router.query.plan : "";

  return (
    <div style={styles.shell}>
      <Navbar />
      <main style={styles.main}>
        <section style={{ ...styles.hero, gridTemplateColumns: isCompact ? "1fr" : styles.hero.gridTemplateColumns }}>
          <div style={{ ...styles.heroCard, padding: isMobile ? "24px 20px" : styles.heroCard.padding }}>
            <div style={styles.eyebrow}>Member access</div>
            <h1 style={styles.title}>{mode === "signup" ? "Create your TravelRecord account." : "Sign in to your TravelRecord workspace."}</h1>
            <p style={styles.text}>
              Access your dashboard, document trips, manage AI-built itineraries, and move through the member workflow from one place.
            </p>
            <div style={styles.pillRow}>
              <span style={styles.pill}>Dashboard access</span>
              <span style={styles.pill}>Trip documentation</span>
              <span style={styles.pill}>Member workspace</span>
              <span style={styles.pill}>Django session auth</span>
            </div>
          </div>

          <div style={{ ...styles.panel, padding: isMobile ? 20 : 28 }}>
            <div style={styles.tabs}>
              <button type="button" style={mode === "login" ? styles.tabActive : styles.tab} onClick={() => switchMode("login")}>Sign In</button>
              <button type="button" style={mode === "signup" ? styles.tabActive : styles.tab} onClick={() => switchMode("signup")}>Sign Up</button>
            </div>

            <div>
              <h2 style={styles.panelTitle}>{mode === "signup" ? "Create account" : "Welcome back"}</h2>
              <p style={styles.panelText}>
                {mode === "signup"
                  ? "Create a real account in the Django backend, then continue directly into the protected member flow."
                  : "Use your saved account credentials to re-enter the protected member workspace."}
              </p>
            </div>

            {selectedPlan ? <div style={{ ...styles.notice, ...styles.success }}>Selected plan: {selectedPlan}. Finish sign-up first, then continue with pricing.</div> : null}

            {existingSession ? (
              <div style={styles.sessionCard}>
                <div style={styles.sessionTitle}>Existing browser session</div>
                <div style={styles.sessionText}>{existingSession.name} · {existingSession.email}</div>
                {existingSession.membership ? <div style={styles.sessionText}>Tier: {existingSession.membership.tier} · Status: {existingSession.membership.status}</div> : null}
                <Link href="/dashboard" style={styles.link}>Open dashboard</Link>
              </div>
            ) : null}

            {error ? <div style={{ ...styles.notice, ...styles.error }}>{error}</div> : null}
            {success ? <div style={{ ...styles.notice, ...styles.success }}>{success}</div> : null}

            <form style={styles.fieldGrid} onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <label style={styles.field}>
                  <span style={styles.label}>Full name</span>
                  <input style={styles.input} value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Helena Vasquez" />
                </label>
              ) : null}

              <label style={styles.field}>
                <span style={styles.label}>Email</span>
                <input type="email" style={styles.input} value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" />
              </label>

              <div style={mode === "signup" ? { ...styles.row, gridTemplateColumns: isMobile ? "1fr" : styles.row.gridTemplateColumns } : styles.fieldGrid}>
                <label style={styles.field}>
                  <span style={styles.label}>Password</span>
                  <input type="password" style={styles.input} value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Enter password" />
                </label>
                {mode === "signup" ? (
                  <label style={styles.field}>
                    <span style={styles.label}>Confirm password</span>
                    <input type="password" style={styles.input} value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} placeholder="Repeat password" />
                  </label>
                ) : null}
              </div>

              <div style={styles.help}>
                These forms now use Django session auth through the app API proxy. After sign-in or sign-up, protected routes like the dashboard use the server session instead of a frontend-only mock state.
              </div>

              {mode === "signup" ? (
                <div style={styles.consentCard}>
                  <div style={styles.consentTitle}>Before account creation</div>
                  <div style={styles.consentText}>Review the platform terms and disclaimer before creating an account. Signup is blocked until you confirm you have read both pages.</div>
                  <div style={styles.consentLinks}>
                    <Link href="/terms-of-use" style={styles.link} target="_blank" rel="noreferrer">Read Terms of Use</Link>
                    <Link href="/disclaimer" style={styles.link} target="_blank" rel="noreferrer">Read Disclaimer</Link>
                  </div>
                  <label style={styles.consentCheckRow}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={Boolean(form.acceptedLegal)}
                      onChange={(event) => updateField("acceptedLegal", event.target.checked)}
                    />
                    <span style={styles.checkboxLabel}>I have read and understood the Terms of Use and Disclaimer, including that the platform documents travel content, does not guarantee user-generated information, and does not directly sell or guarantee travel services.</span>
                  </label>
                </div>
              ) : null}

              <button type="submit" style={styles.primary} disabled={saving}>{saving ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}</button>
            </form>

            <div style={styles.secondaryRow}>
              <Link href={buildAuthHref(mode === "signup" ? "login" : "signup", router)} style={styles.link}>
                {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </Link>
              <Link href="/pricing?plan=subscription" style={styles.link}>View membership pricing</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
