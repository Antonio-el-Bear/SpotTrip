import React from "react";
import { useRouter } from "next/router";

function postActivity(eventType, path) {
  if (typeof window === "undefined") {
    return;
  }

  var payload = {
    eventType: eventType,
    path: path,
    metadata: {
      visibilityState: document.visibilityState || "visible",
    },
  };

  fetch("/api/engagement/track/", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: eventType === "heartbeat",
  }).catch(function() {});
}

export default function ActivityTracker() {
  var router = useRouter();

  React.useEffect(function() {
    if (typeof window === "undefined") {
      return undefined;
    }

    postActivity("page_view", router.asPath || window.location.pathname || "/");
  }, [router.asPath]);

  React.useEffect(function() {
    if (typeof window === "undefined") {
      return undefined;
    }

    function sendHeartbeat() {
      if (document.visibilityState === "visible") {
        postActivity("heartbeat", router.asPath || window.location.pathname || "/");
      }
    }

    var intervalId = window.setInterval(sendHeartbeat, 60000);
    document.addEventListener("visibilitychange", sendHeartbeat);

    return function cleanup() {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", sendHeartbeat);
    };
  }, [router.asPath]);

  return null;
}