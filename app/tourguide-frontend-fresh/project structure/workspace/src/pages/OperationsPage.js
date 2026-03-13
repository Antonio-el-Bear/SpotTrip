import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import { fetchJson } from "../lib/api";
import useViewport from "../lib/useViewport";

const styles = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "38px 24px 72px" },
  hero: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 26, padding: 28, boxShadow: "0 18px 50px rgba(15,23,42,0.06)", marginBottom: 24, display: "grid", gap: 10 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", margin: 0 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, margin: 0, color: "#111827" },
  text: { fontSize: 15, lineHeight: 1.75, color: "#4b5563", maxWidth: 860, margin: 0 },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 },
  statCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18, boxShadow: "0 16px 40px rgba(15,23,42,0.05)" },
  statValue: { fontSize: 32, fontWeight: 800, color: "#111827" },
  statLabel: { fontSize: 12, color: "#6b7280", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
  section: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 24, boxShadow: "0 16px 40px rgba(15,23,42,0.05)", marginBottom: 22 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#111827", margin: 0, marginBottom: 16 },
  list: { display: "grid", gap: 14 },
  card: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18, display: "grid", gap: 10 },
  row: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
  titleRow: { fontSize: 20, fontWeight: 800, color: "#111827" },
  meta: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { display: "inline-block", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#4b5563" },
  body: { fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  buttonRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  primary: { border: "none", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" },
  secondary: { textDecoration: "none", display: "inline-block", border: "1px solid #d1d5db", color: "#374151", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 700 },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 14, padding: "12px 14px", fontSize: 13, marginBottom: 18 },
  empty: { fontSize: 14, color: "#6b7280", lineHeight: 1.7 },
  engagementGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 },
  routeList: { display: "grid", gap: 12, marginBottom: 16 },
  routeCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, display: "grid", gap: 8 },
  routeTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  miniTitle: { margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" },
  timestamp: { fontSize: 12, color: "#6b7280", fontWeight: 600 },
  recentList: { display: "grid", gap: 12 },
  recentItem: { display: "grid", gap: 6, padding: 14, borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff" },
  refreshButton: { border: "1px solid #d1d5db", background: "#fff", color: "#374151", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};

function formatDateTime(value) {
  if (!value) {
    return "Just now";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function OperationsPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [authorized, setAuthorized] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [overview, setOverview] = React.useState({
    stats: null,
    checkoutRequests: [],
    memberships: [],
    billingEvents: [],
    engagement: { activeUsersLastFiveMinutes: 0, eventsLastHour: 0, liveRoutes: [], recentActivity: [] },
  });
  const [activatingReference, setActivatingReference] = React.useState("");

  const loadOverview = React.useCallback(function() {
    return fetchJson("/api/operations/overview/")
      .then(function(data) {
        setOverview(data);
      })
      .catch(function(requestError) {
        setError(requestError.message || "Unable to load operations overview.");
      });
  }, []);

  React.useEffect(() => {
    let active = true;

    fetchJson("/api/auth/session/")
      .then(function(sessionData) {
        if (!active) {
          return null;
        }

        if (!sessionData || !sessionData.authenticated || !sessionData.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/operations"));
          return null;
        }

        var session = writeAuthSession(sessionData.user) || sessionData.user;
        if (!session.canManageOperations) {
          router.replace("/dashboard");
          return null;
        }

        setAuthorized(true);
        return fetchJson("/api/operations/overview/");
      })
      .then(function(data) {
        if (!active || !data) {
          return;
        }

        setOverview(data);
      })
      .catch(function(requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || "Unable to load operations overview.");
      })
      .finally(function() {
        if (active) {
          setLoading(false);
        }
      });

    return function() {
      active = false;
    };
  }, [router]);

  React.useEffect(function() {
    if (!authorized) {
      return undefined;
    }

    var intervalId = window.setInterval(function() {
      loadOverview();
    }, 30000);

    return function cleanup() {
      window.clearInterval(intervalId);
    };
  }, [authorized, loadOverview]);

  function refreshOverview() {
    setRefreshing(true);
    setError("");
    loadOverview().finally(function() {
      setRefreshing(false);
    });
  }

  function activateCheckout(reference) {
    if (!reference || activatingReference) {
      return;
    }

    setActivatingReference(reference);
    setError("");
    fetchJson("/api/operations/checkout/" + encodeURIComponent(reference) + "/activate/", {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then(function(data) {
        setOverview(function(current) {
          return {
            ...current,
            checkoutRequests: (current.checkoutRequests || []).map(function(item) {
              return item.reference === reference ? data.checkoutRequest : item;
            }),
            memberships: (current.memberships || []).map(function(item) {
              return item.email === data.checkoutRequest.userEmail
                ? {
                    ...item,
                    tier: data.membership.tier,
                    status: data.membership.status,
                    prioritySlotsTotal: data.membership.prioritySlotsTotal,
                    prioritySlotsUsed: data.membership.prioritySlotsUsed,
                    expiresAt: data.membership.expiresAt,
                  }
                : item;
            }),
          };
        });
      })
      .catch(function(requestError) {
        setError(requestError.message || "Unable to activate membership from operations.");
      })
      .finally(function() {
        setActivatingReference("");
      });
  }

  if (loading) {
    return (
      <div style={styles.shell}>
        <Navbar activeLabel="Dashboard" />
        <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
          <section style={styles.hero}>
            <p style={styles.eyebrow}>Operations</p>
            <h1 style={styles.title}>Loading operations overview...</h1>
            <p style={styles.text}>Checking session, access level, and the latest checkout activity.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...styles.main, padding: isMobile ? "24px 16px 56px" : styles.main.padding }}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Operations</p>
          <h1 style={styles.title}>Membership and payment operations</h1>
          <p style={styles.text}>
            Review Stripe checkout activity, inspect recurring subscription events, and manually activate a membership when support or payment reconciliation needs an override path.
          </p>
        </section>

        {error ? <div style={styles.error}>{error}</div> : null}

        <section style={styles.stats}>
          {[
            { label: "Total Requests", value: overview.stats ? overview.stats.totalRequests : 0 },
            { label: "Awaiting Payment", value: overview.stats ? overview.stats.awaitingPayment : 0 },
            { label: "Paid Requests", value: overview.stats ? overview.stats.paidRequests : 0 },
            { label: "Active Memberships", value: overview.stats ? overview.stats.activeMemberships : 0 },
            { label: "Failed Renewals", value: overview.stats ? overview.stats.failedRenewals : 0 },
            { label: "Scheduled Cancellations", value: overview.stats ? overview.stats.scheduledCancellations : 0 },
            { label: "Active Users Now", value: overview.stats ? overview.stats.activeUsersNow : 0 },
            { label: "Events Last Hour", value: overview.stats ? overview.stats.eventsLastHour : 0 },
          ].map(function(item) {
            return (
              <div key={item.label} style={styles.statCard}>
                <div style={styles.statValue}>{item.value}</div>
                <div style={styles.statLabel}>{item.label}</div>
              </div>
            );
          })}
        </section>

        <section style={styles.section}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Live engagement</h2>
              <p style={styles.text}>
                Monitor where members are active right now and open the same routes they are viewing.
              </p>
            </div>
            <button type="button" style={styles.refreshButton} onClick={refreshOverview} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh live feed"}
            </button>
          </div>

          <div style={styles.engagementGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{overview.engagement ? overview.engagement.activeUsersLastFiveMinutes : 0}</div>
              <div style={styles.statLabel}>Users active in 5 min</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{overview.engagement ? overview.engagement.eventsLastHour : 0}</div>
              <div style={styles.statLabel}>Tracked events in 1 hour</div>
            </div>
          </div>

          <div style={styles.routeList}>
            {overview.engagement && overview.engagement.liveRoutes && overview.engagement.liveRoutes.length ? (
              overview.engagement.liveRoutes.map(function(route) {
                return (
                  <article key={route.path} style={styles.routeCard}>
                    <div style={styles.routeTitleRow}>
                      <h3 style={styles.miniTitle}>{route.path}</h3>
                      <span style={styles.pill}>{route.activeUsers} active</span>
                    </div>
                    <div style={styles.meta}>
                      <span style={styles.pill}>Latest signal: {route.lastEventType}</span>
                      <span style={styles.pill}>Last seen: {formatDateTime(route.lastSeenAt)}</span>
                    </div>
                    <div style={styles.buttonRow}>
                      <Link href={route.path} style={styles.secondary}>Open this route</Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <div style={styles.empty}>No tracked route activity yet. Once users browse the app, their route views and heartbeats will appear here.</div>
            )}
          </div>

          <div style={styles.recentList}>
            {overview.engagement && overview.engagement.recentActivity && overview.engagement.recentActivity.length ? (
              overview.engagement.recentActivity.map(function(item) {
                return (
                  <article key={item.id} style={styles.recentItem}>
                    <div style={styles.routeTitleRow}>
                      <strong>{item.actorName}</strong>
                      <span style={styles.timestamp}>{formatDateTime(item.createdAt)}</span>
                    </div>
                    <div style={styles.body}>
                      {item.isAuthenticated ? (item.actorEmail || "Signed-in member") : "Guest session"} · {item.eventType.replace("_", " ")} on {item.path}
                    </div>
                    <div style={styles.buttonRow}>
                      <Link href={item.path} style={styles.secondary}>Open route</Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <div style={styles.empty}>Recent activity will populate after the tracker records page views or heartbeat signals.</div>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Checkout requests</h2>
          {overview.checkoutRequests && overview.checkoutRequests.length ? (
            <div style={styles.list}>
              {overview.checkoutRequests.map(function(item) {
                var canActivate = item.status !== "Paid" && item.status !== "Manually Activated";
                return (
                  <article key={item.reference} style={styles.card}>
                    <div style={styles.row}>
                      <div>
                        <div style={styles.titleRow}>{item.planName}</div>
                        <div style={styles.body}>{item.userName} · {item.userEmail}</div>
                      </div>
                      <div style={styles.meta}>
                        <span style={styles.pill}>{item.reference}</span>
                        <span style={styles.pill}>{item.status}</span>
                        <span style={styles.pill}>{item.provider || "manual"}</span>
                      </div>
                    </div>
                    <div style={styles.meta}>
                      <span style={styles.pill}>Tier now: {item.membershipTier}</span>
                      <span style={styles.pill}>{item.billingMode === "subscription" ? "Recurring yearly" : "One-time payment"}</span>
                      <span style={styles.pill}>Payment: {item.provider_payment_status || "n/a"}</span>
                      <span style={styles.pill}>{item.amountDisplay}</span>
                    </div>
                    {item.notes ? <div style={styles.body}>{item.notes}</div> : null}
                    <div style={styles.buttonRow}>
                      {canActivate ? (
                        <button type="button" style={styles.primary} onClick={function() { activateCheckout(item.reference); }} disabled={activatingReference === item.reference}>
                          {activatingReference === item.reference ? "Activating..." : "Manual activate"}
                        </button>
                      ) : null}
                      <Link href="/dashboard" style={styles.secondary}>Open dashboard</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={styles.empty}>No checkout requests recorded yet.</div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Memberships</h2>
          {overview.memberships && overview.memberships.length ? (
            <div style={styles.list}>
              {overview.memberships.map(function(item) {
                return (
                  <article key={item.email} style={styles.card}>
                    <div style={styles.row}>
                      <div>
                        <div style={styles.titleRow}>{item.name}</div>
                        <div style={styles.body}>{item.email}</div>
                      </div>
                      <div style={styles.meta}>
                        <span style={styles.pill}>{item.tier}</span>
                        <span style={styles.pill}>{item.status}</span>
                      </div>
                    </div>
                    <div style={styles.meta}>
                      <span style={styles.pill}>Recurring plan: {item.recurringPlanKey || "none"}</span>
                      <span style={styles.pill}>Recurring status: {item.recurringStatus || "not recurring"}</span>
                      <span style={styles.pill}>Priority slots: {item.prioritySlotsUsed}/{item.prioritySlotsTotal}</span>
                      <span style={styles.pill}>Expires: {item.expiresAt || "Not set"}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={styles.empty}>No memberships found.</div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Recurring billing events</h2>
          {overview.billingEvents && overview.billingEvents.length ? (
            <div style={styles.list}>
              {overview.billingEvents.map(function(item) {
                return (
                  <article key={item.id} style={styles.card}>
                    <div style={styles.row}>
                      <div>
                        <div style={styles.titleRow}>{item.event_type}</div>
                        <div style={styles.body}>{item.userName} · {item.userEmail}</div>
                      </div>
                      <div style={styles.meta}>
                        <span style={styles.pill}>{item.event_status || 'recorded'}</span>
                        <span style={styles.pill}>{item.reference || 'no reference'}</span>
                      </div>
                    </div>
                    {item.summary ? <div style={styles.body}>{item.summary}</div> : null}
                    <div style={styles.meta}>
                      <span style={styles.pill}>Logged: {new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={styles.empty}>No recurring billing events have been recorded yet.</div>
          )}
        </section>
      </main>
    </div>
  );
}