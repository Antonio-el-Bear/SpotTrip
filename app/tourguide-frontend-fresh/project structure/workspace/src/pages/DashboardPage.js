import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import { subscribeToMessageNotifications } from "../lib/messageNotifications";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var QUICK_ACTIONS = [
  { title: "View Profile", desc: "See your public profile as other members see it." },
  { title: "Messages", desc: "Open your inbox and reply to travelers quickly." },
  { title: "New Trip", desc: "Document a fresh trip and publish it to your archive." },
  { title: "AI Trip Builder", desc: "Generate a structured itinerary and save it privately first." },
  { title: "Subscription & Priority", desc: "Manage access, priority slots, and billing options from one place." }
];

var PRICING = [
  {
    title: "Premium Subscription",
    subtitle: "EUR 35/year",
    desc: "Unlock member profiles, detailed itineraries, contact information, travel maps, and private messaging.",
    button: "Subscribe",
    featured: false
  },
  {
    title: "Priority Listing",
    subtitle: "EUR 35/slot/year",
    desc: "Promote trips to the top of results. Each slot covers up to 2 countries and 2 classifications.",
    button: "Get Priority",
    featured: false
  },
  {
    title: "Both Plans",
    subtitle: "From EUR 100/year",
    desc: "Combine premium access with boosted listing placement in a single Stripe checkout.",
    button: "Get Both",
    featured: true
  }
];

var USER_TRIPS = [
  {
    id: 7,
    title: "Sustainable Communities of the Peruvian Highlands",
    visibility: "Member",
    author: "Dr. Helena Vasquez",
    countries: "Peru",
    duration: "14 days",
    budget: "$2,500 - $5,000",
    tags: ["Community-based Tourism", "Sustainable Tourism", "Cultural Tourism"]
  },
  {
    id: 8,
    title: "Mekong Delta Community Tourism Assessment",
    visibility: "Member",
    author: "Dr. Helena Vasquez",
    countries: "Vietnam, Cambodia",
    duration: "19 days",
    budget: "$1,000 - $2,500",
    tags: ["Community-based Tourism", "Ecotourism", "Cultural Tourism"]
  }
];

