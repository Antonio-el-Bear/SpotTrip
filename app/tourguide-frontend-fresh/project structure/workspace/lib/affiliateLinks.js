function normalizeUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(String(value)).toString();
  } catch {
    return null;
  }
}

function applyAffiliateTemplate(template, targetUrl) {
  var safeTemplate = normalizeUrl(template);
  var safeTarget = normalizeUrl(targetUrl);

  if (!safeTemplate || !safeTarget) {
    return null;
  }

  if (safeTemplate.indexOf("{url}") !== -1) {
    return safeTemplate.replace("{url}", encodeURIComponent(safeTarget));
  }

  return safeTemplate + encodeURIComponent(safeTarget);
}

function buildTripadvisorQueryUrl(query) {
  if (!query) {
    return null;
  }

  return "https://www.tripadvisor.com/Search?q=" + encodeURIComponent(String(query).trim());
}

function compactParts(parts) {
  return parts.filter(function(part) {
    return Boolean(part && String(part).trim());
  }).map(function(part) {
    return String(part).trim();
  });
}

export function buildTripadvisorSearchUrl(details) {
  var parts = [];
  var name = details && details.name ? String(details.name).trim() : "";
  var address = details && details.address ? String(details.address).trim() : "";
  var category = details && details.category ? String(details.category).trim() : "";

  if (name) {
    parts.push(name);
  }
  if (address) {
    parts.push(address);
  }
  if (category) {
    parts.push(category);
  }

  if (!parts.length) {
    return null;
  }

  return buildTripadvisorQueryUrl(parts.join(" "));
}

export function buildTripadvisorLinks(details) {
  var tripadvisorLink = buildTripadvisorSearchUrl(details);

  return {
    tripadvisorLink: tripadvisorLink,
    affiliateLink: applyAffiliateTemplate(process.env.TRIPADVISOR_AFFILIATE_BASE_URL, tripadvisorLink),
    affiliateProvider: process.env.TRIPADVISOR_AFFILIATE_BASE_URL ? "tripadvisor" : null,
  };
}

export function buildTourAffiliateLink(targetUrl) {
  var template = process.env.TOURS_AFFILIATE_BASE_URL || process.env.VIATOR_AFFILIATE_BASE_URL || process.env.AMADEUS_ACTIVITIES_AFFILIATE_BASE_URL;
  return applyAffiliateTemplate(template, targetUrl);
}

export function buildTripBookingLinks(details) {
  var title = details && details.title ? String(details.title).trim() : "";
  var city = details && details.city ? String(details.city).trim() : "";
  var country = details && details.country ? String(details.country).trim() : "";
  var startDate = details && details.startDate ? String(details.startDate).trim() : "";
  var destinationLabel = compactParts([city, country]).join(", ") || country || city || title || "destination";
  var hotelTarget = buildTripadvisorQueryUrl(compactParts([destinationLabel, "hotels"]).join(" "));
  var activityTarget = buildTripadvisorQueryUrl(compactParts([destinationLabel, "things to do"]).join(" "));
  var diningTarget = buildTripadvisorQueryUrl(compactParts([destinationLabel, "restaurants"]).join(" "));
  var hotelAffiliate = applyAffiliateTemplate(process.env.HOTELS_AFFILIATE_BASE_URL || process.env.TRIPADVISOR_AFFILIATE_BASE_URL, hotelTarget);
  var activityAffiliate = applyAffiliateTemplate(process.env.ACTIVITIES_AFFILIATE_BASE_URL || process.env.TOURS_AFFILIATE_BASE_URL || process.env.TRIPADVISOR_AFFILIATE_BASE_URL, activityTarget);
  var diningAffiliate = applyAffiliateTemplate(process.env.RESTAURANTS_AFFILIATE_BASE_URL || process.env.TRIPADVISOR_AFFILIATE_BASE_URL, diningTarget);

  return {
    destinationLabel: destinationLabel,
    departureDate: startDate || null,
    links: [
      {
        key: "hotels",
        label: "Book Hotels",
        description: "Send travelers to partner hotel listings for this destination.",
        url: hotelAffiliate || hotelTarget,
        partnerLabel: hotelAffiliate ? "Affiliate hotel partner" : "Tripadvisor search",
        isAffiliate: Boolean(hotelAffiliate),
      },
      {
        key: "activities",
        label: "Book Activities",
        description: "Route travelers to tours and attraction booking options.",
        url: activityAffiliate || activityTarget,
        partnerLabel: activityAffiliate ? "Affiliate activity partner" : "Tripadvisor activities",
        isAffiliate: Boolean(activityAffiliate),
      },
      {
        key: "restaurants",
        label: "Browse Dining",
        description: "Open restaurant research and reservation discovery links.",
        url: diningAffiliate || diningTarget,
        partnerLabel: diningAffiliate ? "Affiliate dining partner" : "Tripadvisor dining",
        isAffiliate: Boolean(diningAffiliate),
      },
      {
        key: "flights",
        label: "Compare Flights",
        description: "Open the live deals page for flight and activity comparison.",
        url: "/deals",
        partnerLabel: "TravelRecord live deals",
        isAffiliate: false,
      },
    ].filter(function(item) {
      return Boolean(item.url);
    }),
  };
}