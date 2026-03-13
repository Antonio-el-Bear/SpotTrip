import React from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { readAuthSession, writeAuthSession } from "../lib/authSession";
import { subscribeToMessageNotifications } from "../lib/messageNotifications";
import useViewport from "../lib/useViewport";

var CE = React.createElement;

var S = {
  page: { minHeight: "100vh", background: "#f8fafc", color: "#111827" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "36px 24px 56px" },
  hero: { marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#d4a017", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: "#111827", margin: 0, marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 760, margin: 0 },
  shell: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 22, boxShadow: "0 20px 60px rgba(15,23,42,0.06)" },
  panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 10 },
  panelText: { fontSize: 14, lineHeight: 1.7, color: "#4b5563", margin: 0 },
  notice: { background: "#fffaf0", border: "1px solid rgba(212,160,23,0.28)", borderRadius: 16, padding: 16, fontSize: 13, lineHeight: 1.7, color: "#7c5a00", marginBottom: 18 },
  error: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, padding: 16, fontSize: 13, lineHeight: 1.7, color: "#991b1b", marginBottom: 18 },
  threadList: { display: "grid", gap: 12, marginTop: 18 },
  threadCard: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff", cursor: "pointer", textAlign: "left" },
  threadCardActive: { border: "1px solid rgba(212,160,23,0.38)", borderRadius: 16, padding: 16, background: "#fffaf0", cursor: "pointer", textAlign: "left" },
  threadName: { fontSize: 16, fontWeight: 800, color: "#111827", margin: 0, marginBottom: 6 },
  threadMeta: { fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 },
  unreadBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 26, height: 26, padding: "0 8px", borderRadius: 999, background: "#d4a017", color: "#fff", fontSize: 12, fontWeight: 800 },
  messageList: { display: "grid", gap: 12, marginTop: 18, marginBottom: 18 },
  bubbleOut: { justifySelf: "end", maxWidth: "78%", background: "#111827", color: "#fff", borderRadius: 16, padding: "12px 14px" },
  bubbleIn: { justifySelf: "start", maxWidth: "78%", background: "#f3f4f6", color: "#111827", borderRadius: 16, padding: "12px 14px" },
  bubbleMeta: { fontSize: 11, opacity: 0.72, marginTop: 6 },
  composer: { display: "grid", gap: 12 },
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 14, padding: "13px 14px", fontSize: 14, color: "#111827", background: "#fff", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 150, border: "1px solid #d1d5db", borderRadius: 16, padding: "14px 16px", fontSize: 14, color: "#111827", background: "#fff", fontFamily: "inherit", resize: "vertical" },
  row: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
  primaryButton: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  secondaryButton: { background: "#fff", color: "#111827", border: "1px solid #d1d5db", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  loading: { fontSize: 14, color: "#6b7280" },
  empty: { border: "1px dashed #d1d5db", borderRadius: 18, padding: 28, textAlign: "center", color: "#6b7280" },
};

function formatStamp(value) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function getQueryUserId(router) {
  if (!router.isReady) {
    return "";
  }

  return typeof router.query.userId === "string" ? router.query.userId.trim() : "";
}

function MessagesPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var router = useRouter();
  var authState = React.useState(readAuthSession());
  var authSession = authState[0];
  var setAuthSession = authState[1];
  var loadingSessionState = React.useState(true);
  var loadingSession = loadingSessionState[0];
  var setLoadingSession = loadingSessionState[1];
  var threadsLoadingState = React.useState(false);
  var threadsLoading = threadsLoadingState[0];
  var setThreadsLoading = threadsLoadingState[1];
  var threadLoadingState = React.useState(false);
  var threadLoading = threadLoadingState[0];
  var setThreadLoading = threadLoadingState[1];
  var threadsState = React.useState([]);
  var threads = threadsState[0];
  var setThreads = threadsState[1];
  var selectedUserState = React.useState("");
  var selectedUserId = selectedUserState[0];
  var setSelectedUserId = selectedUserState[1];
  var activeThreadState = React.useState(null);
  var activeThread = activeThreadState[0];
  var setActiveThread = activeThreadState[1];
  var activeMessagesState = React.useState([]);
  var activeMessages = activeMessagesState[0];
  var setActiveMessages = activeMessagesState[1];
  var draftState = React.useState("");
  var draftMessage = draftState[0];
  var setDraftMessage = draftState[1];
  var errorState = React.useState("");
  var error = errorState[0];
  var setError = errorState[1];
  var refreshTickState = React.useState(0);
  var refreshTick = refreshTickState[0];
  var setRefreshTick = refreshTickState[1];

  function requestRefresh() {
    setRefreshTick(function(current) {
      return current + 1;
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
          setAuthSession(writeAuthSession(data.user) || data.user);
          return;
        }

        setAuthSession(null);
      })
      .catch(function() {
        if (active) {
          setAuthSession(readAuthSession());
        }
      })
      .finally(function() {
        if (active) {
          setLoadingSession(false);
        }
      });

    return function() {
      active = false;
    };
  }, []);

  React.useEffect(function() {
    if (!authSession) {
      return undefined;
    }

    return subscribeToMessageNotifications(function(event) {
      if (!event || typeof event.type !== "string" || event.type.indexOf("message.") !== 0) {
        return;
      }

      requestRefresh();
    });
  }, [authSession]);

  React.useEffect(function() {
    if (!authSession) {
      return undefined;
    }

    function handleVisibilityRefresh() {
      if (document.visibilityState === "visible") {
        requestRefresh();
      }
    }

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return function() {
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [authSession]);

  React.useEffect(function() {
    if (loadingSession || !authSession) {
      return;
    }

    var active = true;
    setThreadsLoading(true);
    fetchJson("/api/messages/threads/")
      .then(function(data) {
        if (!active) {
          return;
        }

        var nextThreads = data && Array.isArray(data.threads) ? data.threads : [];
        setThreads(nextThreads);

        var queryUserId = getQueryUserId(router);
        if (queryUserId) {
          setSelectedUserId(queryUserId);
          return;
        }

        if (nextThreads.length) {
          setSelectedUserId(String(nextThreads[0].userId));
        }
      })
      .catch(function(requestError) {
        if (active) {
          setError(requestError.message || "Unable to load message threads.");
        }
      })
      .finally(function() {
        if (active) {
          setThreadsLoading(false);
        }
      });

    return function() {
      active = false;
    };
  }, [authSession, loadingSession, router, refreshTick]);

  React.useEffect(function() {
    if (!authSession || !selectedUserId) {
      return;
    }

    var active = true;
    setThreadLoading(true);
    fetchJson("/api/messages/thread/" + selectedUserId + "/")
      .then(function(data) {
        if (!active) {
          return;
        }

        setActiveThread(data.thread || null);
        setActiveMessages(data.messages || []);
        setThreads(function(currentThreads) {
          return currentThreads.map(function(thread) {
            if (String(thread.userId) !== String(selectedUserId)) {
              return thread;
            }
            return { ...thread, unreadCount: 0, latestMessage: data.thread ? data.thread.latestMessage : thread.latestMessage, updatedAt: data.thread ? data.thread.updatedAt : thread.updatedAt };
          });
        });
      })
      .catch(function(requestError) {
        if (active) {
          setError(requestError.message || "Unable to load conversation.");
        }
      })
      .finally(function() {
        if (active) {
          setThreadLoading(false);
        }
      });

    return function() {
      active = false;
    };
  }, [authSession, selectedUserId, refreshTick]);

  function openThread(thread) {
    setSelectedUserId(String(thread.userId));
    setDraftMessage("");
  }

  function handleSend() {
    if (!activeThread || !draftMessage.trim()) {
      return;
    }

    setError("");
    fetchJson("/api/messages/thread/" + activeThread.userId + "/", {
      method: "POST",
      body: JSON.stringify({ body: draftMessage }),
    })
      .then(function(data) {
        var createdMessage = data.message;
        var updatedThread = data.thread;
        setActiveThread(updatedThread);
        setActiveMessages(function(current) {
          return current.concat([createdMessage]);
        });
        setThreads(function(currentThreads) {
          var nextThreads = currentThreads.slice();
          var existingIndex = -1;
          for (var index = 0; index < nextThreads.length; index += 1) {
            if (String(nextThreads[index].userId) === String(updatedThread.userId)) {
              existingIndex = index;
              break;
            }
          }

          if (existingIndex >= 0) {
            nextThreads.splice(existingIndex, 1);
          }
          nextThreads.unshift(updatedThread);
          return nextThreads;
        });
        setDraftMessage("");
      })
      .catch(function(requestError) {
        setError(requestError.message || "Unable to send message.");
      });
  }

  if (loadingSession) {
    return CE("div", { style: S.page },
      CE(Navbar, { activeLabel: "Dashboard" }),
      CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
        CE("section", { style: S.panel },
          CE("div", { style: S.loading }, "Loading your member messaging workspace...")
        )
      )
    );
  }

  if (!authSession) {
    return CE("div", { style: S.page },
      CE(Navbar, { activeLabel: "Dashboard" }),
      CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
        CE("section", { style: S.panel },
          CE("p", { style: S.eyebrow }, "Member messages"),
          CE("h1", { style: S.title }, "Sign in to use messages."),
          CE("p", { style: S.subtitle }, "The chat entry point is now available from member cards, but the workspace is reserved for signed-in members."),
          CE("div", { style: { marginTop: 18 } },
            CE("button", { type: "button", style: S.primaryButton, onClick: function() { router.push("/login?next=/messages"); } }, "Sign In")
          )
        )
      )
    );
  }

  return CE("div", { style: S.page },
    CE(Navbar, { activeLabel: "Dashboard" }),
    CE("main", { style: { ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding } },
      CE("header", { style: S.hero },
        CE("p", { style: S.eyebrow }, "Member messages"),
        CE("h1", { style: S.title }, "Member inbox"),
        CE("p", { style: S.subtitle }, "Use this workspace to contact members you discover in the directory. The exchange stays informational and affiliate-safe: no booking or payment flow runs through messaging.")
      ),
      CE("div", { style: { ...S.shell, gridTemplateColumns: isCompact ? "1fr" : S.shell.gridTemplateColumns } },
        CE("aside", { style: S.panel },
          CE("h2", { style: S.panelTitle }, "Threads"),
          CE("p", { style: S.panelText }, "Threads now persist on the backend and are linked to real member accounts where directory profiles have been connected."),
          CE("div", { style: S.threadList },
            threadsLoading
              ? CE("div", { style: S.loading }, "Loading threads...")
              : threads.length
              ? threads.map(function(thread) {
                  return CE("button", {
                    key: String(thread.userId),
                    type: "button",
                    style: String(thread.userId) === String(selectedUserId) ? S.threadCardActive : S.threadCard,
                    onClick: function() { openThread(thread); },
                  },
                    CE("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" } },
                      CE("p", { style: S.threadName }, thread.memberName),
                      thread.unreadCount ? CE("span", { style: S.unreadBadge }, String(thread.unreadCount)) : null
                    ),
                    CE("p", { style: S.threadMeta }, thread.latestMessage || "No messages yet."),
                    CE("p", { style: S.threadMeta }, thread.updatedAt ? ("Updated " + formatStamp(thread.updatedAt)) : "Ready to start")
                  );
                })
              : CE("div", { style: S.empty }, "Start from the Members page to open your first real conversation.")
          )
        ),
        CE("section", { style: S.panel },
          error ? CE("div", { style: S.error }, error) : null,
          activeThread
            ? CE(React.Fragment, null,
                CE("div", { style: S.notice }, "Use messages for travel context, member introductions, and advisory follow-up. Keep transactions and external bookings outside TravelRecord."),
                CE("h2", { style: S.panelTitle }, activeThread.memberName),
                CE("p", { style: S.panelText }, "Prepare a concise introduction, explain what trip context you want to learn from, and keep the exchange informational rather than transactional."),
                threadLoading
                  ? CE("div", { style: S.loading }, "Loading conversation...")
                  : CE("div", { style: S.messageList },
                  activeMessages.map(function(message, index) {
                    var bubbleStyle = message.direction === "outgoing" ? S.bubbleOut : S.bubbleIn;
                    return CE("div", { key: String(message.id || index), style: bubbleStyle },
                      CE("div", null, message.body),
                      CE("div", { style: S.bubbleMeta }, formatStamp(message.createdAt))
                    );
                  })
                ),
                CE("div", { style: S.composer },
                  CE("input", { style: S.input, value: activeThread.memberName, readOnly: true }),
                  CE("textarea", {
                    style: S.textarea,
                    value: draftMessage,
                    placeholder: "Introduce yourself, reference the trip context you care about, and ask one or two concrete questions.",
                    onChange: function(event) { setDraftMessage(event.target.value); },
                  }),
                  CE("div", { style: S.row },
                    CE("button", { type: "button", style: S.secondaryButton, onClick: function() { router.push("/members"); } }, "Find More Members"),
                    CE("button", { type: "button", style: S.primaryButton, onClick: handleSend }, "Send Message")
                  )
                )
              )
            : CE("div", { style: S.empty }, "Choose a thread from the left or start from the Members page.")
        )
      )
    )
  );
}

export default MessagesPage;