var S = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #f7efe2 0%, #f8fafc 46%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "34px 24px 60px" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 20, alignItems: "center", marginBottom: 24, background: "linear-gradient(135deg, #162235 0%, #253a5a 55%, #34537d 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 28, boxShadow: "0 28px 80px rgba(15,23,42,0.22)" },
  heroIdentity: { display: "flex", gap: 18, alignItems: "center", minWidth: 0 },
  avatar: { width: 78, height: 78, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, flexShrink: 0 },
  eyebrow: { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c35c" },
  heroTitle: { margin: "6px 0 8px", fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: "#f8fafc" },
  heroMeta: { display: "flex", gap: 10, flexWrap: "wrap", fontSize: 14, color: "rgba(248,250,252,0.72)", fontWeight: 600 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" },
  primaryButton: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 8, padding: "12px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" },
  secondaryButton: { background: "none", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "11px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 22, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "#111827", marginBottom: 6 },
  statLabel: { fontSize: 13, fontWeight: 700, color: "#6b7280" },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.05)", marginBottom: 24 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 },
  panelTitle: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111827" },
  panelText: { fontSize: 14, lineHeight: 1.7, color: "#4b5563" },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 },
  actionCard: { background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 20, minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "space-between" },
  actionTitle: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f0f2f5" },
  actionText: { marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "rgba(240,242,245,0.62)" },
  actionFooter: { marginTop: 18 },
  actionButton: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  consultancyCard: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: 22 },
  consultancyMeta: { display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0 16px" },
  pill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, fontWeight: 700, color: "#374151" },
  ratePill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.35)", fontSize: 12, fontWeight: 800, color: "#9a6f00" },
  formGrid: { display: "grid", gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" },
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111827", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 132, border: "1px solid #d1d5db", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111827", background: "#fff", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" },
  editActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 },
  inlineNote: { marginTop: 14, padding: "12px 14px", background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 8, fontSize: 13, color: "#4b5563" },
  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  pricingCard: { position: "relative", background: "#1e2a3a", border: "2px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 22, boxShadow: "0 18px 50px rgba(20,33,61,0.05)" },
  pricingFeatured: { position: "relative", background: "#1e2a3a", border: "2px solid rgba(212,160,23,0.5)", borderRadius: 8, padding: 22, boxShadow: "0 18px 50px rgba(20,33,61,0.05)" },
  badge: { position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#d4a017", color: "#fff", borderRadius: 12, padding: "3px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" },
  pricingTitle: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f0f2f5" },
  pricingSubtitle: { margin: "8px 0 12px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#d4a017" },
  pricingText: { fontSize: 14, lineHeight: 1.7, color: "rgba(240,242,245,0.62)", marginBottom: 18 },
  selectedBox: { marginTop: 16, padding: "14px 16px", background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 8 },
  warning: { marginTop: 12, color: "#b91c1c", fontSize: 13, lineHeight: 1.6 },
  tripList: { display: "grid", gap: 16 },
  tripCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, boxShadow: "0 16px 45px rgba(20,33,61,0.04)" },
  tripHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 10 },
  tripTitle: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#111827" },
  tripSub: { fontSize: 13, fontWeight: 700, color: "#6b7280" },
  tripMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  visibility: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.35)", fontSize: 12, fontWeight: 800, color: "#9a6f00" },
  tag: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(180,116,0,0.1)", border: "1px solid rgba(180,116,0,0.14)", fontSize: 12, fontWeight: 700, color: "#9a5b00" },
  tripLink: { display: "inline-flex", alignItems: "center", marginTop: 8, fontSize: 13, fontWeight: 700, color: "#111827", textDecoration: "none" },
  emptyState: { textAlign: "center", padding: "30px 20px", borderRadius: 8, border: "1px dashed #d1d5db", background: "#fff" },
  emptyTitle: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#111827" },
  emptyText: { margin: "10px 0 18px", fontSize: 14, lineHeight: 1.7, color: "#6b7280" },
  footer: { background: "#222e42", color: "rgba(255,255,255,0.8)", marginTop: 34 },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" },
  footerBrand: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 },
  footerText: { fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.74)", maxWidth: 860, marginBottom: 22 },
  footerLinks: { display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18 },
  footerLink: { fontSize: 13, fontWeight: 700, color: "#f8fafc" },
  footerDisclaimer: { fontSize: 12, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", marginBottom: 16 },
  footerCopyright: { fontSize: 12, color: "rgba(255,255,255,0.48)" }
};

function quickActionConfig(item) {
  if (item.title === "View Profile") {
    return { label: "Open Profile", to: "/profile" };
  }
  if (item.title === "Messages") {
    return { label: "Open Messages", to: "/messages" };
  }
  if (item.title === "New Trip") {
    return { label: "Create Trip", to: "/document-trip?source=dashboard-quick-links" };
  }
  if (item.title === "AI Trip Builder") {
    return { label: "Launch Builder", to: "/aitripbuilder?source=dashboard-quick-links" };
  }
  return { label: "Manage Billing", to: "/billing" };
}

function mergeSessionIntoDashboard(data, session) {
  if (!session) {
    return data;
  }

  return {
    ...data,
    profile: {
      ...data.profile,
      name: session.name,
      initials: session.initials,
      member_since: data.profile.member_since || session.memberSince,
      membership: data.profile.membership || session.membership || null,
    },
  };
}

function formatDashboardDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getFirstName(name) {
  if (!name) {
    return "Traveler";
  }

  return String(name).trim().split(/\s+/)[0] || "Traveler";
}

function getMembershipSummary(membership) {
  if (!membership) {
    return "Member";
  }

  return [membership.tier, membership.status].filter(Boolean).join(" • ") || "Member";
}

function planKeyFromItem(item) {
  if (!item || !item.title) {
    return "subscription";
  }
  if (item.title.indexOf("Priority") !== -1) {
    return "priority";
  }
  if (item.title.indexOf("Both") !== -1) {
    return "bundle";
  }
  return "subscription";
}

function normalizeTrips(rawTrips) {
  return (rawTrips || []).map(function(trip) {
    return {
      ...trip,
      countries: Array.isArray(trip.countries) ? trip.countries : (trip.countries ? [trip.countries] : []),
      classifications: Array.isArray(trip.classifications) ? trip.classifications : [],
    };
  });
}

function DashboardPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var router = useRouter();
  var authCheckState = React.useState(true);
  var checkingAuth = authCheckState[0];
  var setCheckingAuth = authCheckState[1];
  var messageSummaryState = React.useState({ unreadMessages: 0, totalThreads: 0, totalMessages: 0 });
  var messageSummary = messageSummaryState[0];
  var setMessageSummary = messageSummaryState[1];
  var initialData = {
    profile: {
      initials: "DH",
      name: "Dr. Helena Vasquez",
      member_since: "2023-03-15",
      membership: {
        tier: "Member",
        status: "Active",
        startedAt: "2023-03-15",
        expiresAt: "",
        prioritySlotsTotal: 0,
        prioritySlotsUsed: 0,
      },
      consultancy_mode: "Free & Paid",
      consultation_rate: "USD 45/session",
      consultancy_bio: "Available for consultations on community-based tourism planning and sustainable travel itineraries in South America and Southeast Asia.",
    },
    stats: { tripsDocumented: 2, countriesVisited: 10, messages: 3, profileViews: 142 },
    quickActions: QUICK_ACTIONS,
    pricingOptions: PRICING,
    checkoutRequests: [],
    trips: USER_TRIPS.map(function(trip) {
      return {
        id: trip.id,
        title: trip.title,
        visibility: trip.visibility,
        author: trip.author,
        countries: [trip.countries],
        duration: trip.duration,
        budget_range: trip.budget,
        classifications: trip.tags,
      };
    }),
    aiTrips: [],
  };
  var dataState = React.useState(initialData);
  var dashboardData = dataState[0];
  var setDashboardData = dataState[1];
  var loadErrorState = React.useState("");
  var loadError = loadErrorState[0];
  var setLoadError = loadErrorState[1];

  function loadMessageSummary() {
    fetchJson("/api/messages/summary/")
      .then(function(data) {
        setMessageSummary(data);
      })
      .catch(function() {});
  }

  React.useEffect(function() {
    var active = true;

    fetchJson("/api/auth/session/")
      .then(function(sessionData) {
        if (!active) {
          return null;
        }

        if (!sessionData || !sessionData.authenticated || !sessionData.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/dashboard"));
          return null;
        }

        var session = writeAuthSession(sessionData.user) || sessionData.user;
        setLoadError("");
        setDashboardData(function(current) {
          return mergeSessionIntoDashboard(current, session);
        });
        if (active) {
          loadMessageSummary();
        }

        return fetchJson("/api/dashboard/")
          .then(function(data) {
            if (active) {
              setDashboardData(mergeSessionIntoDashboard({
                ...data,
                trips: normalizeTrips(data.trips),
                aiTrips: normalizeTrips(data.aiTrips),
              }, session));
            }
          })
          .catch(function(error) {
            if (active) {
              setLoadError(error && error.message ? error.message : "Unable to load dashboard details right now.");
            }
          });
      })
      .catch(function() {
        if (active) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/dashboard"));
        }
      })
      .finally(function() {
        if (active) {
          setCheckingAuth(false);
        }
      });

    return function() {
      active = false;
    };
  }, [router]);

  React.useEffect(function() {
    if (checkingAuth) {
      return undefined;
    }

    function handleVisibilityRefresh() {
      if (document.visibilityState === "visible") {
        loadMessageSummary();
      }
    }

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return function() {
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [checkingAuth]);

  React.useEffect(function() {
    if (checkingAuth) {
      return undefined;
    }

    return subscribeToMessageNotifications(function(event) {
      if (event && event.summary) {
        setMessageSummary(event.summary);
      }
    });
  }, [checkingAuth]);

  if (checkingAuth) {
    return CE("div", { style: S.page },
      CE(Navbar, { activeLabel: "Dashboard" }),
      CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
        CE("section", { style: S.panel },
          CE("h1", { style: S.panelTitle }, "Loading dashboard..."),
          CE("div", { style: S.panelText }, "Checking your member session before opening the workspace.")
        )
      )
    );
  }

  var membership = dashboardData.profile.membership || null;
  var membershipSummary = getMembershipSummary(membership);
  var memberSince = formatDashboardDate(dashboardData.profile.member_since);
  var firstName = getFirstName(dashboardData.profile.name);
  var stats = [
    { value: String(dashboardData.stats.tripsDocumented || 0), label: "Trips Documented" },
    { value: String(dashboardData.stats.countriesVisited || 0), label: "Countries Visited" },
    { value: String(messageSummary.totalThreads || dashboardData.stats.messages || 0), label: messageSummary.unreadMessages ? ("Messages (" + String(messageSummary.unreadMessages) + " unread)") : "Messages" },
    { value: String(dashboardData.stats.profileViews || 0), label: "Profile Views" },
  ];

  return CE("div", { style: S.page },
    CE(Navbar, { activeLabel: "Dashboard" }),
    CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
      loadError ? CE("section", { style: S.panel },
        CE("h2", { style: S.panelTitle }, "Dashboard temporarily unavailable"),
        CE("div", { style: S.panelText }, loadError),
        CE("div", { style: S.inlineNote }, "Your session is still active. The page is staying here instead of sending you back to login.")
      ) : null,
      CE("section", { style: { ...S.hero, gridTemplateColumns: isCompact ? "1fr" : S.hero.gridTemplateColumns, padding: isMobile ? 20 : 28 } },
        CE("div", { style: S.heroIdentity },
          CE("div", { style: S.avatar }, dashboardData.profile.initials || firstName.slice(0, 2).toUpperCase()),
          CE("div", null,
            CE("p", { style: S.eyebrow }, "Member Workspace"),
            CE("h1", { style: S.heroTitle }, "Welcome, " + firstName),
            CE("div", { style: S.heroMeta },
              CE("span", null, membershipSummary),
              CE("span", null, "Member since " + memberSince)
            )
          )
        ),
        CE("div", { style: { ...S.heroActions, justifyContent: isCompact ? "flex-start" : "flex-end" } },
          CE(Link, { href: "/profile", style: S.secondaryButton }, "View Profile"),
          CE(Link, { href: "/document-trip?source=dashboard-hero", style: S.primaryButton }, "New Trip")
        )
      ),

      CE("section", { style: S.statsGrid },
        stats.map(function(item) {
          return CE("article", { key: item.label, style: S.statCard },
            CE("div", { style: S.statValue }, item.value),
            CE("div", { style: S.statLabel }, item.label)
          );
        })
      ),

      CE("section", { style: S.panel },
        CE("div", { style: S.panelHeader },
          CE("h2", { style: S.panelTitle }, "Quick Links")
        ),
        CE("div", { style: S.actionsGrid },
          (dashboardData.quickActions || QUICK_ACTIONS).map(function(item) {
            var action = quickActionConfig(item);
            return CE("article", { key: item.title, style: S.actionCard },
              CE("div", null,
                CE("h3", { style: S.actionTitle }, item.title),
                CE("div", { style: S.actionText }, item.description || item.desc)
              ),
              CE("div", { style: S.actionFooter },
                  CE(Link, { href: action.to, style: S.actionButton }, action.label)
              )
            );
          })
        )
      ),

      CE("section", { style: S.panel },
        CE("div", { style: S.panelHeader },
          CE("h2", { style: S.panelTitle }, "Consultancy Settings"),
          CE(Link, { href: "/consultancy", style: S.secondaryButton }, "Edit Settings")
        ),
        CE("div", { style: { ...S.consultancyCard, gridTemplateColumns: isCompact ? "1fr" : S.consultancyCard.gridTemplateColumns } },
          CE("div", null,
            CE("div", { style: S.panelText }, "Control how your consultation offer appears on your member profile and dashboard."),
            CE("div", { style: S.consultancyMeta },
              CE("span", { style: S.pill }, dashboardData.profile.consultancy_mode || "Not set"),
              CE("span", { style: S.ratePill }, dashboardData.profile.consultation_rate || "Rate not set")
            ),
            CE("div", { style: S.panelText }, dashboardData.profile.consultancy_bio || "No consultancy bio added yet.")
          ),
          CE("div", { style: S.inlineNote }, "Use the dedicated consultancy settings page to update these fields. Changes are saved in this browser and reflected on your dashboard and profile pages.")
        )
      ),

      CE("section", { style: S.panel },
        CE("div", { style: S.panelHeader },
          CE("h2", { style: S.panelTitle }, "Subscriptions & Priority"),
          CE(Link, { href: "/billing", style: S.secondaryButton }, "Open Billing")
        ),
        CE("div", { style: S.pricingGrid },
          (dashboardData.pricingOptions || PRICING).map(function(item) {
            return CE("article", { key: item.title, style: item.featured ? S.pricingFeatured : S.pricingCard },
              item.featured ? CE("div", { style: S.badge }, "Best Value") : null,
              CE("h3", { style: S.pricingTitle }, item.title),
              CE("div", { style: S.pricingSubtitle }, item.subtitle || "Membership option"),
              CE("div", { style: S.pricingText }, item.description || item.desc),
              CE(Link, { href: "/billing?plan=" + encodeURIComponent(planKeyFromItem(item)), style: S.primaryButton }, item.button || "Select")
            );
          })
        ),
        CE("div", { style: S.inlineNote }, "The dedicated billing page keeps Stripe checkout and membership management separate from the dashboard so these actions have their own stable destination.")
      ),

      CE("section", { style: S.panel },
        CE("div", { style: S.panelHeader },
          CE("h2", { style: S.panelTitle }, "Your Trips")
        ),
        dashboardData.trips && dashboardData.trips.length
          ? CE("div", { style: S.tripList }, dashboardData.trips.map(function(trip) {
              return CE("article", { key: String(trip.id || trip.title), style: S.tripCard },
                CE("div", { style: S.tripHeader },
                  CE("div", null,
                    CE("h3", { style: S.tripTitle }, trip.title),
                    CE("div", { style: S.tripSub }, "by " + (trip.author || dashboardData.profile.name))
                  ),
                  CE("span", { style: S.visibility }, trip.visibility || trip.status || "Member")
                ),
                CE("div", { style: S.tripMeta },
                  CE("span", { style: S.pill }, (trip.countries || []).join(", ") || "No country listed"),
                  CE("span", { style: S.pill }, trip.duration || "Duration pending"),
                  CE("span", { style: S.pill }, trip.budget_range || "Budget pending")
                ),
                trip.classifications && trip.classifications.length
                  ? CE("div", { style: S.tripMeta }, trip.classifications.map(function(tag) {
                      return CE("span", { key: tag, style: S.tag }, tag);
                    }))
                  : null,
                trip.id ? CE(Link, { href: "/trips/" + trip.id, style: S.tripLink }, "Open trip details") : null
              );
            }))
          : CE("div", { style: S.emptyState },
              CE("h3", { style: S.emptyTitle }, "No trips documented yet"),
              CE("div", { style: S.emptyText }, "Start by recording a trip and it will appear here in your member archive."),
              CE(Link, { href: "/document-trip?source=dashboard-empty-trips", style: S.primaryButton }, "Document Your First Trip")
            )
      ),

      CE("section", { style: S.panel },
        CE("div", { style: S.panelHeader },
          CE("h2", { style: S.panelTitle }, "Your AI-Built Trips")
        ),
        CE("div", { style: { ...S.panelText, marginBottom: 18 } }, "These itineraries stay private to your account until you decide to use or adapt them."),
        dashboardData.aiTrips && dashboardData.aiTrips.length
          ? CE("div", { style: S.tripList }, dashboardData.aiTrips.map(function(trip) {
              return CE("article", { key: String(trip.id || trip.title), style: S.tripCard },
                CE("div", { style: S.tripHeader },
                  CE("h3", { style: S.tripTitle }, trip.title),
                  CE("span", { style: S.visibility }, trip.isPreferred ? "Preferred" : (trip.status || "Private"))
                ),
                CE("div", { style: S.tripMeta },
                  CE("span", { style: S.pill }, (trip.countries || []).join(", ") || "No country listed"),
                  CE("span", { style: S.pill }, trip.duration || "Duration pending"),
                  CE("span", { style: S.pill }, trip.budget_range || "Budget pending")
                ),
                trip.id ? CE(Link, { href: "/trips/" + trip.id, style: S.tripLink }, "Open trip details") : null
              );
            }))
          : CE("div", { style: S.emptyState },
              CE("h3", { style: S.emptyTitle }, "No AI-built trips yet"),
              CE("div", { style: S.emptyText }, "Use the AI trip builder to create a first draft itinerary and keep it in your private archive."),
              CE(Link, { href: "/aitripbuilder?source=dashboard-empty-ai-trips", style: S.primaryButton }, "Build an AI Trip")
            )
      )
    ),
  );
}

export default DashboardPage;
