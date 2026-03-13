import { getAmadeusJson, getMissingAmadeusConfig, hasAmadeusConfig } from "../../../lib/amadeus";
import { buildTourAffiliateLink } from "../../../lib/affiliateLinks";

function getAmadeusError(error, fallbackMessage) {
  if (error && error.message) {
    return error.message;
  }

  return error && error.response && error.response.result && error.response.result.errors && error.response.result.errors[0]
    ? error.response.result.errors[0].detail || fallbackMessage
    : fallbackMessage;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var lat = req.query.lat;
  var lng = req.query.lng;
  var radius = req.query.radius || "20";

  if (lat == null || lng == null) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  if (!hasAmadeusConfig()) {
    return res.status(500).json({
      error: "Missing Amadeus configuration: " + getMissingAmadeusConfig().join(", "),
    });
  }

  try {
    var response = await getAmadeusJson("/v1/shopping/activities", {
      latitude: String(lat),
      longitude: String(lng),
      radius: String(radius),
    });

    var tours = (response.data || []).map(function(activity) {
      var bookingLink = activity.bookingLink || null;
      return {
        id: activity.id,
        name: activity.name,
        description: activity.shortDescription || activity.description || "",
        price: activity.price && activity.price.amount,
        currency: activity.price && activity.price.currencyCode,
        rating: activity.rating,
        pictures: activity.pictures || [],
        bookingLink: bookingLink,
        affiliateLink: buildTourAffiliateLink(bookingLink),
        categories: activity.categories || [],
        tags: activity.tags || [],
        minimumDuration: activity.minimumDuration,
        maximumDuration: activity.maximumDuration,
      };
    });

    return res.status(200).json({ tours: tours, source: "amadeus-tours-activities", mode: "live", message: null });
  } catch (error) {
    return res.status(502).json({
      error: getAmadeusError(error, "Failed to fetch tours and activities"),
    });
  }
}