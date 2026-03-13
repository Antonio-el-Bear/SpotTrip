import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import useViewport from "../lib/useViewport";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";

const TRANSPORT_OPTIONS = [
  "Flight",
  "Flight + Rail",
  "Rail First",
  "Road Trip",
  "Mixed Local Transport",
  "Ferry + Rail",
];

const ACCOMMODATION_OPTIONS = [
  "Budget stays",
  "Mid-range boutique",
  "Comfort hotels",
  "Luxury stays",
  "Flexible mix",
];

const STYLE_PRESETS = [
  "Cultural + food",
  "Slow travel",
  "Nature + photography",
  "Luxury city break",
  "Family-friendly",
  "Adventure + local life",
];

const COUNTRY_OPTIONS = [
  "Angola",
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Botswana",
  "Brazil",
  "Cambodia",
  "Canada",
  "China",
  "Croatia",
  "Egypt",
  "France",
  "Germany",
  "Greece",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Kenya",
  "Malaysia",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Netherlands",
  "New Zealand",
  "Peru",
  "Portugal",
  "Qatar",
  "Rwanda",
  "Singapore",
  "South Africa",
  "Spain",
  "Switzerland",
  "Tanzania",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
  "Zambia",
  "Zimbabwe",
];

const PAGE = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f5eedf 0%, #f8fafc 38%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1240, margin: "0 auto", padding: "36px 24px 72px" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: 20, alignItems: "stretch", marginBottom: 22 },
  heroPanel: { background: "linear-gradient(135deg, #162235 0%, #213752 58%, #34537d 100%)", borderRadius: 28, padding: 28, boxShadow: "0 28px 80px rgba(15,23,42,0.20)", border: "1px solid rgba(255,255,255,0.08)" },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 4.8vw, 52px)", lineHeight: 1.02, margin: 0, color: "#f8fafc", marginBottom: 12 },
  intro: { fontSize: 15, lineHeight: 1.8, color: "rgba(248,250,252,0.76)", margin: 0 },
  badgeRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 },
  badge: { display: "inline-flex", alignItems: "center", padding: "8px 12px", borderRadius: 999, background: "rgba(240,195,92,0.12)", border: "1px solid rgba(240,195,92,0.26)", color: "#f6d98b", fontSize: 12, fontWeight: 700 },
  sideCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 22, boxShadow: "0 18px 50px rgba(15,23,42,0.06)" },
  sideTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, marginBottom: 10, color: "#111827" },
  sideText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  list: { listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 10 },
  listItem: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.65, color: "#374151" },
  dot: { color: "#d4a017", fontWeight: 800 },
  sourceBanner: { marginTop: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(240,195,92,0.12)", border: "1px solid rgba(240,195,92,0.24)", color: "#f8fafc", fontSize: 13, lineHeight: 1.6 },
  disclaimer: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, background: "#fffaf0", border: "1px solid rgba(212,160,23,0.26)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 },
  disclaimerIcon: { width: 28, height: 28, borderRadius: "50%", background: "rgba(212,160,23,0.12)", color: "#9a6f00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 },
  disclaimerTitle: { fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9a6f00", marginBottom: 6 },
  disclaimerText: { fontSize: 13, lineHeight: 1.75, color: "#4b5563" },
  layout: { display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)", gap: 22, alignItems: "start" },
  stack: { display: "grid", gap: 18 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 16 },
  cardTitleWrap: { display: "grid", gap: 6 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, color: "#111827" },
  cardIntro: { fontSize: 13, lineHeight: 1.7, color: "#6b7280" },
  helperPill: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12, fontWeight: 700 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  label: { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8 },
  input: { width: "100%", border: "1px solid #d1d5db", background: "#fff", color: "#111827", borderRadius: 12, padding: "13px 14px", fontSize: 14, outline: "none", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 124, border: "1px solid #d1d5db", background: "#fff", color: "#111827", borderRadius: 12, padding: "13px 14px", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit" },
  select: { width: "100%", border: "1px solid #d1d5db", background: "#fff", color: "#111827", borderRadius: 12, padding: "13px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", appearance: "none" },
  optionGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  optionButton: { border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 999, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  optionButtonActive: { border: "1px solid rgba(212,160,23,0.36)", background: "rgba(212,160,23,0.12)", color: "#9a6f00", borderRadius: 999, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  submitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  submitHelper: { fontSize: 13, lineHeight: 1.7, color: "#6b7280", maxWidth: 520 },
  primaryButton: { background: "#d4a017", color: "#fff", border: "none", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  primaryButtonMuted: { background: "#d4a017", color: "#fff", border: "none", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "progress", fontFamily: "inherit", opacity: 0.72 },
  secondaryButton: { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  error: { borderRadius: 14, padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, lineHeight: 1.6 },
  sidebarCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 20, boxShadow: "0 16px 40px rgba(15,23,42,0.04)" },
  sidebarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, margin: 0, marginBottom: 10, color: "#111827" },
  sidebarText: { fontSize: 13, lineHeight: 1.75, color: "#4b5563" },
  resultHeader: { display: "grid", gap: 14 },
  resultTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" },
  resultTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)", margin: 0, color: "#111827" },
  resultText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563" },
  resultBadgeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  resultBadge: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12, fontWeight: 700 },
  accentBadge: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.28)", color: "#9a6f00", fontSize: 12, fontWeight: 800 },
  compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
  compareCard: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, background: "#fff" },
  compareCardActive: { border: "1px solid rgba(212,160,23,0.36)", borderRadius: 16, padding: 18, background: "#fffaf0", boxShadow: "0 16px 34px rgba(212,160,23,0.08)" },
  compareEyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9a6f00", marginBottom: 8 },
  compareTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, marginBottom: 10, color: "#111827" },
  metricGrid: { display: "grid", gap: 10 },
  metric: { borderTop: "1px solid #f3f4f6", paddingTop: 10 },
  metricLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 },
  metricText: { fontSize: 14, lineHeight: 1.6, color: "#374151" },
  scoreGrid: { display: "grid", gap: 8 },
  scoreRow: { display: "grid", gridTemplateColumns: "78px 1fr 32px", gap: 10, alignItems: "center" },
  scoreLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280" },
  scoreTrack: { height: 8, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" },
  scoreFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #d4a017, #f0c35c)" },
  scoreValue: { fontSize: 12, fontWeight: 800, color: "#9a6f00", textAlign: "right" },
  compareActionRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 },
  winnerButton: { border: "1px solid rgba(212,160,23,0.34)", background: "rgba(212,160,23,0.10)", color: "#9a6f00", padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  winnerButtonMuted: { border: "1px solid rgba(212,160,23,0.34)", background: "rgba(212,160,23,0.10)", color: "#9a6f00", padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "progress", fontFamily: "inherit", opacity: 0.72 },
  winnerBadge: { display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.24)", color: "#9a6f00", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" },
  detailCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 24, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  tabRow: { display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 18px" },
  tab: { border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  tabActive: { border: "1px solid rgba(212,160,23,0.34)", background: "rgba(212,160,23,0.12)", color: "#9a6f00", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  dayGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 0.7fr)", gap: 18 },
  dayCard: { borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", padding: 18 },
  dayEyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9a6f00", marginBottom: 8 },
  dayTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0, marginBottom: 10, color: "#111827" },
  dayText: { fontSize: 14, lineHeight: 1.8, color: "#4b5563", whiteSpace: "pre-line" },
  dayMetaStack: { display: "grid", gap: 12 },
  dayMeta: { borderRadius: 14, border: "1px solid #f3f4f6", background: "#f9fafb", padding: "12px 14px" },
  dayMetaLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 },
  dayMetaText: { fontSize: 13, lineHeight: 1.65, color: "#374151" },
  bookingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 },
  bookingCard: { borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", padding: 18, display: "grid", gap: 8 },
  bookingTitle: { fontSize: 16, fontWeight: 800, color: "#111827" },
  bookingText: { fontSize: 13, lineHeight: 1.65, color: "#4b5563" },
  bookingMeta: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9a6f00" },
  destinationStack: { display: "grid", gap: 12 },
  destinationRow: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto", gap: 12, alignItems: "end" },
  tinyText: { fontSize: 12, lineHeight: 1.65, color: "#6b7280" },
  addButton: { background: "#fff", color: "#9a6f00", border: "1px solid rgba(212,160,23,0.34)", padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  removeButton: { background: "#fff", color: "#991b1b", border: "1px solid #fecaca", padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
};

function createDestination(country, city) {
  return {
    country: country || "",
    city: city || "",
  };
}

function summarizeDestinations(destinations) {
  return (destinations || []).filter((item) => item.country).map((item) => {
    return item.city ? `${item.city}, ${item.country}` : item.country;
  });
}

function buildDepartureLabel(form) {
  return [form.departureCity, form.departureCountry].filter(Boolean).join(", ") || form.departureCountry || "";
}

function buildGeneratedOptions(result) {
  if (result && result.tripOptions && result.tripOptions.length) {
    return result.tripOptions;
  }

  if (result && result.savedTrip) {
    return [{
      optionNumber: 1,
      title: result.savedTrip.title,
      summary: result.summary,
      itinerary: result.itinerary,
      savedTrip: result.savedTrip,
      compare: {
        focus: "Primary itinerary",
        duration: result.savedTrip.duration,
        budget: result.savedTrip.budget_range,
        style: result.summary && result.summary.style ? result.summary.style : "General travel",
        transport: result.summary && result.summary.transport ? result.summary.transport : "Best-fit transport mix",
        accommodation: result.summary && result.summary.accommodation ? result.summary.accommodation : "Balanced accommodation mix",
        classifications: result.savedTrip.classifications || [],
        scores: { pace: 7, value: 7, flexibility: 7, overall: 7.0 },
      },
    }];
  }

  return [];
}

function getSourceLabel(source) {
  if (source === "dashboard-new-trip") {
    return "Started from Dashboard: New Trip";
  }
  if (source === "dashboard-ai-builder") {
    return "Started from Dashboard: AI Trip Builder";
  }
  if (source === "dashboard-ai-archive") {
    return "Started from Dashboard: AI archive";
  }
  if (source === "dashboard-hero") {
    return "Started from Dashboard: hero action";
  }
  return "";
}

function getFirstPreferredOption(options) {
  return options.find((option) => option.savedTrip && option.savedTrip.isPreferred) || options[0] || null;
}

function optionId(option) {
  return option && option.savedTrip ? option.savedTrip.id : null;
}

export default function AITripBuilderPage() {
  const viewport = useViewport();
  const isMobile = viewport.isMobile;
  const isCompact = viewport.isTablet;
  const router = useRouter();
  const source = typeof router.query.source === "string" ? router.query.source : "";
  const sourceLabel = getSourceLabel(source);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [form, setForm] = React.useState({
    departureCountry: "Angola",
    departureCity: "Luanda",
    destinations: [createDestination("Japan", "Tokyo")],
    travelStart: "",
    travelEnd: "",
    optionCount: 3,
    budget: "EUR 2500",
    travelStyle: "Cultural + food",
    transportPreference: "Flight + Rail",
    accommodationLevel: "Mid-range boutique",
    tripGoals: "",
  });
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [preferredMessage, setPreferredMessage] = React.useState("");
  const [selectingTripId, setSelectingTripId] = React.useState(null);
  const [selectedOptionId, setSelectedOptionId] = React.useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [bookingLinks, setBookingLinks] = React.useState([]);
  const [bookingDisclaimer, setBookingDisclaimer] = React.useState("");

  const generatedOptions = React.useMemo(() => buildGeneratedOptions(result), [result]);
  const selectedOption = React.useMemo(() => {
    if (!generatedOptions.length) {
      return null;
    }
    return generatedOptions.find((option) => optionId(option) === selectedOptionId) || getFirstPreferredOption(generatedOptions);
  }, [generatedOptions, selectedOptionId]);
  const selectedDay = selectedOption && selectedOption.itinerary && selectedOption.itinerary.length
    ? selectedOption.itinerary[Math.min(selectedDayIndex, selectedOption.itinerary.length - 1)]
    : null;

  React.useEffect(() => {
    let active = true;
    const nextPath = "/aitripbuilder" + (source ? "?source=" + encodeURIComponent(source) : "");

    fetchJson("/api/auth/session/")
      .then((data) => {
        if (!active) {
          return;
        }

        if (!data || !data.authenticated || !data.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent(nextPath));
          return;
        }

        writeAuthSession(data.user);
        setCheckingAuth(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        clearAuthSession();
        router.replace("/login?next=" + encodeURIComponent(nextPath));
      });

    return () => {
      active = false;
    };
  }, [router, source]);

  React.useEffect(() => {
    if (!generatedOptions.length) {
      setSelectedOptionId(null);
      setSelectedDayIndex(0);
      setBookingLinks([]);
      setBookingDisclaimer("");
      return;
    }

    const preferred = getFirstPreferredOption(generatedOptions);
    setSelectedOptionId(optionId(preferred));
    setSelectedDayIndex(0);
  }, [result, generatedOptions.length]);

  React.useEffect(() => {
    if (!selectedOption || !selectedOption.savedTrip) {
      setBookingLinks([]);
      setBookingDisclaimer("");
      return;
    }

    let active = true;
    const country = selectedOption.savedTrip.countries && selectedOption.savedTrip.countries[0]
      ? selectedOption.savedTrip.countries[0]
      : ((form.destinations && form.destinations[0] && form.destinations[0].country) || "");

    fetchJson(
      "/api/affiliates/trip?title=" + encodeURIComponent(selectedOption.title || selectedOption.savedTrip.title || "") +
      "&country=" + encodeURIComponent(country || "") +
      "&startDate=" + encodeURIComponent(form.travelStart || "")
    )
      .then((data) => {
        if (!active) {
          return;
        }
        setBookingLinks(data.links || []);
        setBookingDisclaimer(data.disclaimer || "");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setBookingLinks([]);
        setBookingDisclaimer("");
      });

    return () => {
      active = false;
    };
  }, [selectedOption, form.destinations, form.travelStart]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateDestination(index, field, value) {
    setForm((current) => ({
      ...current,
      destinations: current.destinations.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    }));
  }

  function addDestination() {
    setForm((current) => ({
      ...current,
      destinations: [...current.destinations, createDestination("", "")],
    }));
  }

  function removeDestination(index) {
    setForm((current) => {
      if (current.destinations.length <= 1) {
        return current;
      }

      return {
        ...current,
        destinations: current.destinations.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function submitPreview() {
    const validDestinations = (form.destinations || []).filter((item) => item.country);
    const primaryDestination = validDestinations[0] || createDestination("", "");
    const destinationSummary = summarizeDestinations(validDestinations);
    const supplementalGoals = destinationSummary.length > 1
      ? `Additional destinations: ${destinationSummary.slice(1).join("; ")}`
      : "";

    const payload = {
      departureCountry: buildDepartureLabel(form),
      destinationCountry: primaryDestination.country || "",
      optionCount: Number(form.optionCount) || 1,
      travelStart: form.travelStart || null,
      travelEnd: form.travelEnd || null,
      budget: form.budget,
      travelStyle: form.travelStyle,
      transportPreference: form.transportPreference,
      accommodationLevel: form.accommodationLevel,
      tripGoals: [
        primaryDestination.city ? `Primary city: ${primaryDestination.city}` : "",
        supplementalGoals,
        form.tripGoals,
      ].filter(Boolean).join("\n\n"),
    };

    setLoading(true);
    setError("");
    setResult(null);
    setPreferredMessage("");

    fetchJson("/api/ai-trip-builder/preview/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((data) => {
        setResult(data);
      })
      .catch((requestError) => {
        setError(requestError.message || "Unable to generate the trip proposal.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function markPreferred(tripId) {
    setSelectingTripId(tripId);
    setPreferredMessage("");

    fetchJson("/api/ai-trip-builder/select/", {
      method: "POST",
      body: JSON.stringify({ tripId }),
    })
      .then((data) => {
        setResult((current) => {
          if (!current || !current.tripOptions) {
            return current;
          }

          const updatedOptions = current.tripOptions.map((option) => {
            const isPreferred = option.savedTrip && option.savedTrip.id === tripId;
            return {
              ...option,
              savedTrip: {
                ...option.savedTrip,
                status: isPreferred ? "Preferred" : "Generated",
                isPreferred,
              },
            };
          });

          const selected = updatedOptions.find((option) => option.savedTrip && option.savedTrip.id === tripId) || updatedOptions[0];

          return {
            ...current,
            savedTrip: selected.savedTrip,
            summary: selected.summary,
            itinerary: selected.itinerary,
            tripOptions: updatedOptions,
          };
        });
        setSelectedOptionId(tripId);
        setSelectedDayIndex(0);
        setPreferredMessage(data.message || "Preferred AI trip updated.");
      })
      .catch((requestError) => {
        setPreferredMessage(requestError.message || "Unable to update the preferred option.");
      })
      .finally(() => {
        setSelectingTripId(null);
      });
  }

  if (checkingAuth) {
    return (
      <div style={PAGE.shell}>
        <Navbar activeLabel="AI Trip Builder" />
        <main style={PAGE.main}>
          <section style={PAGE.card}>
            <h2 style={PAGE.cardTitle}>Checking member session...</h2>
            <div style={PAGE.cardIntro}>TravelRecord is confirming that you are signed in before opening the AI planning workspace.</div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={PAGE.shell}>
      <Navbar activeLabel="AI Trip Builder" />
      <main style={{ ...PAGE.main, padding: isMobile ? "24px 16px 56px" : PAGE.main.padding }}>
        <section style={{ ...PAGE.hero, gridTemplateColumns: isCompact ? "1fr" : PAGE.hero.gridTemplateColumns }}>
          <section style={{ ...PAGE.heroPanel, padding: isMobile ? 20 : 28 }}>
            <div style={PAGE.eyebrow}>AI Planning Workspace</div>
            <h1 style={PAGE.title}>Design the trip brief first. Compare the AI options after.</h1>
            <p style={PAGE.intro}>
              This layout is structured around a cleaner planning workflow: travel inputs first, preferences second, then a comparison-driven result area where each generated option can be reviewed before you open the saved trip.
            </p>
            <div style={PAGE.badgeRow}>
              <span style={PAGE.badge}>Private archive save</span>
              <span style={PAGE.badge}>Up to 4 generated options</span>
              <span style={PAGE.badge}>Preferred winner selection</span>
            </div>
            {sourceLabel ? (
              <div style={PAGE.sourceBanner}>{sourceLabel}. Build the itinerary here and keep the result private until you are ready to reopen it from the dashboard.</div>
            ) : null}
          </section>

          <aside style={{ ...PAGE.sideCard, padding: isMobile ? 18 : 22 }}>
            <h2 style={PAGE.sideTitle}>What You Get</h2>
            <div style={PAGE.sideText}>The page still uses the existing backend AI endpoints, but the screen is now framed like a planning studio rather than a single long form.</div>
            <ul style={PAGE.list}>
              <li style={PAGE.listItem}><span style={PAGE.dot}>•</span><span>Separate cards for route, timing, preferences, and planning notes.</span></li>
              <li style={PAGE.listItem}><span style={PAGE.dot}>•</span><span>Clearer option comparison before choosing a preferred trip.</span></li>
              <li style={PAGE.listItem}><span style={PAGE.dot}>•</span><span>Tabbed day-by-day review instead of a single dense results block.</span></li>
            </ul>
          </aside>
        </section>

        <section style={{ ...PAGE.disclaimer, gridTemplateColumns: isMobile ? "1fr" : PAGE.disclaimer.gridTemplateColumns }}>
          <div style={PAGE.disclaimerIcon}>!</div>
          <div>
            <div style={PAGE.disclaimerTitle}>AI Travel Disclaimer</div>
            <div style={PAGE.disclaimerText}>
              This trip proposal is AI-generated and should be treated as a planning draft. Verify pricing, schedules, availability, and any suggested itinerary details independently before making bookings or travel decisions.
            </div>
          </div>
        </section>

        <section style={{ ...PAGE.layout, gridTemplateColumns: isCompact ? "1fr" : PAGE.layout.gridTemplateColumns }}>
          <div style={PAGE.stack}>
            {!generatedOptions.length ? (
              <>
                <section style={PAGE.card}>
                  <div style={PAGE.cardHeader}>
                    <div style={PAGE.cardTitleWrap}>
                      <h2 style={PAGE.cardTitle}>Travel & Timing</h2>
                      <div style={PAGE.cardIntro}>Set the route, travel window, and how many AI variants you want the backend to generate.</div>
                    </div>
                    <span style={PAGE.helperPill}>Required inputs first</span>
                  </div>
                  <div style={PAGE.formGrid}>
                    <label>
                      <span style={PAGE.label}>Departure Country</span>
                        <select style={PAGE.select} value={form.departureCountry} onChange={(event) => updateField("departureCountry", event.target.value)}>
                          {COUNTRY_OPTIONS.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                    </label>
                    <label>
                        <span style={PAGE.label}>Departure City</span>
                        <input style={PAGE.input} value={form.departureCity} onChange={(event) => updateField("departureCity", event.target.value)} placeholder="Luanda" />
                    </label>
                    <label>
                      <span style={PAGE.label}>Travel Start</span>
                      <input type="date" style={PAGE.input} value={form.travelStart} onChange={(event) => updateField("travelStart", event.target.value)} />
                    </label>
                    <label>
                      <span style={PAGE.label}>Travel End</span>
                      <input type="date" style={PAGE.input} value={form.travelEnd} onChange={(event) => updateField("travelEnd", event.target.value)} />
                    </label>
                    <label>
                      <span style={PAGE.label}>Generated Options</span>
                      <select style={PAGE.select} value={String(form.optionCount)} onChange={(event) => updateField("optionCount", Number(event.target.value))}>
                        <option value="1">1 option</option>
                        <option value="2">2 options</option>
                        <option value="3">3 options</option>
                        <option value="4">4 options</option>
                      </select>
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span style={PAGE.label}>Destinations</span>
                      <div style={PAGE.destinationStack}>
                        {form.destinations.map((destination, index) => (
                          <div key={`destination-${index}`} style={{ ...PAGE.destinationRow, gridTemplateColumns: isMobile ? "1fr" : PAGE.destinationRow.gridTemplateColumns }}>
                            <label>
                              <span style={PAGE.tinyText}>Country</span>
                              <select
                                style={PAGE.select}
                                value={destination.country}
                                onChange={(event) => updateDestination(index, "country", event.target.value)}
                              >
                                {COUNTRY_OPTIONS.map((country) => (
                                  <option key={country} value={country}>{country}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span style={PAGE.tinyText}>City</span>
                              <input
                                style={PAGE.input}
                                value={destination.city}
                                onChange={(event) => updateDestination(index, "city", event.target.value)}
                                placeholder="Tokyo"
                              />
                            </label>
                            <button
                              type="button"
                              style={PAGE.removeButton}
                              onClick={() => removeDestination(index)}
                              disabled={form.destinations.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <button type="button" style={{ ...PAGE.addButton, marginTop: 12 }} onClick={addDestination}>
                        Create Another Destination
                      </button>
                    </div>
                    <div>
                      <span style={PAGE.label}>Quick Style Presets</span>
                      <div style={PAGE.optionGrid}>
                        {STYLE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            style={form.travelStyle === preset ? PAGE.optionButtonActive : PAGE.optionButton}
                            onClick={() => updateField("travelStyle", preset)}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section style={PAGE.card}>
                  <div style={PAGE.cardHeader}>
                    <div style={PAGE.cardTitleWrap}>
                      <h2 style={PAGE.cardTitle}>Preferences & Budget</h2>
                      <div style={PAGE.cardIntro}>Frame the plan with budget, transport expectations, and the level of accommodation the itinerary should optimize for.</div>
                    </div>
                    <span style={PAGE.helperPill}>Shapes comparison scoring</span>
                  </div>
                  <div style={PAGE.formGrid}>
                    <label>
                      <span style={PAGE.label}>Budget</span>
                      <input style={PAGE.input} value={form.budget} onChange={(event) => updateField("budget", event.target.value)} placeholder="EUR 2500" />
                    </label>
                    <label>
                      <span style={PAGE.label}>Travel Style</span>
                      <input style={PAGE.input} value={form.travelStyle} onChange={(event) => updateField("travelStyle", event.target.value)} />
                    </label>
                    <label>
                      <span style={PAGE.label}>Transport Preference</span>
                      <select style={PAGE.select} value={form.transportPreference} onChange={(event) => updateField("transportPreference", event.target.value)}>
                        {TRANSPORT_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span style={PAGE.label}>Accommodation Level</span>
                      <select style={PAGE.select} value={form.accommodationLevel} onChange={(event) => updateField("accommodationLevel", event.target.value)}>
                        {ACCOMMODATION_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section style={PAGE.card}>
                  <div style={PAGE.cardHeader}>
                    <div style={PAGE.cardTitleWrap}>
                      <h2 style={PAGE.cardTitle}>Planning Notes</h2>
                      <div style={PAGE.cardIntro}>Use this field to tell the planner what the trip must prioritize: pace, landmarks, food, flexibility, family constraints, or business travel structure.</div>
                    </div>
                    <span style={PAGE.helperPill}>Optional but high impact</span>
                  </div>
                  <label>
                    <span style={PAGE.label}>Trip Goals</span>
                    <textarea
                      style={PAGE.textarea}
                      value={form.tripGoals}
                      onChange={(event) => updateField("tripGoals", event.target.value)}
                      placeholder="Describe what the itinerary must optimize for: pacing, cuisine, weather flexibility, local neighborhoods, mobility constraints, or key stops."
                    />
                  </label>
                </section>

                <section style={PAGE.card}>
                  <div style={PAGE.submitRow}>
                    <div style={PAGE.submitHelper}>
                      {error || "Generate one or more saved trip options, compare them on this page, then open the strongest version as a full trip record."}
                    </div>
                    <button type="button" style={loading ? PAGE.primaryButtonMuted : PAGE.primaryButton} onClick={submitPreview} disabled={loading}>
                      {loading ? "Generating Trip Options..." : "Generate Trip Proposal"}
                    </button>
                  </div>
                  {error ? <div style={{ ...PAGE.error, marginTop: 16 }}>{error}</div> : null}
                </section>
              </>
            ) : (
              <>
                <section style={PAGE.detailCard}>
                  <div style={PAGE.resultHeader}>
                    <div style={PAGE.resultTop}>
                      <div>
                        <h2 style={PAGE.resultTitle}>{selectedOption ? (selectedOption.title || selectedOption.savedTrip.title) : "Generated Trip"}</h2>
                        <div style={{ ...PAGE.resultText, marginTop: 8 }}>
                          {generatedOptions.length > 1
                            ? "Each generated option is already saved to your private AI archive. Compare them below, then choose the winner to surface in your dashboard archive."
                            : "Your AI-generated itinerary has been saved and can be reopened from the dashboard at any time."}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" style={PAGE.secondaryButton} onClick={() => { setResult(null); setPreferredMessage(""); setError(""); }}>Build Another Trip</button>
                        <Link href="/dashboard" style={PAGE.secondaryButton}>Open Archive</Link>
                      </div>
                    </div>

                    <div style={PAGE.resultBadgeRow}>
                      <span style={PAGE.resultBadge}>{selectedOption && selectedOption.summary ? selectedOption.summary.route : "Generated route"}</span>
                      <span style={PAGE.resultBadge}>{selectedOption && selectedOption.summary ? selectedOption.summary.dates : "Flexible dates"}</span>
                      <span style={PAGE.resultBadge}>{selectedOption && selectedOption.compare ? selectedOption.compare.budget : form.budget}</span>
                      <span style={PAGE.accentBadge}>{generatedOptions.length} saved option{generatedOptions.length === 1 ? "" : "s"}</span>
                    </div>

                    {preferredMessage ? (
                      <div style={{ ...PAGE.disclaimer, marginBottom: 0 }}>
                        <div style={PAGE.disclaimerIcon}>i</div>
                        <div>
                          <div style={PAGE.disclaimerTitle}>Status</div>
                          <div style={PAGE.disclaimerText}>{preferredMessage}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section style={PAGE.card}>
                  <div style={PAGE.cardHeader}>
                    <div style={PAGE.cardTitleWrap}>
                      <h2 style={PAGE.cardTitle}>Compare Options</h2>
                      <div style={PAGE.cardIntro}>Review route, budget, style, transport, and score tradeoffs before selecting the option that should become the preferred AI winner.</div>
                    </div>
                    <span style={PAGE.helperPill}>Comparison first</span>
                  </div>
                  <div style={PAGE.compareGrid}>
                    {generatedOptions.map((option) => {
                      const isSelected = optionId(option) === optionId(selectedOption);
                      const scores = option.compare && option.compare.scores ? option.compare.scores : { pace: 7, value: 7, flexibility: 7, overall: 7 };
                      return (
                        <article key={option.savedTrip.id} style={isSelected ? PAGE.compareCardActive : PAGE.compareCard}>
                          <div style={PAGE.compareEyebrow}>Option {option.optionNumber} · {option.compare ? option.compare.focus : "Generated plan"}</div>
                          <h3 style={PAGE.compareTitle}>{option.title || option.savedTrip.title}</h3>
                          {option.savedTrip && option.savedTrip.isPreferred ? <div style={PAGE.winnerBadge}>Preferred winner</div> : null}

                          <div style={PAGE.metricGrid}>
                            <div style={PAGE.metric}>
                              <div style={PAGE.metricLabel}>Route</div>
                              <div style={PAGE.metricText}>{option.summary ? option.summary.route : "Route not available"}</div>
                            </div>
                            <div style={PAGE.metric}>
                              <div style={PAGE.metricLabel}>Dates & Duration</div>
                              <div style={PAGE.metricText}>{option.summary ? option.summary.dates : "Flexible dates"} · {option.compare ? option.compare.duration : "Duration pending"}</div>
                            </div>
                            <div style={PAGE.metric}>
                              <div style={PAGE.metricLabel}>Budget</div>
                              <div style={PAGE.metricText}>{option.compare ? option.compare.budget : form.budget}</div>
                            </div>
                            <div style={PAGE.metric}>
                              <div style={PAGE.metricLabel}>Style</div>
                              <div style={PAGE.metricText}>{option.compare ? option.compare.style : form.travelStyle}</div>
                            </div>
                            <div style={PAGE.metric}>
                              <div style={PAGE.metricLabel}>Transport</div>
                              <div style={PAGE.metricText}>{option.compare ? option.compare.transport : form.transportPreference}</div>
                            </div>
                          </div>

                          <div style={{ ...PAGE.metric, marginTop: 2 }}>
                            <div style={PAGE.metricLabel}>Scores</div>
                            <div style={PAGE.scoreGrid}>
                              {[
                                { label: "Pace", value: scores.pace },
                                { label: "Value", value: scores.value },
                                { label: "Flex", value: scores.flexibility },
                                { label: "Overall", value: scores.overall },
                              ].map((score) => (
                                <div key={score.label} style={PAGE.scoreRow}>
                                  <div style={PAGE.scoreLabel}>{score.label}</div>
                                  <div style={PAGE.scoreTrack}><div style={{ ...PAGE.scoreFill, width: `${Math.max(0, Math.min(Number(score.value) * 10, 100))}%` }} /></div>
                                  <div style={PAGE.scoreValue}>{String(score.value)}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={PAGE.compareActionRow}>
                            <button type="button" style={PAGE.secondaryButton} onClick={() => { setSelectedOptionId(option.savedTrip.id); setSelectedDayIndex(0); }}>Review Details</button>
                            <Link href={`/trips/${option.savedTrip.id}`} style={PAGE.secondaryButton}>Open Saved Trip</Link>
                            {option.savedTrip && option.savedTrip.isPreferred ? (
                              <span style={PAGE.winnerBadge}>Current winner</span>
                            ) : (
                              <button
                                type="button"
                                style={selectingTripId === option.savedTrip.id ? PAGE.winnerButtonMuted : PAGE.winnerButton}
                                onClick={() => markPreferred(option.savedTrip.id)}
                                disabled={selectingTripId === option.savedTrip.id}
                              >
                                {selectingTripId === option.savedTrip.id ? "Updating..." : "Pick Winner"}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                {bookingLinks.length ? (
                  <section style={PAGE.card}>
                    <div style={PAGE.cardHeader}>
                      <div style={PAGE.cardTitleWrap}>
                        <h2 style={PAGE.cardTitle}>Book With Partners</h2>
                        <div style={PAGE.cardIntro}>Keep trip discovery on TravelRecord, then hand the traveler off to affiliate or partner booking pages when they are ready to purchase.</div>
                      </div>
                      <span style={PAGE.helperPill}>External booking handoff</span>
                    </div>
                    <div style={PAGE.bookingGrid}>
                      {bookingLinks.map((link) => (
                        <article key={link.key} style={PAGE.bookingCard}>
                          <div style={PAGE.bookingMeta}>{link.partnerLabel}</div>
                          <div style={PAGE.bookingTitle}>{link.label}</div>
                          <div style={PAGE.bookingText}>{link.description}</div>
                          <a href={link.url} target="_blank" rel="noreferrer" style={PAGE.secondaryButton}>{link.isAffiliate ? "Book via Partner" : "Open Search"}</a>
                        </article>
                      ))}
                    </div>
                    {bookingDisclaimer ? (
                      <div style={{ ...PAGE.disclaimer, marginTop: 16, marginBottom: 0 }}>
                        <div style={PAGE.disclaimerIcon}>i</div>
                        <div>
                          <div style={PAGE.disclaimerTitle}>Booking Model</div>
                          <div style={PAGE.disclaimerText}>{bookingDisclaimer}</div>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {selectedOption ? (
                  <section style={PAGE.detailCard}>
                    <div style={PAGE.cardHeader}>
                      <div style={PAGE.cardTitleWrap}>
                        <h2 style={PAGE.cardTitle}>Day-by-Day Review</h2>
                        <div style={PAGE.cardIntro}>Switch between days for the selected option and review the generated structure before you open the saved trip detail page.</div>
                      </div>
                      <span style={PAGE.helperPill}>{selectedOption.compare ? selectedOption.compare.focus : "Generated itinerary"}</span>
                    </div>

                    <div style={PAGE.tabRow}>
                      {(selectedOption.itinerary || []).map((item, index) => (
                        <button
                          key={`${selectedOption.savedTrip.id}-${index}`}
                          type="button"
                          style={selectedDayIndex === index ? PAGE.tabActive : PAGE.tab}
                          onClick={() => setSelectedDayIndex(index)}
                        >
                          {item.day || `Day ${index + 1}`}
                        </button>
                      ))}
                    </div>

                    {selectedDay ? (
                      <div style={{ ...PAGE.dayGrid, gridTemplateColumns: isCompact ? "1fr" : PAGE.dayGrid.gridTemplateColumns }}>
                        <article style={PAGE.dayCard}>
                          <div style={PAGE.dayEyebrow}>{selectedDay.day || `Day ${selectedDayIndex + 1}`}</div>
                          <h3 style={PAGE.dayTitle}>{selectedDay.title || "Planned itinerary block"}</h3>
                          <div style={PAGE.dayText}>{selectedDay.description || "No description available for this segment."}</div>
                        </article>

                        <aside style={PAGE.dayMetaStack}>
                          <div style={PAGE.dayMeta}>
                            <div style={PAGE.dayMetaLabel}>Current Option</div>
                            <div style={PAGE.dayMetaText}>{selectedOption.title || selectedOption.savedTrip.title}</div>
                          </div>
                          <div style={PAGE.dayMeta}>
                            <div style={PAGE.dayMetaLabel}>Classifications</div>
                            <div style={PAGE.dayMetaText}>{selectedOption.compare && selectedOption.compare.classifications && selectedOption.compare.classifications.length ? selectedOption.compare.classifications.join(", ") : "AI Generated"}</div>
                          </div>
                          <div style={PAGE.dayMeta}>
                            <div style={PAGE.dayMetaLabel}>Accommodation Direction</div>
                            <div style={PAGE.dayMetaText}>{selectedOption.compare ? selectedOption.compare.accommodation : form.accommodationLevel}</div>
                          </div>
                          <div style={PAGE.dayMeta}>
                            <div style={PAGE.dayMetaLabel}>Transport Direction</div>
                            <div style={PAGE.dayMetaText}>{selectedOption.compare ? selectedOption.compare.transport : form.transportPreference}</div>
                          </div>
                        </aside>
                      </div>
                    ) : (
                      <div style={PAGE.error}>No itinerary details are available for the selected option.</div>
                    )}
                  </section>
                ) : null}
              </>
            )}
          </div>

          <aside style={PAGE.stack}>
            <section style={PAGE.sidebarCard}>
              <h2 style={PAGE.sidebarTitle}>Planning Notes</h2>
              <div style={PAGE.sidebarText}>The backend still expects a single destination country and the existing travel brief fields. This update focuses on layout and readability rather than changing the AI request contract.</div>
            </section>

            <section style={PAGE.sidebarCard}>
              <h2 style={PAGE.sidebarTitle}>Current Inputs</h2>
              <div style={PAGE.sidebarText}>Departure: {buildDepartureLabel(form) || "Not set"}</div>
              <div style={{ ...PAGE.sidebarText, marginTop: 8 }}>Destinations: {summarizeDestinations(form.destinations) || "Not set"}</div>
              <div style={{ ...PAGE.sidebarText, marginTop: 8 }}>Budget: {form.budget || "Not set"}</div>
              <div style={{ ...PAGE.sidebarText, marginTop: 8 }}>Transport: {form.transportPreference || "Not set"}</div>
            </section>

            <section style={PAGE.sidebarCard}>
              <h2 style={PAGE.sidebarTitle}>Archive Flow</h2>
              <div style={PAGE.sidebarText}>Generated options are still saved automatically by the backend preview endpoint, so the redesigned page continues to feed the dashboard archive and preferred-trip workflow you already have.</div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
