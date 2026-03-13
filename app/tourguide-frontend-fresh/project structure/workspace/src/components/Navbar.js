import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { clearAuthSession, readAuthSession, writeAuthSession } from "../lib/authSession";
import { fetchJson } from "../lib/api";
import { subscribeToMessageNotifications } from "../lib/messageNotifications";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var NAV = ["AI Trip Builder", "Members", "Leaderboard", "Dashboard"];

var S = {
  nav: { position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 64 },
  navStart: { display: "flex", alignItems: "center", gap: 12 },
  navLogo: { display: "flex", alignItems: "center", gap: 9, fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 800, color: "#111827", textDecoration: "none" },
  navLogoIcon: { width: 34, height: 34, background: "#d4a017", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  backButton: { background: "none", border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", padding: "7px 12px", borderRadius: 8, fontFamily: "inherit" },
  navLinks: { display: "flex", gap: 2, listStyle: "none" },
  navLink: { textDecoration: "none", fontSize: 13, fontWeight: 500, color: "#4b5563", padding: "6px 12px", borderRadius: 6 },
  navLinkActive: { textDecoration: "none", fontSize: 13, fontWeight: 600, color: "#d4a017", padding: "6px 12px", borderRadius: 6 },
  navActions: { display: "flex", gap: 8, alignItems: "center" },
  actionWrap: { position: "relative", display: "inline-flex", alignItems: "center" },
  btnGhost: { background: "none", border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", padding: "7px 16px", borderRadius: 8, fontFamily: "inherit" },
  btnGold: { background: "#d4a017", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  badge: { position: "absolute", top: -7, right: -7, minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: "#d4a017", color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(212,160,23,0.28)" },
  mobileTrigger: { background: "none", border: "none", cursor: "pointer", padding: 6, fontSize: 20, color: "#374151" },
  mobilePanel: { background: "#fff", borderTop: "1px solid #e5e7eb", padding: 16, display: "flex", flexDirection: "column", gap: 4 },
  mobileLink: { textDecoration: "none", fontSize: 15, color: "#374151", padding: "12px 16px", borderRadius: 8, fontWeight: 500 },
  mobileActions: { display: "flex", gap: 10, padding: "8px 16px", marginTop: 4 }
};

function getPath(label) {
  if (label === "About") {
    return "/about";
  }
  if (label === "AI Trip Builder") {
    return "/aitripbuilder";
  }
  if (label === "Members") {
    return "/members";
  }
  if (label === "Leaderboard") {
    return "/leaderboard";
  }
  if (label === "Dashboard") {
    return "/dashboard";
  }
  if (label === "Terms") {
    return "/terms-of-use";
  }
  if (label === "Disclaimer") {
    return "/disclaimer";
  }
  return "/";
}

function Navbar(props) {
  var router = useRouter();
  var viewport = useViewport();
  var isCompact = viewport.isTablet;
  var isMobile = viewport.isMobile;
  var activeLabel = typeof props.activeLabel === "string" ? props.activeLabel : "";
  var showBackButton = props.showBackButton !== false;
  var ms = React.useState(false);
  var menuOpen = ms[0];
  var setMenuOpen = ms[1];
  var authState = React.useState(null);
  var authUser = authState[0];
  var setAuthUser = authState[1];
  var summaryState = React.useState({ unreadMessages: 0, totalThreads: 0, totalMessages: 0 });
  var messageSummary = summaryState[0];
  var setMessageSummary = summaryState[1];
  var isOperationsUser = Boolean(authUser && authUser.canManageOperations);

  function loadMessageSummary(resetOnFailure) {
    fetchJson("/api/messages/summary/")
      .then(function(data) {
        setMessageSummary(data);
      })
      .catch(function() {
        if (resetOnFailure) {
          setMessageSummary({ unreadMessages: 0, totalThreads: 0, totalMessages: 0 });
        }
      });
  }

  React.useEffect(function() {
    var active = true;

    fetchJson("/api/auth/session/")
      .then(function(data) {
        if (!active) {
          return;
        }

        if (data && data.authenticated && data.user) {
          setAuthUser(writeAuthSession(data.user) || data.user);
          return;
        }

        clearAuthSession();
        setAuthUser(null);
        setMessageSummary({ unreadMessages: 0, totalThreads: 0, totalMessages: 0 });
      })
      .catch(function() {
        if (!active) {
          return;
        }

        setAuthUser(readAuthSession());
      });

    return function() {
      active = false;
    };
  }, []);

  React.useEffect(function() {
    if (!authUser) {
      return undefined;
    }

    loadMessageSummary(true);

    function handleVisibilityRefresh() {
      if (document.visibilityState === "visible") {
        loadMessageSummary(false);
      }
    }

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return function() {
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [authUser]);

  React.useEffect(function() {
    if (!authUser) {
      return undefined;
    }

    return subscribeToMessageNotifications(function(event) {
      if (event && event.summary) {
        setMessageSummary(event.summary);
      }
    });
  }, [authUser]);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  function handleLogout() {
    fetchJson("/api/auth/logout/", { method: "POST" })
      .catch(function() {})
      .finally(function() {
        clearAuthSession();
        setAuthUser(null);
        setMenuOpen(false);
        router.push("/login");
      });
  }

  return CE("nav", { style: S.nav },
    CE("div", { style: { ...S.navInner, padding: isMobile ? "0 12px" : "0 24px", height: isMobile ? 58 : 64 } },
      CE("div", { style: { ...S.navStart, gap: isMobile ? 8 : 12 } },
        CE(Link, { href: "/", style: { ...S.navLogo, fontSize: isMobile ? 16 : 19 } },
          CE("div", { style: { ...S.navLogoIcon, width: isMobile ? 30 : 34, height: isMobile ? 30 : 34, fontSize: isMobile ? 14 : 16 } }, "🌍"),
          isMobile ? "TR" : "TravelRecord"
        ),
        showBackButton
          ? CE("button", { type: "button", style: { ...S.backButton, padding: isMobile ? "7px 10px" : "7px 12px", fontSize: isMobile ? 12 : 13 }, onClick: goBack }, isMobile ? "←" : "← Back")
          : null
      ),
      CE("div", { style: { ...S.navActions, gap: isMobile ? 6 : 8 } },
        !isCompact
          ? CE("ul", { style: S.navLinks },
              NAV.map(function(label) {
                var href = getPath(label);
                var active = activeLabel === label;
                return CE("li", { key: label },
                  CE(Link, { href: href, style: active ? S.navLinkActive : S.navLink }, label)
                );
              })
            )
          : null,
        !isCompact && isOperationsUser
          ? CE(Link, { href: "/operations", style: S.btnGhost }, "Operations")
          : null,
        !isCompact && authUser
          ? CE("div", { style: S.actionWrap },
              CE(Link, { href: "/messages", style: S.btnGhost }, "Messages"),
              messageSummary.unreadMessages
                ? CE("span", { style: S.badge }, String(messageSummary.unreadMessages))
                : null
            )
          : null,
        !isCompact && !authUser
          ? CE(Link, { href: "/login", style: S.btnGhost }, "Sign In")
          : null,
        !isCompact && authUser
          ? CE("button", { type: "button", style: S.btnGhost, onClick: handleLogout }, "Logout")
          : !isCompact
            ? CE(Link, { href: "/signup", style: S.btnGold }, "Register")
            : null,
        isCompact
          ? CE("button", { type: "button", style: S.mobileTrigger, onClick: function() { setMenuOpen(!menuOpen); } }, menuOpen ? "✕" : "☰")
          : null
      )
    ),
    isCompact && menuOpen
      ? CE("div", { style: S.mobilePanel },
          NAV.map(function(label) {
            var href = getPath(label);
            var active = activeLabel === label;
            return CE(Link, { key: label, href: href, style: { ...S.mobileLink, background: active ? "#fef3c7" : "transparent", color: active ? "#92400e" : S.mobileLink.color }, onClick: function() { setMenuOpen(false); } }, label);
          }),
          CE("div", { style: S.mobileActions },
            isOperationsUser
              ? CE(Link, { href: "/operations", style: { ...S.btnGhost, flex: 1, textAlign: "center" }, onClick: function() { setMenuOpen(false); } }, "Operations")
              : null,
            authUser
              ? CE(Link, { href: "/messages", style: { ...S.btnGhost, flex: 1, textAlign: "center" }, onClick: function() { setMenuOpen(false); } }, messageSummary.unreadMessages ? ("Messages (" + String(messageSummary.unreadMessages) + ")") : "Messages")
              : CE(Link, { href: "/login", style: { ...S.btnGhost, flex: 1, textAlign: "center" }, onClick: function() { setMenuOpen(false); } }, "Sign In"),
            authUser
              ? CE("button", { type: "button", style: { ...S.btnGhost, flex: 1, textAlign: "center" }, onClick: handleLogout }, "Logout")
              : CE(Link, { href: "/signup", style: { ...S.btnGold, flex: 1, textAlign: "center" }, onClick: function() { setMenuOpen(false); } }, "Register")
          )
        )
      : null
  );
}

export default Navbar;