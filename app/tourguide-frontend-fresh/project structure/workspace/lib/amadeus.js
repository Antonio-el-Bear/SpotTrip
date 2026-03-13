import Amadeus from "amadeus";

let amadeusClient;
let accessTokenValue;
let accessTokenExpiresAt = 0;

export function getMissingAmadeusConfig() {
  var missing = [];

  if (!process.env.AMADEUS_CLIENT_ID) {
    missing.push("AMADEUS_CLIENT_ID");
  }
  if (!process.env.AMADEUS_CLIENT_SECRET) {
    missing.push("AMADEUS_CLIENT_SECRET");
  }

  return missing;
}

export function hasAmadeusConfig() {
  return getMissingAmadeusConfig().length === 0;
}

function getAmadeusBaseUrl() {
  return process.env.AMADEUS_HOST === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";
}

export async function getAmadeusAccessToken() {
  var missing = getMissingAmadeusConfig();

  if (missing.length) {
    throw new Error("Missing Amadeus configuration: " + missing.join(", "));
  }

  if (accessTokenValue && Date.now() < accessTokenExpiresAt) {
    return accessTokenValue;
  }

  var tokenResponse = await fetch(getAmadeusBaseUrl() + "/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
  });
  var tokenPayload = await tokenResponse.json().catch(function() {
    return null;
  });

  if (!tokenResponse.ok || !tokenPayload || !tokenPayload.access_token) {
    throw new Error(
      tokenPayload && tokenPayload.errors && tokenPayload.errors[0] && tokenPayload.errors[0].detail
        ? tokenPayload.errors[0].detail
        : "Failed to authenticate with Amadeus"
    );
  }

  accessTokenValue = tokenPayload.access_token;
  accessTokenExpiresAt = Date.now() + (Math.max(Number(tokenPayload.expires_in) || 1800, 60) - 30) * 1000;

  return accessTokenValue;
}

export async function getAmadeusJson(path, params) {
  var token = await getAmadeusAccessToken();
  var searchParams = new URLSearchParams();

  Object.keys(params || {}).forEach(function(key) {
    var value = params[key];

    if (value != null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  var response = await fetch(getAmadeusBaseUrl() + path + "?" + searchParams.toString(), {
    headers: {
      Authorization: "Bearer " + token,
      accept: "application/json",
    },
  });
  var payload = await response.json().catch(function() {
    return null;
  });

  if (!response.ok) {
    throw new Error(
      payload && payload.errors && payload.errors[0] && payload.errors[0].detail
        ? payload.errors[0].detail
        : "Amadeus request failed"
    );
  }

  return payload;
}

export function getAmadeusClient() {
  var missing = getMissingAmadeusConfig();

  if (missing.length) {
    throw new Error("Missing Amadeus configuration: " + missing.join(", "));
  }

  if (!amadeusClient) {
    amadeusClient = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: process.env.AMADEUS_HOST || "test",
    });
  }

  return amadeusClient;
}