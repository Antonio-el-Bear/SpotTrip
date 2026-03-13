import React from "react";
import Navbar from "../src/components/Navbar";
import { useAttractions, useFlightDeals, useTourDeals } from "../hooks/useTravelDeals";
import useViewport from "../src/lib/useViewport";

var DESTINATIONS = [
  { label: "Barcelona", iata: "BCN", lat: 41.3851, lng: 2.1734 },
  { label: "Paris", iata: "CDG", lat: 48.8566, lng: 2.3522 },
  { label: "London", iata: "LHR", lat: 51.5074, lng: -0.1278 },
  { label: "New York", iata: "JFK", lat: 40.7128, lng: -74.0060 },
  { label: "Madrid", iata: "MAD", lat: 40.4168, lng: -3.7038 },
];

var shell = { minHeight: "100vh", background: "linear-gradient(180deg, #f8f3ea 0%, #f4efe5 50%, #eee5d7 100%)" };
var container = { maxWidth: 1180, margin: "0 auto", padding: "42px 24px 72px" };
var hero = { background: "linear-gradient(135deg, #173527 0%, #27533e 55%, #4d785d 100%)", color: "#fff", borderRadius: 28, padding: "40px 32px", boxShadow: "0 24px 70px rgba(23,53,39,0.22)", marginBottom: 30 };
var heroTitle = { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.02, margin: 0, marginBottom: 14 };
var heroText = { fontSize: 16, lineHeight: 1.8, opacity: 0.82, maxWidth: 760, marginBottom: 18 };
var heroMeta = { display: "flex", gap: 10, flexWrap: "wrap" };
var metaPill = { border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "10px 14px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, background: "rgba(255,255,255,0.08)" };
var selectorWrap = { marginBottom: 28 };
var selectorTitle = { fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#6b7280", marginBottom: 12 };
var selectorRow = { display: "flex", gap: 10, flexWrap: "wrap" };
var grid = { display: "grid", gap: 26 };
var section = { background: "rgba(255,255,255,0.78)", border: "1px solid rgba(23,53,39,0.08)", borderRadius: 24, padding: 24, boxShadow: "0 18px 44px rgba(40,37,31,0.08)" };
var sectionTitle = { fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0, marginBottom: 6, color: "#173527" };
var sectionMeta = { fontSize: 12, color: "#7a6f63", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 18 };
var controls = { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" };
var input = { padding: "12px 14px", border: "1px solid #d6d3d1", borderRadius: 12, fontSize: 14, background: "#fff", minWidth: 180 };
var primaryButton = { border: "none", borderRadius: 12, background: "#27533e", color: "#fff", padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
var cardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 };
var card = { background: "#fff", borderRadius: 18, border: "1px solid rgba(23,53,39,0.08)", overflow: "hidden", boxShadow: "0 10px 30px rgba(23,53,39,0.08)", display: "flex", flexDirection: "column" };
var cardBody = { padding: 16, display: "grid", gap: 8, flex: 1 };
var cardTag = { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, color: "#8f7e69" };
var cardTitle = { margin: 0, fontSize: 18, lineHeight: 1.35, color: "#173527" };
var cardText = { margin: 0, color: "#5f5b53", fontSize: 14, lineHeight: 1.65 };
var cardFooter = { marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
var priceText = { fontSize: 22, fontWeight: 800, color: "#27533e" };
var secondaryButton = { textDecoration: "none", borderRadius: 10, background: "#d4a017", color: "#fff", padding: "10px 14px", fontWeight: 700, fontSize: 13 };
var statusText = { color: "#7a6f63", fontSize: 14 };
var errorText = { color: "#b42318", fontSize: 14, marginBottom: 14 };
var infoText = { color: "#7a5a12", fontSize: 14, marginBottom: 14, background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", borderRadius: 12, padding: "12px 14px" };

function destinationButton(active) {
  return {
    borderRadius: 999,
    border: active ? "1px solid #27533e" : "1px solid #d6d3d1",
    background: active ? "#27533e" : "#fff",
    color: active ? "#fff" : "#173527",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  };
}

export default function DealsPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var ss = React.useState(DESTINATIONS[0]);
  var selected = ss[0];
  var setSelected = ss[1];
  var ds = React.useState("");
  var flightDate = ds[0];
  var setFlightDate = ds[1];
  var fs = React.useState(null);
  var flightSearch = fs[0];
  var setFlightSearch = fs[1];

  var flightsState = useFlightDeals({
    origin: "JNB",
    destination: flightSearch && flightSearch.iata,
    date: flightDate,
  });
  var attractionsState = useAttractions({ lat: selected.lat, lng: selected.lng });
  var toursState = useTourDeals({ lat: selected.lat, lng: selected.lng });

  function handleFlightSearch() {
    setFlightSearch(selected);
    flightsState.search();
  }

  return (
    <div style={shell}>
      <Navbar activeLabel="Deals" />
      <main style={{ ...container, padding: isMobile ? "24px 16px 56px" : container.padding }}>
        <section style={{ ...hero, padding: isMobile ? "28px 20px" : hero.padding }}>
          <h1 style={heroTitle}>Live Travel Deals</h1>
          <p style={heroText}>
            Explore flight offers, nearby attractions, and bookable tours from one page. Flights and tours are backed by Amadeus. Attractions now use Foursquare place search for ratings, photos, and category data.
          </p>
          <div style={heroMeta}>
            <span style={metaPill}>Flights via Amadeus</span>
            <span style={metaPill}>Tours via Amadeus Activities</span>
            <span style={metaPill}>Attractions via Foursquare</span>
          </div>
        </section>

        <section style={selectorWrap}>
          <div style={selectorTitle}>Choose destination</div>
          <div style={selectorRow}>
            {DESTINATIONS.map(function(destination) {
              return (
                <button
                  key={destination.iata}
                  type="button"
                  style={destinationButton(destination.iata === selected.iata)}
                  onClick={function() { setSelected(destination); }}
                >
                  {destination.label}
                </button>
              );
            })}
          </div>
        </section>

        <div style={grid}>
          <section style={section}>
            <h2 style={sectionTitle}>Flight Deals</h2>
            <div style={sectionMeta}>JNB to {selected.label} via Amadeus</div>
            <div style={{ ...controls, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }}>
              <input
                type="date"
                value={flightDate}
                onChange={function(event) { setFlightDate(event.target.value); }}
                min={new Date().toISOString().split("T")[0]}
                style={input}
              />
              <button type="button" style={primaryButton} disabled={!flightDate || flightsState.loading} onClick={handleFlightSearch}>
                {flightsState.loading ? "Searching..." : "Search Flights"}
              </button>
            </div>
            {flightsState.error ? <div style={errorText}>{flightsState.error}</div> : null}
            {flightsState.message ? <div style={infoText}>{flightsState.message}</div> : null}
            {flightsState.flights.length ? (
              <div style={cardGrid}>
                {flightsState.flights.map(function(flight) {
                  var firstSegment = flight.itinerary && flight.itinerary[0] && flight.itinerary[0].segments && flight.itinerary[0].segments[0];
                  var lastSegment = flight.itinerary && flight.itinerary[0] && flight.itinerary[0].segments && flight.itinerary[0].segments[flight.itinerary[0].segments.length - 1];
                  return (
                    <article key={flight.id} style={card}>
                      <div style={cardBody}>
                        <div style={cardTag}>{flight.airline}</div>
                        <h3 style={cardTitle}>{firstSegment ? firstSegment.departure : "Origin"} to {lastSegment ? lastSegment.arrival : "Destination"}</h3>
                        <p style={cardText}>
                          {flight.itinerary && flight.itinerary[0] ? flight.itinerary[0].duration : "Duration unavailable"}
                          {firstSegment && firstSegment.flightNumber ? " · " + firstSegment.flightNumber : ""}
                        </p>
                        <div style={cardFooter}>
                          <div>
                            <div style={cardTag}>From</div>
                            <div style={priceText}>{flight.currency} {flight.price}</div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : flightSearch && !flightsState.loading ? (
              <div style={statusText}>No flight deals found for that search.</div>
            ) : (
              <div style={statusText}>Pick a date and search to load live flight offers.</div>
            )}
          </section>

          <section style={section}>
            <h2 style={sectionTitle}>Top Attractions in {selected.label}</h2>
            <div style={sectionMeta}>Foursquare place search</div>
            {attractionsState.error ? <div style={errorText}>{attractionsState.error}</div> : null}
            {attractionsState.message ? <div style={infoText}>{attractionsState.message}</div> : null}
            {attractionsState.loading ? (
              <div style={statusText}>Loading attractions...</div>
            ) : attractionsState.attractions.length ? (
              <div style={cardGrid}>
                {attractionsState.attractions.map(function(attraction) {
                  return (
                    <article key={attraction.id} style={card}>
                      {attraction.photo ? <img src={attraction.photo} alt={attraction.name} style={{ width: "100%", height: 180, objectFit: "cover" }} /> : null}
                      <div style={cardBody}>
                        <div style={cardTag}>{attraction.category || "Attraction"}</div>
                        <h3 style={cardTitle}>{attraction.name}</h3>
                        <p style={cardText}>{attraction.rankingString || attraction.address || "Location details not provided by Foursquare."}</p>
                        {attraction.rating || attraction.numReviews ? (
                          <p style={cardText}>
                            {attraction.rating ? "Rating " + attraction.rating + "/10" : "Rated on Foursquare"}
                            {attraction.numReviews ? " · " + attraction.numReviews + " reviews" : ""}
                          </p>
                        ) : null}
                        <div style={cardFooter}>
                          <div style={cardText}>{attraction.distance ? attraction.distance + " away" : "Nearby"}</div>
                          {attraction.affiliateLink ? <a href={attraction.affiliateLink} target="_blank" rel="noreferrer" style={secondaryButton}>Tripadvisor</a> : attraction.tripadvisorLink ? <a href={attraction.tripadvisorLink} target="_blank" rel="noreferrer" style={secondaryButton}>Tripadvisor</a> : attraction.webUrl ? <a href={attraction.webUrl} target="_blank" rel="noreferrer" style={secondaryButton}>View</a> : attraction.foursquareLink ? <a href={attraction.foursquareLink} target="_blank" rel="noreferrer" style={secondaryButton}>Open</a> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div style={statusText}>No attractions returned for this destination yet.</div>
            )}
          </section>

          <section style={section}>
            <h2 style={sectionTitle}>Tours &amp; Activities in {selected.label}</h2>
            <div style={sectionMeta}>Amadeus activities with provider deep links</div>
            {toursState.error ? <div style={errorText}>{toursState.error}</div> : null}
            {toursState.message ? <div style={infoText}>{toursState.message}</div> : null}
            {toursState.loading ? (
              <div style={statusText}>Loading tours...</div>
            ) : toursState.tours.length ? (
              <div style={cardGrid}>
                {toursState.tours.map(function(tour) {
                  return (
                    <article key={tour.id} style={card}>
                      {tour.pictures && tour.pictures[0] ? <img src={tour.pictures[0]} alt={tour.name} style={{ width: "100%", height: 180, objectFit: "cover" }} /> : null}
                      <div style={cardBody}>
                        <div style={cardTag}>{tour.categories && tour.categories[0] ? tour.categories[0] : "Tour"}</div>
                        <h3 style={cardTitle}>{tour.name}</h3>
                        <p style={cardText}>{tour.description ? tour.description.slice(0, 140) + (tour.description.length > 140 ? "..." : "") : "Description not provided."}</p>
                        <div style={cardFooter}>
                          <div>
                            <div style={cardTag}>From</div>
                            <div style={priceText}>{tour.currency || "EUR"} {tour.price || "-"}</div>
                          </div>
                          {tour.affiliateLink ? <a href={tour.affiliateLink} target="_blank" rel="noreferrer" style={secondaryButton}>Book now</a> : tour.bookingLink ? <a href={tour.bookingLink} target="_blank" rel="noreferrer" style={secondaryButton}>Book now</a> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div style={statusText}>No tours found for this destination yet.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}