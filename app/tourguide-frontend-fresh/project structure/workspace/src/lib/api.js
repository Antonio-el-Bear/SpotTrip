function getErrorMessage(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  const keys = Object.keys(payload);
  if (!keys.length) {
    return "";
  }

  const firstValue = payload[keys[0]];
  if (Array.isArray(firstValue) && firstValue.length) {
    return String(firstValue[0]);
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return "";
}

export async function fetchJson(url, options) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...((options && options.headers) || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.indexOf("application/json") !== -1 ? await response.json() : null;

  if (!response.ok) {
    const detail = getErrorMessage(payload);
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}