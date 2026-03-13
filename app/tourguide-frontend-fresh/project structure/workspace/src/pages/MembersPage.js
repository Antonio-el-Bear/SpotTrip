import React from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { readAuthSession, writeAuthSession } from "../lib/authSession";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var MEMBERS = [
  {
    id: 1,
    initials: "DH",
    name: "Dr. Helena Vasquez",
    countries: ["Peru", "Colombia", "Ecuador", "+7"],
    trips: 24,
    bio: "Independent travel researcher with over 15 years of experience documenting sustainable tourism practices across South America and Southeast Asia. Specializes in community-based tourism assessment and ecotourism development frameworks.",
    consultancy: "Free & Paid",
    rate: "USD 45/s",
    classifications: ["Community-based Tourism", "Sustainable Tourism", "Ecotourism", "Cultural Tourism", "+2 more"]
  },
  {
    id: 2,
    initials: "JW",
    name: "James Worthington",
    countries: ["Georgia", "Armenia", "Azerbaijan", "+6"],
    trips: 18,
    bio: "Former diplomatic attaché and cultural heritage consultant. Extensive travel documentation across Central Asia and the Caucasus region, with a focus on Silk Road heritage sites and traditional craftsmanship.",
    consultancy: "Paid",
    rate: "EUR 80/s",
    classifications: ["Heritage Tourism", "Cultural Tourism", "Educational Tourism"]
  },
  {
    id: 3,
    initials: "AT",
    name: "Akiko Tanaka",
    countries: ["Japan", "South Korea", "Taiwan", "+6"],
    trips: 31,
    bio: "Gastronomy tourism specialist and culinary anthropologist. Documents food traditions, local markets, and culinary heritage across East Asia and the Mediterranean. Published author on sustainable food tourism.",
    consultancy: "Free",
    rate: "",
    classifications: ["Gastronomy Tourism", "Cultural Tourism", "Sustainable Tourism", "Heritage Tourism"]
  },
  {
    id: 4,
    initials: "MO",
    name: "Marcus Okafor",
    countries: ["Kenya", "Tanzania", "Uganda", "+5"],
    trips: 15,
    bio: "Adventure tourism planner and wilderness guide with certifications in mountaineering and river navigation. Focuses on documenting off-grid travel routes and adventure logistics across East Africa.",
    consultancy: "No consultancy",
    rate: "",
    classifications: ["Adventure Tourism", "Ecotourism", "Sustainable Tourism", "Rural Tourism"]
  }
];

var ALL_COUNTRIES = ["All countries", "Peru", "Colombia", "Ecuador", "Georgia", "Armenia", "Azerbaijan", "Japan", "South Korea", "Taiwan", "Kenya", "Tanzania", "Uganda"];
var ALL_CLASSIFICATIONS = ["All classifications", "Community-based Tourism", "Sustainable Tourism", "Ecotourism", "Cultural Tourism", "Heritage Tourism", "Educational Tourism", "Gastronomy Tourism", "Adventure Tourism", "Rural Tourism"];

