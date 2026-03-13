import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var TRIP_LEADERBOARD = [
  {
    id: 4,
    rank: 1,
    title: "Culinary Heritage Trail: Northern Spain",
    author: "Akiko Tanaka",
    countries: ["Spain"],
    classifications: ["Gastronomy Tourism", "Cultural Tourism"],
    views: "3 175"
  },
  {
    id: 5,
    rank: 2,
    title: "East African Rift Valley Expedition",
    author: "Marcus Okafor",
    countries: ["Kenya", "Tanzania"],
    classifications: ["Adventure Tourism", "Ecotourism"],
    views: "2 654"
  },
  {
    id: 6,
    rank: 3,
    title: "Silk Road Heritage: Uzbekistan Corridor",
    author: "James Worthington",
    countries: ["Uzbekistan"],
    classifications: ["Heritage Tourism", "Cultural Tourism"],
    views: "2 310"
  },
  {
    id: 7,
    rank: 4,
    title: "Sustainable Communities of the Peruvian Highlands",
    author: "Dr. Helena Vasquez",
    countries: ["Peru"],
    classifications: ["Community-based Tourism", "Sustainable Tourism"],
    views: "1 842"
  },
  {
    id: 8,
    rank: 5,
    title: "Mekong Delta Community Tourism Assessment",
    author: "Dr. Helena Vasquez",
    countries: ["Vietnam", "Cambodia"],
    classifications: ["Community-based Tourism", "Ecotourism"],
    views: "1 520"
  }
];

var AUTHOR_LEADERBOARD = [
  { rank: 1, name: "Akiko Tanaka", contribution: "31 trips", metric: "Top gastronomy contributor" },
  { rank: 2, name: "Dr. Helena Vasquez", contribution: "24 trips", metric: "Highest sustainability coverage" },
  { rank: 3, name: "James Worthington", contribution: "18 trips", metric: "Top heritage documentation" },
  { rank: 4, name: "Marcus Okafor", contribution: "15 trips", metric: "Top adventure fieldwork" }
];

var COUNTRIES = ["All Countries", "Spain", "Kenya", "Tanzania", "Uzbekistan", "Peru", "Vietnam", "Cambodia"];
var CLASSIFICATIONS = ["All Classifications", "Gastronomy Tourism", "Cultural Tourism", "Adventure Tourism", "Ecotourism", "Heritage Tourism", "Community-based Tourism", "Sustainable Tourism"];

var S = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#111827" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "36px 24px 56px" },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: "#111827", margin: 0, marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 760, margin: 0 },
  tabs: { display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" },
  tab: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 800, color: "#374151", cursor: "pointer" },
  tabActive: { background: "#d4a017", border: "1px solid #d4a017", borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer" },
  filterPanel: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 22, boxShadow: "0 20px 60px rgba(15,23,42,0.06)", marginBottom: 22 },
  filterRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14, alignItems: "end" },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280" },
  select: { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff", color: "#111827", fontSize: 14, outline: "none" },
  button: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 12, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", minWidth: 160 },
  count: { fontSize: 13, color: "#6b7280", fontWeight: 700, marginTop: 16 },
  cards: { display: "grid", gap: 18 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 22, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  cardRow: { display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 18, alignItems: "start" },
  rank: { width: 60, height: 60, borderRadius: "16px", background: "linear-gradient(135deg, #d4a017, #b8860b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 },
  tripTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 6 },
  byline: { fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 12 },
  tagRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  countryTag: { background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999 },
  classTag: { background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.28)", color: "#9a6f00", fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999 },
  detailLink: { display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 700, color: "#111827", textDecoration: "none", borderBottom: "1px solid rgba(17,24,39,0.2)" },
  views: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  viewsLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af" },
  viewsValue: { fontSize: 28, fontWeight: 800, color: "#111827" },
  authorCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 22, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  authorRow: { display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 18, alignItems: "center" },
  authorName: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 6 },
  authorContribution: { fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 4 },
  authorMetric: { fontSize: 13, color: "#4b5563" },
  footer: { background: "#111827", color: "rgba(255,255,255,0.8)", marginTop: 36 },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" },
  footerBrand: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 10 },
  footerText: { fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.72)", maxWidth: 860, marginBottom: 22 },
  footerLinks: { display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 20 },
  footerLink: { fontSize: 13, fontWeight: 700, color: "#f3f4f6" },
  footerDisclaimer: { fontSize: 12, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", marginBottom: 18 },
  footerCopyright: { fontSize: 12, color: "rgba(255,255,255,0.5)" }
};

function tripMatchesCountry(trip, value) {
  if (value === "All Countries") {
    return true;
  }
  return trip.countries.indexOf(value) !== -1;
}

function tripMatchesClassification(trip, value) {
  if (value === "All Classifications") {
    return true;
  }
  return trip.classifications.indexOf(value) !== -1;
}

function LeaderboardPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var tabState = React.useState("Trip Leaderboard");
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];
  var draftCountryState = React.useState("All Countries");
  var draftCountry = draftCountryState[0];
  var setDraftCountry = draftCountryState[1];
  var draftClassState = React.useState("All Classifications");
  var draftClassification = draftClassState[0];
  var setDraftClassification = draftClassState[1];
  var appliedState = React.useState({ country: "All Countries", classification: "All Classifications" });
  var appliedFilters = appliedState[0];
  var setAppliedFilters = appliedState[1];
  var dataState = React.useState({ countries: COUNTRIES, classifications: CLASSIFICATIONS, tripLeaderboard: TRIP_LEADERBOARD, authorLeaderboard: AUTHOR_LEADERBOARD });
  var leaderboardData = dataState[0];
  var setLeaderboardData = dataState[1];

  React.useEffect(function() {
    var active = true;
    var params = new URLSearchParams({ country: appliedFilters.country, classification: appliedFilters.classification });

    fetchJson("/api/leaderboard/?" + params.toString())
      .then(function(data) {
        if (active) {
          setLeaderboardData(data);
        }
      })
      .catch(function() {});

    return function() {
      active = false;
    };
  }, [appliedFilters]);

  var visibleTrips = leaderboardData.tripLeaderboard;

  return CE("div", { style: S.page },
    CE(Navbar, { activeLabel: "Leaderboard" }),
    CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
      CE("header", { style: S.header },
        CE("p", { style: S.eyebrow }, "TravelRecord Rankings"),
        CE("h1", { style: S.title }, "Leaderboard"),
        CE("p", { style: S.subtitle }, "Top trips and authors ranked by views and contributions.")
      ),
      CE("div", { style: S.tabs },
        ["Trip Leaderboard", "Author Leaderboard"].map(function(item) {
          return CE("button", { key: item, type: "button", style: item === activeTab ? S.tabActive : S.tab, onClick: function() { setActiveTab(item); } }, item);
        })
      ),
      CE("section", { style: S.filterPanel },
        CE("div", { style: { ...S.filterRow, gridTemplateColumns: isCompact ? "1fr" : S.filterRow.gridTemplateColumns } },
          CE("label", { style: S.field },
            CE("span", { style: S.label }, "Country"),
            CE("select", { style: S.select, value: draftCountry, onChange: function(e) { setDraftCountry(e.target.value); } }, leaderboardData.countries.map(function(item) {
              return CE("option", { key: item, value: item }, item);
            }))
          ),
          CE("label", { style: S.field },
            CE("span", { style: S.label }, "Classification"),
            CE("select", { style: S.select, value: draftClassification, onChange: function(e) { setDraftClassification(e.target.value); } }, leaderboardData.classifications.map(function(item) {
              return CE("option", { key: item, value: item }, item);
            }))
          ),
          CE("button", { type: "button", style: S.button, onClick: function() { setAppliedFilters({ country: draftCountry, classification: draftClassification }); } }, "Apply Filters")
        ),
        activeTab === "Trip Leaderboard" ? CE("div", { style: S.count }, visibleTrips.length + " trips ranked by views") : CE("div", { style: S.count }, leaderboardData.authorLeaderboard.length + " authors ranked by contributions")
      ),
      activeTab === "Trip Leaderboard"
        ? CE("section", { style: S.cards },
            visibleTrips.map(function(trip) {
              return CE("article", { key: trip.rank, style: S.card },
                CE("div", { style: { ...S.cardRow, gridTemplateColumns: isCompact ? "1fr" : S.cardRow.gridTemplateColumns } },
                  CE("div", { style: S.rank }, String(trip.rank)),
                  CE("div", null,
                    CE("h2", { style: S.tripTitle }, trip.title),
                    CE("div", { style: S.byline }, "by " + trip.author),
                    CE("div", { style: S.tagRow },
                      trip.countries.map(function(item) {
                        return CE("span", { key: item, style: S.countryTag }, item);
                      }),
                      trip.classifications.map(function(item) {
                        return CE("span", { key: item, style: S.classTag }, item);
                      })
                    ),
                    trip.id ? CE(Link, { href: "/trips/" + trip.id, style: S.detailLink }, "Open trip details") : null
                  ),
                  CE("div", { style: S.views },
                    CE("div", { style: S.viewsLabel }, "Views"),
                    CE("div", { style: S.viewsValue }, trip.views)
                  )
                )
              );
            })
          )
        : CE("section", { style: S.cards },
            leaderboardData.authorLeaderboard.map(function(author) {
              return CE("article", { key: author.rank, style: S.authorCard },
                CE("div", { style: { ...S.authorRow, gridTemplateColumns: isCompact ? "1fr" : S.authorRow.gridTemplateColumns } },
                  CE("div", { style: S.rank }, String(author.rank)),
                  CE("div", null,
                    CE("h2", { style: S.authorName }, author.name),
                    CE("div", { style: S.authorContribution }, author.contribution),
                    CE("div", { style: S.authorMetric }, author.metric)
                  ),
                  CE("div", { style: S.views },
                    CE("div", { style: S.viewsLabel }, "Rank Basis"),
                    CE("div", { style: { fontSize: 14, fontWeight: 700, color: "#374151", textAlign: "right", maxWidth: 180 } }, "Views + documented contribution")
                  )
                )
              );
            })
          )
    ),
  );
}

export default LeaderboardPage;