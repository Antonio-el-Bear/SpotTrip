import { buildTripBookingLinks } from "../../../lib/affiliateLinks";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var title = req.query.title || "";
  var city = req.query.city || "";
  var country = req.query.country || "";
  var startDate = req.query.startDate || "";

  var payload = buildTripBookingLinks({
    title: title,
    city: city,
    country: country,
    startDate: startDate,
  });

  return res.status(200).json({
    destinationLabel: payload.destinationLabel,
    links: payload.links,
    disclaimer: "TravelRecord does not complete payment directly. Booking actions send travelers to external affiliate or partner destinations.",
  });
}
