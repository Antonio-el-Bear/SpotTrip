import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var S = {
  btnGhost: { background: "none", border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", padding: "7px 16px", borderRadius: 8, fontFamily: "inherit" },
  btnGold: { background: "#d4a017", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  btnGoldFull: { background: "#d4a017", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" },
  btnOutline: { background: "none", border: "1px solid rgba(212,160,23,0.4)", color: "#d4a017", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" },
  hero: { background: "#1a2233", padding: "72px 0 56px" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4a017", marginBottom: 16 },
  heroTitle: { fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.08, color: "#f0f2f5", marginBottom: 16 },
  heroSub: { fontSize: 15, color: "rgba(240,242,245,0.7)", maxWidth: 580, lineHeight: 1.65, marginBottom: 28 },
  pills: { display: "flex", flexWrap: "wrap", gap: "6px 18px", marginBottom: 36 },
  pillItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(240,242,245,0.55)" },
  pillDot: { width: 5, height: 5, borderRadius: "50%", background: "#d4a017", flexShrink: 0 },
  pillBtn: { background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.35)", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  searchRow: { display: "flex", gap: 8, maxWidth: 480 },
  searchWrap: { flex: 1, position: "relative" },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(240,242,245,0.4)", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "11px 12px 11px 36px", background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f0f2f5", fontSize: 14, fontFamily: "inherit", outline: "none" },
  btnSearch: { background: "#d4a017", color: "#fff", border: "none", padding: "11px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  statsBar: { background: "#1e2a3a", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)" },
  statItem: { textAlign: "center", padding: "20px 16px", borderRight: "1px solid rgba(255,255,255,0.08)" },
  statItemLast: { textAlign: "center", padding: "20px 16px" },
  statIcon: { fontSize: 16, color: "#d4a017", marginBottom: 6 },
  statValue: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#f0f2f5" },
  statLabel: { fontSize: 11, color: "rgba(240,242,245,0.4)", marginTop: 2 },
  section: { padding: "64px 0" },
  sectionAlt: { padding: "64px 0", background: "rgba(37,48,68,0.5)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 },
  sectionTitle: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#f0f2f5" },
  sectionLink: { fontSize: 13, color: "rgba(240,242,245,0.4)", textDecoration: "none" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  tripLink: { textDecoration: "none", color: "inherit", display: "block" },
  tripCard: { background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", cursor: "pointer" },
  tripImg: { height: 160, background: "linear-gradient(135deg,#2a3a52,#1a2a3e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, position: "relative" },
  tripBadge: { position: "absolute", top: 10, left: 10, background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4 },
  tripBody: { padding: 16 },
  tripCountry: { fontSize: 11, color: "#d4a017", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 },
  tripName: { fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#f0f2f5", marginBottom: 6 },
  tripMeta: { display: "flex", gap: 12, fontSize: 11, color: "rgba(240,242,245,0.4)" },
  memberCard: { background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 20, cursor: "pointer" },
  memberAvatar: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#d4a017,#b8860b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 },
  memberName: { fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#f0f2f5", marginBottom: 4 },
  memberTrips: { fontSize: 12, color: "rgba(240,242,245,0.6)", marginBottom: 8 },
  starRow: { display: "flex", gap: 3 },
  pricingSection: { padding: "64px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
  pricingCard: { background: "#1e2a3a", border: "2px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 28, display: "flex", flexDirection: "column", position: "relative" },
  pricingCardDark: { background: "#222e42", border: "2px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 28, display: "flex", flexDirection: "column", position: "relative" },
  pricingCardFeatured: { background: "#1e2a3a", border: "2px solid rgba(212,160,23,0.5)", borderRadius: 8, padding: 28, display: "flex", flexDirection: "column", position: "relative" },
  bestBadge: { position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#d4a017", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 12, whiteSpace: "nowrap" },
  pricingEye: { fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4a017", marginBottom: 8 },
  pricingTitle: { fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#f0f2f5", marginBottom: 8 },
  pricingDesc: { fontSize: 13, color: "rgba(240,242,245,0.6)", lineHeight: 1.6, marginBottom: 16, flex: 1 },
  pricingPrice: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#f0f2f5", marginBottom: 4 },
  pricingNote: { fontSize: 10, color: "rgba(240,242,245,0.4)", marginBottom: 18 },
  priceSub: { fontSize: 13, fontWeight: 400, color: "rgba(240,242,245,0.4)" },
  aiSection: { background: "#1a2233", padding: "64px 0" },
  aiTitle: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#f0f2f5", marginBottom: 12 },
  aiDesc: { fontSize: 14, color: "rgba(240,242,245,0.65)", lineHeight: 1.7, marginBottom: 16, maxWidth: 540 },
  aiList: { listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 6 },
  aiItem: { fontSize: 12, color: "rgba(240,242,245,0.45)", display: "flex", alignItems: "center", gap: 8 },
  ctaSection: { background: "#253044", padding: "64px 0", textAlign: "center" },
  ctaTitle: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#f0f2f5", marginBottom: 10 },
  ctaDesc: { fontSize: 14, color: "rgba(240,242,245,0.6)", maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.65 },
  overviewSection: { background: "#1a2233", padding: "64px 0" },
  overviewGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, marginTop: 32 },
  overviewItem: { borderLeft: "2px solid rgba(212,160,23,0.35)", paddingLeft: 14 },
  overviewItemTitle: { fontSize: 13, fontWeight: 700, color: "#f0f2f5", marginBottom: 4 },
  overviewItemDesc: { fontSize: 12, color: "rgba(240,242,245,0.45)", lineHeight: 1.65 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modalBox: { background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 32, maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto" },
};

var TRIPS = [
  { id: 1, emoji: "🇯🇵", country: "Japan", name: "Tokyo & Kyoto Explorer", days: "14 days", type: "Cultural", month: "March 2024" },
  { id: 2, emoji: "🇵🇪", country: "Peru", name: "Inca Trail & Sacred Valley", days: "10 days", type: "Adventure", month: "June 2024" },
  { id: 3, emoji: "🇳🇴", country: "Norway", name: "Fjords & Northern Lights", days: "8 days", type: "Nature", month: "Jan 2024" }
];

var MEMBERS = [
  { id: 1, initial: "MV", name: "Marco Visconti", trips: 47, star: 5, specialty: "Europe & Asia" },
  { id: 2, initial: "SL", name: "Sarah Lin", trips: 31, star: 4, specialty: "South America" },
  { id: 3, initial: "JP", name: "James Patel", trips: 58, star: 5, specialty: "Middle East & Africa" }
];

var DEFAULT_HOME_DATA = {
  stats: {
    documentedTrips: 2840,
    registeredMembers: 1120,
    countriesCovered: 147,
  },
  featuredTrips: TRIPS,
  featuredExperts: MEMBERS.map(function(member) {
    return {
      id: member.id,
      initials: member.initial,
      name: member.name,
      trip_count_display: member.trips,
      star_rating: member.star,
      specialty: member.specialty,
    };
  }),
};

var PILLS = ["Structured Travel Knowledge Repository", "Comprehensive Trip Records", "Access to Experienced Travellers", "Practical Trip Planning Support", "Searchable and Decision-Oriented", "Professional Information Environment", "Direct Expert Engagement"];
var OVERVIEW = [
  { title: "Structured Travel Knowledge Repository", desc: "An organized platform that documents travel experiences curated by passionate travellers and independent travel consultants." },
  { title: "Comprehensive Trip Records", desc: "Members can explore detailed travel documentation including itineraries, cost, attractions, logistics, and practical planning information." },
  { title: "Access to Experienced Travellers", desc: "Engage with individuals who have completed the documented trips and may be available to provide guidance or consultation." },
  { title: "Practical Trip Planning Support", desc: "The platform supports users in designing and organizing personalized travel experiences based on real documented journeys." },
  { title: "Searchable and Decision-Oriented", desc: "Trips are systematically presented and searchable by relevant criteria, enabling users to identify suitable travel experiences efficiently." },
  { title: "Professional Information Environment", desc: "Not a social network or blog. Its primary purpose is the structured presentation of travel knowledge to support informed decision-making." },
  { title: "Direct Expert Engagement", desc: "Where appropriate, users may contact the authors of documented travel experiences for practical insights and expert guidance." },
  { title: "Monetise Your Travel Expertise", desc: "Experienced travelers can offer paid consultancy services through their profile, set hourly or per-trip rates, and use priority listing to boost visibility." }
];

var MODAL = [
  { title: "Travel Consultancy", body: "Offer paid consultancy services directly through your member profile. Set your hourly or per-trip rate and let subscribers contact you for personalised travel advice." },
  { title: "Priority Listing", body: "Invest in priority listing slots (35 EUR/slot/year) to ensure your documented trips appear prominently when users search for your specialised countries and classifications." },
  { title: "Reputation Building", body: "Build a data-driven portfolio of travel experience. Your star rating (1-5), trip count, and member ratings serve as credibility signals that attract clients." },
  { title: "How It Works Together", body: "Document your trips, build your star rating, activate consultancy on your profile, boost visibility with priority listing. Subscribers discover your expertise and contact you directly." }
];

function HomePage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var router = useRouter();
  var qs = React.useState("");
  var query = qs[0];
  var setQuery = qs[1];
  var hs = React.useState(DEFAULT_HOME_DATA);
  var homeData = hs[0];
  var setHomeData = hs[1];
  var mo = React.useState(false);
  var modalOpen = mo[0];
  var setModalOpen = mo[1];

  React.useEffect(function() {
    var active = true;
    fetchJson("/api/home/")
      .then(function(data) {
        if (active) {
          setHomeData(data);
        }
      })
      .catch(function() {});

    return function() {
      active = false;
    };
  }, []);

  function openSearchResults() {
    var trimmed = query.trim();
    if (trimmed) {
      router.push("/destinations?search=" + encodeURIComponent(trimmed));
      return;
    }
    router.push("/destinations");
  }

  var heroEl = CE("section", { style: { ...S.hero, padding: isMobile ? "48px 0 40px" : S.hero.padding } },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("p", { style: S.eyebrow }, "Passionate Travel Directory"),
      CE("h1", { style: S.heroTitle }, "Structured Travel", CE("br", null), "Documentation"),
      CE("p", { style: S.heroSub }, "Not a travel blog or social network — a platform where passionate, serious travelers document their journeys."),
      CE("div", { style: S.pills },
        PILLS.map(function(f) {
          return CE("span", { key: f, style: S.pillItem }, CE("span", { style: S.pillDot }), CE("span", null, f));
        }),
        CE("span", { style: S.pillItem }, CE("span", { style: S.pillDot }), CE("button", { style: S.pillBtn, onClick: function() { setModalOpen(true); } }, "Monetise Your Travel Expertise")),
        CE("span", { style: S.pillItem }, CE("span", { style: S.pillDot }), CE(Link, { href: "/aitripbuilder", style: S.pillBtn }, "AI-Powered Trip Builder"))
      ),
      CE("div", { style: { ...S.searchRow, flexDirection: isMobile ? "column" : "row", maxWidth: isMobile ? "100%" : 480 } },
        CE("div", { style: S.searchWrap },
          CE("span", { style: S.searchIcon }, "🔍"),
          CE("input", { style: S.searchInput, placeholder: "Search destinations, trips, members...", value: query, onChange: function(e) { setQuery(e.target.value); } })
        ),
        CE("button", { style: S.btnSearch, onClick: openSearchResults }, "Search")
      )
    )
  );

  var statsEl = CE("section", { style: S.statsBar },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("div", { style: { ...S.statsGrid, gridTemplateColumns: isCompact ? "1fr" : S.statsGrid.gridTemplateColumns } }, [{ icon: "📄", label: "Documented Trips", value: String(homeData.stats.documentedTrips) }, { icon: "👥", label: "Registered Members", value: String(homeData.stats.registeredMembers) }, { icon: "🌍", label: "Countries Covered", value: String(homeData.stats.countriesCovered) }].map(function(s, i) {
        return CE("div", { key: s.label, style: i === 2 ? S.statItemLast : S.statItem }, CE("div", { style: S.statIcon }, s.icon), CE("div", { style: S.statValue }, s.value), CE("div", { style: S.statLabel }, s.label));
      }))
    )
  );

  var tripsEl = CE("section", { style: S.section },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("div", { style: S.sectionHeader }, CE("div", null, CE("p", { style: { ...S.eyebrow, marginBottom: 6 } }, "Recently Documented"), CE("h2", { style: S.sectionTitle }, "Featured Trips")), CE(Link, { href: "/destinations", style: S.sectionLink }, "View all →")),
      CE("div", { style: { ...S.cardsGrid, gridTemplateColumns: isCompact ? "1fr" : S.cardsGrid.gridTemplateColumns } }, homeData.featuredTrips.map(function(t) {
        return CE(Link, { key: t.id, href: "/trips/" + t.id, style: S.tripLink }, CE("div", { style: S.tripCard }, CE("div", { style: S.tripImg }, CE("span", null, t.icon || t.emoji), CE("span", { style: S.tripBadge }, t.type_label || t.type)), CE("div", { style: S.tripBody }, CE("div", { style: S.tripCountry }, t.country), CE("div", { style: S.tripName }, t.title || t.name), CE("div", { style: S.tripMeta }, CE("span", null, "📅 " + (t.duration || t.days)), CE("span", null, "✈️ " + (t.month_label || t.month))))));
      }))
    )
  );

  var membersEl = CE("section", { style: S.sectionAlt },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("div", { style: S.sectionHeader }, CE("div", null, CE("p", { style: { ...S.eyebrow, marginBottom: 6 } }, "Experienced Authors"), CE("h2", { style: S.sectionTitle }, "Featured Trip Authors")), CE(Link, { href: "/members", style: S.sectionLink }, "View all →")),
      CE("div", { style: { ...S.cardsGrid, gridTemplateColumns: isCompact ? "1fr" : S.cardsGrid.gridTemplateColumns } }, homeData.featuredExperts.map(function(m) {
        var stars = [];
        for (var i = 0; i < 5; i += 1) {
          stars.push(CE("span", { key: i, style: { fontSize: 14, opacity: i < (m.star_rating || m.star) ? 1 : 0.2 } }, "★"));
        }
        return CE("div", { key: m.id, style: S.memberCard }, CE("div", { style: S.memberAvatar }, m.initials || m.initial), CE("div", { style: S.memberName }, m.name), CE("div", { style: S.memberTrips }, (m.trip_count_display || m.trips) + " documented trips · " + m.specialty), CE("div", { style: S.starRow }, stars));
      }))
    )
  );

  var pricingEl = CE("section", { style: S.pricingSection },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("div", { style: { textAlign: "center", marginBottom: 36 } }, CE("p", { style: S.eyebrow }, "Membership Options"), CE("h2", { style: { ...S.sectionTitle, marginBottom: 8 } }, "Subscribe, Boost, or Both"), CE("p", { style: { fontSize: 14, color: "rgba(240,242,245,0.6)", maxWidth: 440, margin: "0 auto" } }, "Three flexible options — subscribe, boost your trips, or get both in a single checkout.")),
      CE("div", { style: { ...S.pricingGrid, gridTemplateColumns: isCompact ? "1fr" : S.pricingGrid.gridTemplateColumns } },
        CE("div", { style: S.pricingCard }, CE("div", { style: { fontSize: 20, marginBottom: 6 } }, "👥"), CE("p", { style: S.pricingEye }, "Subscription"), CE("h3", { style: S.pricingTitle }, "Premium Membership"), CE("p", { style: S.pricingDesc }, "Full access to member profiles, detailed itineraries, travel maps, contact information, and private messaging."), CE("div", { style: S.pricingPrice }, "€35", CE("span", { style: S.priceSub }, "/year")), CE("p", { style: S.pricingNote }, "One-time annual payment · No auto-renewal"), CE(Link, { href: "/pricing?plan=subscription", style: S.btnGoldFull }, "Subscribe Now")),
        CE("div", { style: S.pricingCardDark }, CE("div", { style: { fontSize: 20, marginBottom: 6 } }, "⭐"), CE("p", { style: S.pricingEye }, "Priority Listing"), CE("h3", { style: S.pricingTitle }, "Boost Your Trips in Search"), CE("p", { style: S.pricingDesc }, "Get your documented trips to the top of search results. Reach more travellers and attract consultancy enquiries."), CE("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "rgba(240,242,245,0.4)", marginBottom: 16 } }, CE("span", null, "📈 Top placement"), CE("span", null, "🌍 2 countries + 2 classifications/slot")), CE("div", { style: S.pricingPrice }, "€35", CE("span", { style: S.priceSub }, "/slot/year")), CE("p", { style: S.pricingNote }, "Independent from subscription · Add as many slots as needed"), CE(Link, { href: "/pricing?plan=priority", style: S.btnOutline }, "Get Priority Listing")),
        CE("div", { style: S.pricingCardFeatured }, CE("div", { style: S.bestBadge }, "Best Value"), CE("div", { style: { fontSize: 20, marginBottom: 6 } }, "📦"), CE("p", { style: S.pricingEye }, "Both"), CE("h3", { style: S.pricingTitle }, "Subscribe + Boost"), CE("p", { style: S.pricingDesc }, "Get premium membership and priority listing together in a single checkout. Full access plus top placement in search results."), CE("div", { style: S.pricingPrice }, "€70", CE("span", { style: S.priceSub }, "+/year")), CE("p", { style: S.pricingNote }, "€35 subscription + €35/slot · One checkout"), CE(Link, { href: "/pricing?plan=bundle", style: S.btnGoldFull }, "Get Both"))
      )
    )
  );

  var aiEl = CE("section", { style: S.aiSection },
    CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } },
      CE("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } }, CE("span", { style: { fontSize: 18 } }, "✨"), CE("p", { style: { ...S.eyebrow, marginBottom: 0 } }, "Premium Feature")),
      CE("h2", { style: S.aiTitle }, "AI Trip Builder"),
      CE("p", { style: S.aiDesc }, "Design your ideal trip and let AI generate a complete, research-based travel plan with day-by-day itinerary, accommodation options, food recommendations, and budget breakdown."),
      CE("ul", { style: S.aiList }, ["Structured day-by-day itinerary with activities & logistics", "Up to 5 accommodation options per night at varied price ranges", "5 food recommendations per day matched to your tourism type", "Budget-aligned cost breakdown and practical travel tips", "Included with Premium Membership (35 EUR/year)"].map(function(f) {
        return CE("li", { key: f, style: S.aiItem }, CE("span", { style: { color: "#d4a017" } }, "✓"), " " + f);
      })),
      CE(Link, { href: "/aitripbuilder", style: S.btnGold }, "✨ Launch AI Trip Builder")
    )
  );

  var ctaEl = CE("section", { style: S.ctaSection }, CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } }, CE("h2", { style: S.ctaTitle }, "Document Your Travel Experience"), CE("p", { style: S.ctaDesc }, "Create a structured record of your journeys. Share itineraries, costs, and logistics with a passionate community of experienced travelers."), CE(Link, { href: "/signup?plan=subscription&next=" + encodeURIComponent("/pricing?plan=subscription&from=signup"), style: S.btnGold }, "Register as a Member")));
  var overviewEl = CE("section", { style: S.overviewSection }, CE("div", { style: { ...S.container, padding: isMobile ? "0 16px" : "0 24px" } }, CE("p", { style: S.eyebrow }, "What We Offer"), CE("h2", { style: S.sectionTitle }, "Platform Overview"), CE("div", { style: { ...S.overviewGrid, gridTemplateColumns: isCompact ? "1fr" : S.overviewGrid.gridTemplateColumns } }, OVERVIEW.map(function(item) {
    return CE("div", { key: item.title, style: S.overviewItem }, CE("p", { style: S.overviewItemTitle }, item.title), CE("p", { style: S.overviewItemDesc }, item.desc));
  }))));
  var modalEl = null;
  if (modalOpen) {
    var modalChildren = [];
    modalChildren.push(CE("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 } }, CE("h3", { style: { fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#f0f2f5" } }, "Monetise Your Travel Expertise"), CE("button", { onClick: function() { setModalOpen(false); }, style: { background: "none", border: "none", color: "rgba(240,242,245,0.4)", fontSize: 20, cursor: "pointer" } }, "×")));
    MODAL.forEach(function(section) {
      modalChildren.push(CE("div", { key: section.title, style: { marginBottom: 16 } }, CE("p", { style: { fontSize: 13, fontWeight: 700, color: "#f0f2f5", marginBottom: 4 } }, section.title), CE("p", { style: { fontSize: 12, color: "rgba(240,242,245,0.65)", lineHeight: 1.65 } }, section.body)));
    });
    modalChildren.push(CE("div", { style: { borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginTop: 4 } }, CE(Link, { href: "/pricing", style: { fontSize: 12, fontWeight: 700, color: "#d4a017", textDecoration: "none" } }, "View Subscription & Priority Listing →")));
    modalEl = CE("div", { style: S.modalOverlay, onClick: function() { setModalOpen(false); } }, CE("div", { style: S.modalBox, onClick: function(e) { e.stopPropagation(); } }, CE("div", null, ...modalChildren)));
  }

  return CE(React.Fragment, null, CE(Navbar, { activeLabel: "Search Trips", showBackButton: false }), heroEl, statsEl, tripsEl, membersEl, pricingEl, aiEl, ctaEl, overviewEl, modalEl);
}

export default HomePage;
