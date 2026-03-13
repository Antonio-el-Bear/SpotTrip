const AUTH_STORAGE_KEY = "travelrecord.session";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function deriveNameFromEmail(email) {
  const localPart = sanitizeText(email).split("@")[0] || "Member";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Member";
}

export function buildInitials(name) {
  const cleanName = sanitizeText(name);
  if (!cleanName) {
    return "TR";
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function normalizeMembership(value, fallbackStartDate) {
  if (!value || typeof value !== "object") {
    return {
      tier: "Member",
      status: "Active",
      startedAt: fallbackStartDate || new Date().toISOString().slice(0, 10),
      expiresAt: "",
      prioritySlotsTotal: 0,
      prioritySlotsUsed: 0,
      canViewStarBreakdown: false,
      hasPriorityListing: false,
      recurringPlanKey: "",
      recurringStatus: "",
    };
  }

  return {
    tier: sanitizeText(value.tier) || "Member",
    status: sanitizeText(value.status) || "Active",
    startedAt: sanitizeText(value.startedAt) || fallbackStartDate || new Date().toISOString().slice(0, 10),
    expiresAt: sanitizeText(value.expiresAt),
    prioritySlotsTotal: Number.isFinite(Number(value.prioritySlotsTotal)) ? Number(value.prioritySlotsTotal) : 0,
    prioritySlotsUsed: Number.isFinite(Number(value.prioritySlotsUsed)) ? Number(value.prioritySlotsUsed) : 0,
    canViewStarBreakdown: Boolean(value.canViewStarBreakdown),
    hasPriorityListing: Boolean(value.hasPriorityListing),
    recurringPlanKey: sanitizeText(value.recurringPlanKey),
    recurringStatus: sanitizeText(value.recurringStatus),
  };
}

export function normalizeAuthSession(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const email = sanitizeText(value.email).toLowerCase();
  const name = sanitizeText(value.name) || deriveNameFromEmail(email);
  if (!email) {
    return null;
  }

  return {
    name,
    email,
    initials: buildInitials(name),
    memberSince: sanitizeText(value.memberSince) || new Date().toISOString().slice(0, 10),
    membership: normalizeMembership(value.membership, sanitizeText(value.memberSince)),
    canManageOperations: Boolean(value.canManageOperations),
    source: sanitizeText(value.source) || "auth",
  };
}

export function readAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeAuthSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeAuthSession(value) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalized = normalizeAuthSession(value);
  if (!normalized) {
    return null;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
