import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "./components/Navbar";
import { fetchJson } from "./lib/api";

const HERO_IMAGES = {
  "Tokyo & Kyoto Explorer": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
  "Inca Trail & Sacred Valley": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
  "Fjords & Northern Lights": "https://images.unsplash.com/photo-1517821365201-7734f463f2e3?auto=format&fit=crop&w=1600&q=80",
  "Culinary Heritage Trail: Northern Spain": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
  "East African Rift Valley Expedition": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80",
  "Silk Road Heritage: Uzbekistan Corridor": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
  "Sustainable Communities of the Peruvian Highlands": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
  "Mekong Delta Community Tourism Assessment": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80"
};

function TripDetail() {
  const router = useRouter();
  const tripId = typeof router.query.tripId === "string" ? router.query.tripId : "";
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [date, setDate] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [bookingLinks, setBookingLinks] = useState([]);
  const [bookingDisclaimer, setBookingDisclaimer] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await fetchJson(`/api/trips/${tripId}/`);
        setTrip({
          id: data.id,
          title: data.title,
          heroImage: HERO_IMAGES[data.title] || "",
          stats: {
            country: data.country,
            city: data.city,
            duration: data.duration,
            price: data.price,
            rating: data.rating,
            members: data.members,
            date: data.date,
            status: data.status,
            isPreferred: data.isPreferred
          },
          overview: {
            description: data.summary || data.classification || '',
            itinerary: Array.isArray(data.itinerary)
              ? data.itinerary.map(item => ({ day: item.day, description: item.description }))
              : [],
          },
          logistics: {
            inclusions: [],
            exclusions: [],
            requirements: [],
          },
          expert: data.expert || {},
          reviews: {
            average: data.rating || 0,
            breakdown: {},
            comments: Array.isArray(data.reviews)
              ? data.reviews.map(r => ({ user: r.user, rating: r.rating, text: r.text }))
              : [],
          },
        });
        setDate(data.date || "");
      } catch (fetchError) {
        setTrip(null);
        setError(fetchError.message || "Trip not found");
      }
      setLoading(false);
    };
    fetchTrip();
  }, [tripId]);

  useEffect(() => {
    if (!trip) {
      setBookingLinks([]);
      setBookingDisclaimer("");
      return;
    }

    let active = true;
    fetchJson(`/api/affiliates/trip?title=${encodeURIComponent(trip.title || "")}&country=${encodeURIComponent(trip.stats.country || "")}&city=${encodeURIComponent(trip.stats.city || "")}&startDate=${encodeURIComponent(date || "")}`)
      .then((data) => {
        if (!active) {
          return;
        }
        setBookingLinks(data.links || []);
        setBookingDisclaimer(data.disclaimer || "");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setBookingLinks([]);
        setBookingDisclaimer("");
      });

    return () => {
      active = false;
    };
  }, [trip, date]);

  // Calculate total price
  const totalPrice = trip ? (Number(trip.stats.price) * Number(travelerCount)).toFixed(2) : "0.00";

  if (loading) return <div className="trip-detail-container"><div className="trip-detail-page"><div>Loading trip details...</div></div></div>;
  if (!trip) return <div className="trip-detail-container"><div className="trip-detail-page"><div>{error || "Trip not found."}</div></div></div>;

  const heroStyle = trip.heroImage
    ? { backgroundImage: `url(${trip.heroImage})` }
    : { background: "linear-gradient(135deg, #10203a, #28415f)" };
  const expertDirectoryLink = trip.expert && trip.expert.name
    ? `/members?search=${encodeURIComponent(trip.expert.name)}`
    : "/members";

  return (
    <div className="trip-detail-container">
      <Navbar activeLabel="Search Trips" />

      <div className="trip-hero" style={heroStyle}>
        <div className="trip-hero-gradient"></div>
        <div className="trip-hero-content">
          <div className="trip-title">{trip.title}</div>
          <div className="trip-stats">
            {trip.stats.country} | {trip.stats.city} | {trip.stats.duration} | Rating: {trip.stats.rating}★
          </div>
          {trip.stats.isPreferred ? <div className="trip-stats">Preferred AI winner</div> : null}
        </div>
      </div>

      <div className="trip-detail-page">
        <div className="trip-main-content">
          <div className="trip-tabs">
            <button className={`trip-tab-btn${tab==="overview"?" active":''}`} onClick={()=>setTab("overview")}>Overview</button>
            <button className={`trip-tab-btn${tab==="logistics"?" active":''}`} onClick={()=>setTab("logistics")}>Logistics</button>
            <button className={`trip-tab-btn${tab==="expert"?" active":''}`} onClick={()=>setTab("expert")}>Expert</button>
            <button className={`trip-tab-btn${tab==="reviews"?" active":''}`} onClick={()=>setTab("reviews")}>Reviews</button>
          </div>
          <div className="trip-tab-content">
            {tab==="overview" && (
              <>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Description</h2>
                <p style={{fontSize:'1.18rem', color:'#222', marginBottom:'1.2rem'}}>{trip.overview.description}</p>
                <h3 style={{color:'#f59e42', fontWeight:700}}>Day-by-Day Itinerary</h3>
                <div className="trip-timeline">
                  {trip.overview.itinerary.map((item,i)=>(
                    <div className="trip-timeline-item" key={i}>
                      <b>Day {i+1}:</b> {item.day} — {item.description}
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab==="logistics" && (
              <>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Inclusions</h2>
                <ul>{trip.logistics.inclusions.map((item,i)=>(<li key={i}>{item}</li>))}</ul>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Exclusions</h2>
                <ul>{trip.logistics.exclusions.map((item,i)=>(<li key={i}>{item}</li>))}</ul>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Requirements</h2>
                <ul>{trip.logistics.requirements.map((item,i)=>(<li key={i}>{item}</li>))}</ul>
              </>
            )}
            {tab==="expert" && (
              <>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Expert Host</h2>
                <div className="expert-profile">
                  {trip.expert.profile ? <img src={trip.expert.profile} alt={trip.expert.name} className="expert-avatar" /> : null}
                  <div>
                    <div className="expert-name">{trip.expert.name}</div>
                    <div className="expert-bio">{trip.expert.bio}</div>
                    <Link href={expertDirectoryLink} className="view-more-btn">View More</Link>
                  </div>
                </div>
              </>
            )}
            {tab==="reviews" && (
              <>
                <h2 style={{color:'#3182ce', fontWeight:800}}>Trip Reviews</h2>
                <div className="reviews-breakdown">
                  <div>Average Rating: {trip.reviews.average}★</div>
                </div>
                <h3 style={{color:'#f59e42', fontWeight:700}}>Comments</h3>
                <ul>{trip.reviews.comments.map((c,i)=>(<li key={i}><strong>{c.user}</strong>: {c.text} ({c.rating}★)</li>))}</ul>
              </>
            )}
          </div>
        </div>
        <aside className="booking-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-price">${trip.stats.price}</div>
            <label>Date: <input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
            <label>Travelers: <input type="number" min={1} value={travelerCount} onChange={e=>setTravelerCount(e.target.value)} /></label>
            <div className="sidebar-total">Total: ${totalPrice}</div>
            {bookingLinks.length ? (
              <div className="booking-links-panel">
                {bookingLinks.map((link) => (
                  <a key={link.key} href={link.url} target="_blank" rel="noreferrer" className="book-now-btn">
                    {link.label}
                  </a>
                ))}
                {bookingDisclaimer ? <div className="booking-disclaimer">{bookingDisclaimer}</div> : null}
              </div>
            ) : (
              <Link href="/deals" className="book-now-btn">Open Deals</Link>
            )}
            <button type="button" className="wishlist-link" onClick={() => setWishlistSaved(current => !current)}>
              {wishlistSaved ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
export default TripDetail;
