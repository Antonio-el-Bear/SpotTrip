import { getDemoAttractions } from "../../../lib/travelDealFixtures";
import { buildTripadvisorLinks } from "../../../lib/affiliateLinks";

var FOURSQUARE_API_VERSION = "2025-06-17";

function formatDistance(distanceInMeters) {
  var distance = Number(distanceInMeters);

  if (!Number.isFinite(distance) || distance <= 0) {
    return null;
  }

  if (distance < 1000) {
    return Math.round(distance) + " m";
  }

  return (distance / 1000).toFixed(distance >= 10000 ? 0 : 1) + " km";
}

function getPhotoUrl(photo) {
  if (!photo || !photo.prefix || !photo.suffix) {
    return null;
  }

  return photo.prefix + "original" + photo.suffix;
}

function getPlaceSummary(item) {
  if (item.tips && item.tips[0] && item.tips[0].text) {
    return item.tips[0].text;
  }

  if (item.description) {
    return item.description;
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var apiKey = process.env.FOURSQUARE_API_KEY;
  var lat = req.query.lat;
  var lng = req.query.lng;
  var radius = req.query.radius || "10";

  if (lat == null || lng == null) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  if (!apiKey) {
    return res.status(200).json({
      attractions: getDemoAttractions(lat, lng),
      source: "demo-foursquare-attractions",
      mode: "demo",
      message: "Using demo attractions until Foursquare credentials are configured: FOURSQUARE_API_KEY",
    });
  }

  try {
    var params = new URLSearchParams({
      ll: String(lat) + "," + String(lng),
      query: "tourist attraction",
      radius: String(Math.max(1000, Math.min(Number(radius) * 1000 || 10000, 100000))),
      sort: "RATING",
      limit: "12",
      fields: "fsq_id,name,categories,location,distance,website,rating,stats,photos,description,tips,link",
    });

    var response = await fetch("https://places-api.foursquare.com/places/search?" + params.toString(), {
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + apiKey,
        "X-Places-Api-Version": FOURSQUARE_API_VERSION,
      },
    });
    var payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload && payload.message ? payload.message : "Foursquare API error",
      });
    }

    var attractions = (payload.results || []).map(function(item) {
      var affiliateLinks = buildTripadvisorLinks({
        name: item.name,
        address: item.location && item.location.formatted_address ? item.location.formatted_address : "",
        category: item.categories && item.categories[0] && item.categories[0].name ? item.categories[0].name : "Attraction",
      });

      return {
        id: item.fsq_id,
        name: item.name,
        category: item.categories && item.categories[0] && item.categories[0].name ? item.categories[0].name : "Attraction",
        address: item.location && item.location.formatted_address ? item.location.formatted_address : null,
        distance: formatDistance(item.distance),
        webUrl: item.website || null,
        photo: getPhotoUrl(item.photos && item.photos[0]),
        rating: item.rating != null ? String(item.rating.toFixed ? item.rating.toFixed(1) : item.rating) : null,
        numReviews: item.stats && item.stats.total_ratings != null ? String(item.stats.total_ratings) : item.stats && item.stats.total_tips != null ? String(item.stats.total_tips) : null,
        rankingString: getPlaceSummary(item),
        foursquareLink: item.link || null,
        tripadvisorLink: affiliateLinks.tripadvisorLink,
        affiliateLink: affiliateLinks.affiliateLink,
        affiliateProvider: affiliateLinks.affiliateProvider,
      };
    });

    return res.status(200).json({ attractions: attractions, source: "foursquare-place-search", mode: "live", message: null });
  } catch {
    return res.status(200).json({
      attractions: getDemoAttractions(lat, lng),
      source: "demo-foursquare-attractions",
      mode: "fallback",
      message: "Foursquare is currently unavailable. Showing demo attractions instead.",
    });
  }
}