var S = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#111827" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "36px 24px 56px" },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: "#111827", margin: 0, marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 720, margin: 0 },
  panel: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 22, boxShadow: "0 20px 60px rgba(15,23,42,0.06)", marginBottom: 22 },
  accessPanel: { background: "linear-gradient(135deg, #fff7ed, #fffbeb)", border: "1px solid rgba(217,119,6,0.22)", borderRadius: 18, padding: 20, boxShadow: "0 20px 60px rgba(15,23,42,0.04)", marginBottom: 22, display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", flexWrap: "wrap" },
  accessTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: 0, color: "#111827" },
  accessText: { fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: "8px 0 0" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" },
  count: { fontSize: 13, color: "#6b7280", fontWeight: 600 },
  searchRow: { display: "grid", gridTemplateColumns: "1.25fr 0.8fr 0.8fr auto", gap: 14, alignItems: "end" },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280" },
  input: { width: "100", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff", color: "#111827", fontSize: 14, outline: "none" },
  select: { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff", color: "#111827", fontSize: 14, outline: "none" },
  button: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 12, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", minWidth: 140 },
  cards: { display: "grid", gap: 18 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 22, boxShadow: "0 18px 50px rgba(15,23,42,0.05)" },
  cardTop: { display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 18, alignItems: "start" },
  avatar: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #d4a017, #b8860b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 10 },
  metaRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  metaPill: { background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 999 },
  trips: { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 10 },
  bio: { fontSize: 14, lineHeight: 1.75, color: "#4b5563", margin: 0 },
  consult: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  consultBadge: { background: "#f8fafc", border: "1px solid #d1d5db", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 800, color: "#374151" },
  consultRate: { fontSize: 14, fontWeight: 800, color: "#d4a017" },
  tagRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 },
  tag: { background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.28)", color: "#9a6f00", padding: "7px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  cardActions: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" },
  actionGroup: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap" },
  detailButton: { background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  chatButton: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  secondaryButton: { background: "#fff", color: "#111827", border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  starBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.28)", color: "#8b6500", padding: "8px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { width: "100%", maxWidth: 860, maxHeight: "85vh", overflowY: "auto", background: "#ffffff", borderRadius: 24, border: "1px solid #e5e7eb", boxShadow: "0 30px 100px rgba(15,23,42,0.24)", padding: 28 },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, marginBottom: 22 },
  modalClose: { background: "none", border: "none", color: "#6b7280", fontSize: 28, lineHeight: 1, cursor: "pointer" },
  modalGrid: { display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 22 },
  modalPanel: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18 },
  modalPanelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 10, color: "#111827" },
  modalPanelText: { fontSize: 14, lineHeight: 1.7, color: "#4b5563", margin: 0 },
  starPanel: { background: "linear-gradient(180deg, rgba(212,160,23,0.08), rgba(17,24,39,0.02))", border: "1px solid rgba(212,160,23,0.18)", borderRadius: 18, padding: 18 },
  starPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  starPanelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" },
  starPanelSub: { fontSize: 13, color: "#6b7280", margin: 0 },
  overallStar: { fontSize: 28, fontWeight: 800, color: "#8b6500" },
  starRows: { display: "grid", gap: 12, marginBottom: 16 },
  starRow: { display: "grid", gridTemplateColumns: "1.3fr 1fr auto", gap: 12, alignItems: "center" },
  starLabel: { fontSize: 13, fontWeight: 700, color: "#374151" },
  starTrack: { position: "relative", height: 10, background: "rgba(17,24,39,0.08)", borderRadius: 999, overflow: "hidden" },
  starFill: { position: "absolute", inset: 0, width: "0%", background: "linear-gradient(90deg, #d4a017, #f4cf63)", borderRadius: 999 },
  starScore: { fontSize: 12, fontWeight: 800, color: "#8b6500", minWidth: 44, textAlign: "right" },
  explanation: { fontSize: 13, lineHeight: 1.7, color: "#4b5563", margin: 0 },
  lockPanel: { background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 18, padding: 18 },
  lockTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 10, color: "#111827" },
  lockText: { fontSize: 14, lineHeight: 1.7, color: "#7c2d12", margin: 0, marginBottom: 14 },
  lockAction: { display: "inline-block", background: "#d97706", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700 },
  footer: { background: "#111827", color: "rgba(255,255,255,0.8)", marginTop: 36 },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" },
  footerBrand: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 10 },
  footerText: { fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.72)", maxWidth: 860, marginBottom: 22 },
  footerLinks: { display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 20 },
  footerLink: { fontSize: 13, fontWeight: 700, color: "#f3f4f6" },
  footerDisclaimer: { fontSize: 12, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", marginBottom: 18 },
  footerCopyright: { fontSize: 12, color: "rgba(255,255,255,0.5)" }
};

function countryPreview(countries) {
  if (!countries || countries.length <= 3) {
    return countries || [];
  }
  return countries.slice(0, 3).concat(["+" + String(countries.length - 3)]);
}

function canViewStarBreakdown(viewerAccess) {
  return !!(viewerAccess && viewerAccess.canViewStarBreakdown);
}

function getSessionViewerTier(session) {
  if (!session || !session.membership || !session.membership.tier) {
    return "Public";
  }

  return session.membership.tier;
}

function buildMessagesHref(member) {
  if (!member || !member.chat_target) {
    return "/messages";
  }

  return "/messages?userId=" + encodeURIComponent(String(member.chat_target.userId)) + "&member=" + encodeURIComponent(member.chat_target.name) + "&origin=members";
}

