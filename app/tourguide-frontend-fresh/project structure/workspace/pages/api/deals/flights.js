import { getAmadeusJson, getMissingAmadeusConfig, hasAmadeusConfig } from "../../../lib/amadeus";

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

  var origin = req.query.origin;
  var destination = req.query.destination;
  var date = req.query.date;
  var adults = req.query.adults || "1";
  var max = req.query.max || "8";

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "origin, destination, and date are required" });
  }

  if (!hasAmadeusConfig()) {
    return res.status(500).json({
      error: "Missing Amadeus configuration: " + getMissingAmadeusConfig().join(", "),
    });
  }

  try {
    var response = await getAmadeusJson("/v2/shopping/flight-offers", {
      originLocationCode: String(origin).toUpperCase(),
      destinationLocationCode: String(destination).toUpperCase(),
      departureDate: String(date),
      adults: String(adults),
      max: String(max),
      currencyCode: "EUR",
    });

    var flights = (response.data || []).map(function(offer, index) {
      return {
        id: offer.id || String(index),
        airline: (offer.validatingAirlineCodes && offer.validatingAirlineCodes[0]) || (offer.itineraries && offer.itineraries[0] && offer.itineraries[0].segments[0] && offer.itineraries[0].segments[0].carrierCode) || "Airline",
        price: offer.price && offer.price.total,
        currency: offer.price && offer.price.currency,
        itinerary: (offer.itineraries || []).map(function(itinerary) {
          return {
            duration: itinerary.duration,
            segments: (itinerary.segments || []).map(function(segment) {
              return {
                departure: segment.departure && segment.departure.iataCode,
                arrival: segment.arrival && segment.arrival.iataCode,
                departureAt: segment.departure && segment.departure.at,
                arrivalAt: segment.arrival && segment.arrival.at,
                flightNumber: segment.carrierCode + " " + segment.number,
              };
            }),
          };
        }),
      };
    });

    return res.status(200).json({ flights: flights, source: "amadeus-flight-offers", mode: "live", message: null });
  } catch (error) {
    return res.status(502).json({
      error: getAmadeusError(error, "Failed to fetch flight deals"),
    });
  }
}