function canChatWithMember(member) {
  return Boolean(member && member.chat_target && member.chat_target.userId);
}

function starBarWidth(score) {
  return String(Math.max(0, Math.min(100, (score / 5) * 100))) + "%";
}

function MembersPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var router = useRouter();
  var initialSearch = typeof router.query.search === "string" ? router.query.search : "";
  var authState = React.useState(readAuthSession());
  var authSession = authState[0];
  var setAuthSession = authState[1];
  var draftSearchState = React.useState("");
  var draftSearch = draftSearchState[0];
  var setDraftSearch = draftSearchState[1];
  var draftCountryState = React.useState("All countries");
  var draftCountry = draftCountryState[0];
  var setDraftCountry = draftCountryState[1];
  var draftClassState = React.useState("All classifications");
  var draftClassification = draftClassState[0];
  var setDraftClassification = draftClassState[1];
  var appliedState = React.useState({ search: initialSearch, country: "All countries", classification: "All classifications" });
  var appliedFilters = appliedState[0];
  var setAppliedFilters = appliedState[1];
  var selectedMemberIdState = React.useState(null);
  var selectedMemberId = selectedMemberIdState[0];
  var setSelectedMemberId = selectedMemberIdState[1];
  var dataState = React.useState({
    count: MEMBERS.length,
    countries: ALL_COUNTRIES,
    classifications: ALL_CLASSIFICATIONS,
    viewerAccess: { tier: getSessionViewerTier(authSession), canViewStarBreakdown: false },
    results: MEMBERS.map(function(member) {
      return {
        id: member.id,
        initials: member.initials,
        name: member.name,
        countries_visited: member.countries,
        trip_count_display: member.trips,
        bio: member.bio,
        consultancy_mode: member.consultancy,
        consultation_rate: member.rate,
        consultancy_bio: member.bio,
        specializations: member.classifications,
        member_since: null,
        star_rating: 4,
        star_breakdown: null,
        chat_target: null,
      };
    })
  });
  var directoryData = dataState[0];
  var setDirectoryData = dataState[1];

  React.useEffect(function() {
    var active = true;

    fetchJson("/api/auth/session/")
      .then(function(data) {
        if (!active) {
          return;
        }

        if (data && data.authenticated && data.user) {
          setAuthSession(writeAuthSession(data.user) || data.user);
          return;
        }

        setAuthSession(null);
      })
      .catch(function() {
        if (active) {
          setAuthSession(readAuthSession());
        }
      });

    return function() {
      active = false;
    };
  }, []);

  React.useEffect(function() {
    setDraftSearch(initialSearch);
    setAppliedFilters(function(current) {
      if (current.search === initialSearch) {
        return current;
      }
      return { search: initialSearch, country: current.country, classification: current.classification };
    });
  }, [initialSearch]);

  React.useEffect(function() {
    var active = true;
    var params = new URLSearchParams({
      search: appliedFilters.search,
      country: appliedFilters.country,
      classification: appliedFilters.classification,
    });

    fetchJson("/api/members/?" + params.toString())
      .then(function(data) {
        if (active) {
          setDirectoryData(data);
        }
      })
      .catch(function() {});

    return function() {
      active = false;
    };
  }, [appliedFilters]);

  function openChat(member) {
    if (!authSession) {
      router.push("/login?next=" + encodeURIComponent("/members?search=" + encodeURIComponent(member.name)));
      return;
    }

    if (!canChatWithMember(member)) {
      return;
    }

    router.push(buildMessagesHref(member));
  }

  var visibleMembers = directoryData.results;
  var selectedMember = null;
  for (var index = 0; index < visibleMembers.length; index += 1) {
    if (visibleMembers[index].id === selectedMemberId) {
      selectedMember = visibleMembers[index];
      break;
    }
  }

  var starModal = null;
  if (selectedMember) {
    var canSeeStarBreakdown = canViewStarBreakdown(directoryData.viewerAccess);
    var starBreakdown = selectedMember.star_breakdown;

    starModal = CE("div", { style: S.modalOverlay, onClick: function() { setSelectedMemberId(null); } },
      CE("div", { style: S.modal, onClick: function(event) { event.stopPropagation(); } },
        CE("div", { style: S.modalHeader },
          CE("div", null,
            CE("p", { style: S.eyebrow }, "Member Profile"),
            CE("h2", { style: S.title }, selectedMember.name),
            CE("div", { style: S.metaRow },
              CE("span", { style: S.starBadge }, "★ " + String(selectedMember.star_rating || (starBreakdown ? starBreakdown.display : 0)) + "/5 stars"),
              CE("span", { style: S.metaPill }, selectedMember.trip_count_display + " trips documented"),
              CE("span", { style: S.metaPill }, selectedMember.consultancy_mode)
            ),
            CE("div", { style: { ...S.actionGroup, justifyContent: "flex-start", marginTop: 14 } },
              canChatWithMember(selectedMember)
                ? CE("button", { type: "button", style: S.chatButton, onClick: function() { openChat(selectedMember); } }, authSession ? "Chat With Member" : "Sign In To Chat")
                : CE("button", { type: "button", style: S.secondaryButton, disabled: true }, "Messaging Unavailable")
            )
          ),
          CE("button", { type: "button", style: S.modalClose, onClick: function() { setSelectedMemberId(null); } }, "×")
        ),
        CE("div", { style: { ...S.modalGrid, gridTemplateColumns: isCompact ? "1fr" : S.modalGrid.gridTemplateColumns } },
          CE("div", { style: { display: "grid", gap: 18 } },
            CE("section", { style: S.modalPanel },
              CE("h3", { style: S.modalPanelTitle }, "Profile Overview"),
              CE("p", { style: S.modalPanelText }, selectedMember.bio),
              selectedMember.consultancy_bio ? CE("p", { style: { ...S.modalPanelText, marginTop: 14 } }, selectedMember.consultancy_bio) : null,
              CE("div", { style: S.metaRow },
                countryPreview(selectedMember.countries_visited).map(function(item) {
                  return CE("span", { key: item, style: S.metaPill }, item);
                })
              ),
              CE("div", { style: S.tagRow },
                selectedMember.specializations.map(function(tag) {
                  return CE("span", { key: tag, style: S.tag }, tag);
                })
              )
            )
          ),
          CE("div", { style: { display: "grid", gap: 18 } },
            canSeeStarBreakdown && starBreakdown
              ? CE("section", { style: S.starPanel },
                  CE("div", { style: S.starPanelHeader },
                    CE("div", null,
                      CE("h3", { style: S.starPanelTitle }, "Star Rating Breakdown"),
                      CE("p", { style: S.starPanelSub }, "Subscriber-only credibility view")
                    ),
                    CE("div", { style: S.overallStar }, starBreakdown.overall.toFixed(1) + "/5")
                  ),
                  CE("div", { style: S.starRows },
                    starBreakdown.categories.map(function(category) {
                      return CE("div", { key: category.key, style: S.starRow },
                        CE("div", { style: S.starLabel }, category.label),
                        CE("div", { style: S.starTrack },
                          CE("div", { style: { ...S.starFill, width: starBarWidth(category.score) } })
                        ),
                        CE("div", { style: S.starScore }, category.score.toFixed(1) + "/5")
                      );
                    })
                  ),
                  CE("p", { style: S.explanation }, starBreakdown.explanation)
                )
              : CE("section", { style: S.lockPanel },
                  CE("h3", { style: S.lockTitle }, "Star Rating Breakdown"),
                  CE("p", { style: S.lockText }, "This credibility breakdown is reserved for Subscribers and bundle members. Upgrade to view the five weighted star categories behind each member's overall rating."),
                  CE("a", { href: "/pricing?plan=subscription", style: S.lockAction }, "Unlock with Premium Membership")
                )
          )
        )
      )
    );
  }

  return CE("div", { style: S.page },
    CE(Navbar, { activeLabel: "Members" }),
    CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
      CE("header", { style: S.header },
        CE("p", { style: S.eyebrow }, "TravelRecord Directory"),
        CE("h1", { style: S.title }, "Member Directory"),
        CE("p", { style: S.subtitle }, "Search, discover, and connect with experienced travelers who document trips in a structured, decision-oriented way.")
      ),
      CE("section", { style: S.accessPanel },
        CE("div", null,
          CE("h2", { style: S.accessTitle }, authSession ? ("Signed in as " + directoryData.viewerAccess.tier) : "Member introductions available"),
          CE("p", { style: S.accessText }, authSession
            ? "Chat actions now follow real linked member accounts where available, and premium credibility breakdown follows your real membership session instead of a query-string tier override."
            : "Browse profiles publicly, then sign in to start a member introduction and unlock session-based access controls.")
        ),
        authSession
          ? CE("button", { type: "button", style: S.secondaryButton, onClick: function() { router.push("/messages"); } }, "Open Messages")
          : CE("button", { type: "button", style: S.chatButton, onClick: function() { router.push("/login?next=/members"); } }, "Sign In To Chat")
      ),
      CE("section", { style: S.panel },
        CE("div", { style: S.topRow },
          CE("h2", { style: S.sectionTitle }, "Search Members"),
          CE("span", { style: S.count }, directoryData.count + " members found")
        ),
        CE("div", { style: { ...S.searchRow, gridTemplateColumns: isCompact ? "1fr" : S.searchRow.gridTemplateColumns } },
          CE("label", { style: S.field },
            CE("span", { style: S.label }, "Search by member name"),
            CE("input", { style: S.select, placeholder: "Search by member name...", value: draftSearch, onChange: function(e) { setDraftSearch(e.target.value); } })
          ),
          CE("label", { style: S.field },
            CE("span", { style: S.label }, "Country Visited"),
            CE("select", { style: S.select, value: draftCountry, onChange: function(e) { setDraftCountry(e.target.value); } },
              directoryData.countries.map(function(item) { return CE("option", { key: item, value: item }, item); })
            )
          ),
          CE("label", { style: S.field },
            CE("span", { style: S.label }, "Trip Classification"),
            CE("select", { style: S.select, value: draftClassification, onChange: function(e) { setDraftClassification(e.target.value); } },
              directoryData.classifications.map(function(item) { return CE("option", { key: item, value: item }, item); })
            )
          ),
          CE("button", { style: S.button, type: "button", onClick: function() { setAppliedFilters({ search: draftSearch, country: draftCountry, classification: draftClassification }); } }, "Apply Filters")
        )
      ),
      CE("section", { style: S.cards },
        visibleMembers.map(function(member) {
          return CE("article", { key: member.id, style: S.card },
            CE("div", { style: { ...S.cardTop, gridTemplateColumns: isCompact ? "1fr" : S.cardTop.gridTemplateColumns } },
              CE("div", { style: S.avatar }, member.initials),
              CE("div", null,
                CE("h3", { style: S.name }, member.name),
                CE("div", { style: S.metaRow },
                  countryPreview(member.countries_visited).map(function(item) {
                    return CE("span", { key: item, style: S.metaPill }, item);
                  })
                ),
                CE("div", { style: S.trips }, member.trip_count_display + " trips"),
                CE("p", { style: S.bio }, member.bio)
              ),
              CE("div", { style: { ...S.consult, alignItems: isCompact ? "flex-start" : "flex-end" } },
                CE("span", { style: S.consultBadge }, member.consultancy_mode),
                member.consultation_rate ? CE("span", { style: S.consultRate }, member.consultation_rate) : null
              )
            ),
            CE("div", { style: S.tagRow },
              member.specializations.map(function(tag) {
                return CE("span", { key: tag, style: S.tag }, tag);
              })
            ),
            CE("div", { style: S.cardActions },
              CE("span", { style: S.starBadge }, "★ " + String(member.star_rating || (member.star_breakdown ? member.star_breakdown.display : 0)) + "/5 stars"),
              CE("div", { style: S.actionGroup },
                canChatWithMember(member)
                  ? CE("button", { type: "button", style: S.chatButton, onClick: function() { openChat(member); } }, authSession ? "Chat With Member" : "Sign In To Chat")
                  : CE("button", { type: "button", style: S.secondaryButton, disabled: true }, "Messaging Unavailable"),
                CE("button", { type: "button", style: S.detailButton, onClick: function() { setSelectedMemberId(member.id); } }, "Open Profile")
              )
            )
          );
        })
      )
    ),
    starModal
  );
}

export default MembersPage;