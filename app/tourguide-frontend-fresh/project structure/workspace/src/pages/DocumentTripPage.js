import React from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { fetchJson } from "../lib/api";
import { clearAuthSession, writeAuthSession } from "../lib/authSession";
import useViewport from "../lib/useViewport";

var DEFAULT_FORM = {
  title: "",
  destinationCountry: "",
  destinationCity: "",
  additionalCountries: "",
  travelStart: "",
  travelEnd: "",
  classifications: "",
  summary: "",
  budgetRange: "",
  estimatedTotalPrice: "",
  travelerCount: "1",
  visibility: "Member",
};

var DEFAULT_ITINERARY = [
  { day: "Day 1", description: "" },
  { day: "Day 2", description: "" },
];

var S = {
  shell: { minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", color: "#111827" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "38px 24px 64px" },
  hero: { background: "linear-gradient(135deg, #162235 0%, #203552 55%, #30507d 100%)", color: "#f8fafc", borderRadius: 28, padding: "32px 30px", boxShadow: "0 24px 70px rgba(15,23,42,0.2)", marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c35c", marginBottom: 10 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(34px, 5vw, 50px)", lineHeight: 1.06, margin: 0, marginBottom: 12 },
  intro: { fontSize: 15, lineHeight: 1.8, color: "rgba(248,250,252,0.78)", maxWidth: 760, margin: 0 },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.06)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginBottom: 18 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, marginBottom: 10, color: "#111827" },
  sectionText: { fontSize: 14, lineHeight: 1.75, color: "#4b5563", margin: 0, marginBottom: 18 },
  field: { display: "grid", gap: 8 },
  label: { fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280" },
  input: { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 14, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 120, padding: "13px 14px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 14, color: "#111827", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" },
  help: { fontSize: 13, lineHeight: 1.6, color: "#6b7280" },
  itineraryWrap: { display: "grid", gap: 14, marginTop: 8 },
  itineraryCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, display: "grid", gap: 12 },
  itineraryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  smallButton: { background: "none", border: "1px solid #d1d5db", color: "#374151", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  addButton: { background: "#111827", color: "#fff", border: "none", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  actions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 },
  primary: { background: "#d4a017", color: "#fff", border: "none", borderRadius: 12, padding: "13px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer" },
  secondary: { background: "none", border: "1px solid #d1d5db", color: "#374151", borderRadius: 12, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 14, padding: "12px 14px", fontSize: 14, marginBottom: 18 },
  success: { background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 14, padding: "12px 14px", fontSize: 14, marginBottom: 18 },
};

function DocumentTripPage() {
  var viewport = useViewport();
  var isMobile = viewport.isMobile;
  var isCompact = viewport.isTablet;
  var router = useRouter();
  var authState = React.useState(true);
  var checkingAuth = authState[0];
  var setCheckingAuth = authState[1];
  var formState = React.useState(DEFAULT_FORM);
  var form = formState[0];
  var setForm = formState[1];
  var itineraryState = React.useState(DEFAULT_ITINERARY);
  var itinerary = itineraryState[0];
  var setItinerary = itineraryState[1];
  var savingState = React.useState(false);
  var saving = savingState[0];
  var setSaving = savingState[1];
  var errorState = React.useState("");
  var error = errorState[0];
  var setError = errorState[1];
  var successState = React.useState("");
  var success = successState[0];
  var setSuccess = successState[1];
  var source = typeof router.query.source === "string" ? router.query.source : "dashboard-new-trip";

  React.useEffect(function() {
    var active = true;

    fetchJson("/api/auth/session/")
      .then(function(data) {
        if (!active) {
          return;
        }

        if (!data || !data.authenticated || !data.user) {
          clearAuthSession();
          router.replace("/login?next=" + encodeURIComponent("/document-trip?source=" + encodeURIComponent(source)));
          return;
        }

        writeAuthSession(data.user);
        setCheckingAuth(false);
      })
      .catch(function() {
        if (!active) {
          return;
        }

        clearAuthSession();
        router.replace("/login?next=" + encodeURIComponent("/document-trip?source=" + encodeURIComponent(source)));
      });

    return function() {
      active = false;
    };
  }, [router, source]);

  function updateField(name, value) {
    setForm(function(current) {
      return { ...current, [name]: value };
    });
  }

  function updateItinerary(index, field, value) {
    setItinerary(function(current) {
      return current.map(function(item, itemIndex) {
        if (itemIndex !== index) {
          return item;
        }
        return { ...item, [field]: value };
      });
    });
  }

  function addItineraryRow() {
    setItinerary(function(current) {
      return current.concat([{ day: "Day " + String(current.length + 1), description: "" }]);
    });
  }

  function removeItineraryRow(index) {
    setItinerary(function(current) {
      if (current.length === 1) {
        return current;
      }
      return current.filter(function(_, itemIndex) {
        return itemIndex !== index;
      }).map(function(item, itemIndex) {
        return { ...item, day: "Day " + String(itemIndex + 1) };
      });
    });
  }

  function buildPayload() {
    return {
      title: form.title.trim(),
      destinationCountry: form.destinationCountry.trim(),
      destinationCity: form.destinationCity.trim(),
      additionalCountries: form.additionalCountries.split(",").map(function(item) { return item.trim(); }).filter(Boolean),
      travelStart: form.travelStart,
      travelEnd: form.travelEnd,
      classifications: form.classifications.split(",").map(function(item) { return item.trim(); }).filter(Boolean),
      summary: form.summary.trim(),
      budgetRange: form.budgetRange.trim(),
      estimatedTotalPrice: form.estimatedTotalPrice ? Number(form.estimatedTotalPrice).toFixed(2) : "0.00",
      travelerCount: Number(form.travelerCount) || 1,
      visibility: form.visibility,
      itinerary: itinerary.map(function(item, index) {
        return {
          day: item.day.trim() || "Day " + String(index + 1),
          description: item.description.trim(),
        };
      }).filter(function(item) {
        return item.description;
      }),
    };
  }

  function validatePayload(payload) {
    if (!payload.title || !payload.destinationCountry || !payload.destinationCity || !payload.travelStart || !payload.travelEnd || !payload.summary) {
      return "Complete the trip basics before posting.";
    }
    if (!payload.classifications.length) {
      return "Add at least one trip classification or theme.";
    }
    if (!payload.itinerary.length) {
      return "Add at least one day-by-day itinerary entry.";
    }
    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    var payload = buildPayload();
    var validationError = validatePayload(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    fetchJson("/api/trips/document/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(function(data) {
        setSuccess(data.message || "Trip documented successfully.");
        if (data.detailPath) {
          router.push(data.detailPath);
        }
      })
      .catch(function(fetchError) {
        setError(fetchError.message || "Unable to save trip.");
      })
      .finally(function() {
        setSaving(false);
      });
  }

  if (checkingAuth) {
    return (
      <div style={S.shell}>
        <Navbar activeLabel="Dashboard" />
        <main style={{ ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding }}>
          <section style={S.panel}>
            <h2 style={S.sectionTitle}>Checking member session...</h2>
            <p style={S.sectionText}>TravelRecord is confirming that you are signed in before opening the protected trip documentation flow.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={S.shell}>
      <Navbar activeLabel="Dashboard" />
      <main style={{ ...S.main, padding: isMobile ? "24px 16px 48px" : S.main.padding }}>
        <section style={{ ...S.hero, padding: isMobile ? "24px 20px" : S.hero.padding }}>
          <div style={S.eyebrow}>Manual trip documentation</div>
          <h1 style={S.title}>Document and post a real trip record.</h1>
          <p style={S.intro}>
            This form asks only for the information the platform actually uses to render trip records: trip identity, destination, dates, classifications, budget context, visibility, and a day-by-day itinerary. Source: {source}.
          </p>
        </section>

        <form style={S.panel} onSubmit={handleSubmit}>
          {error ? <div style={S.error}>{error}</div> : null}
          {success ? <div style={S.success}>{success}</div> : null}

          <h2 style={S.sectionTitle}>Trip basics</h2>
          <p style={S.sectionText}>Start with the details required to identify and publish the trip properly.</p>
          <div style={{ ...S.grid, gridTemplateColumns: isCompact ? "1fr" : S.grid.gridTemplateColumns }}>
            <label style={S.field}>
              <span style={S.label}>Trip title</span>
              <input style={S.input} value={form.title} onChange={function(event) { updateField("title", event.target.value); }} placeholder="Example: Cape Town Coastal Food & Culture Week" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Main destination country</span>
              <input style={S.input} value={form.destinationCountry} onChange={function(event) { updateField("destinationCountry", event.target.value); }} placeholder="South Africa" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Main city or base</span>
              <input style={S.input} value={form.destinationCity} onChange={function(event) { updateField("destinationCity", event.target.value); }} placeholder="Cape Town" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Other countries visited</span>
              <input style={S.input} value={form.additionalCountries} onChange={function(event) { updateField("additionalCountries", event.target.value); }} placeholder="Namibia, Botswana" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Travel start date</span>
              <input type="date" style={S.input} value={form.travelStart} onChange={function(event) { updateField("travelStart", event.target.value); }} />
            </label>
            <label style={S.field}>
              <span style={S.label}>Travel end date</span>
              <input type="date" style={S.input} value={form.travelEnd} onChange={function(event) { updateField("travelEnd", event.target.value); }} />
            </label>
          </div>

          <h2 style={{ ...S.sectionTitle, marginTop: 18 }}>Trip framing</h2>
          <p style={S.sectionText}>These questions shape how the trip is categorized, searched, and understood by other members.</p>
          <div style={{ ...S.grid, gridTemplateColumns: isCompact ? "1fr" : S.grid.gridTemplateColumns }}>
            <label style={S.field}>
              <span style={S.label}>Trip classifications or themes</span>
              <input style={S.input} value={form.classifications} onChange={function(event) { updateField("classifications", event.target.value); }} placeholder="Cultural, Food, Coastal" />
              <span style={S.help}>Use comma-separated themes that explain what kind of trip this was.</span>
            </label>
            <label style={S.field}>
              <span style={S.label}>Visibility</span>
              <select style={S.input} value={form.visibility} onChange={function(event) { updateField("visibility", event.target.value); }}>
                <option value="Public">Public</option>
                <option value="Member">Member</option>
                <option value="Private">Private draft</option>
              </select>
              <span style={S.help}>Public and Member trips are posted immediately. Private saves the trip as a draft-style record.</span>
            </label>
            <label style={S.field}>
              <span style={S.label}>Budget range</span>
              <input style={S.input} value={form.budgetRange} onChange={function(event) { updateField("budgetRange", event.target.value); }} placeholder="USD 1,000 – 1,800" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Estimated total spend</span>
              <input type="number" min="0" step="0.01" style={S.input} value={form.estimatedTotalPrice} onChange={function(event) { updateField("estimatedTotalPrice", event.target.value); }} placeholder="1450.00" />
            </label>
            <label style={S.field}>
              <span style={S.label}>Number of travelers</span>
              <input type="number" min="1" step="1" style={S.input} value={form.travelerCount} onChange={function(event) { updateField("travelerCount", event.target.value); }} />
            </label>
          </div>

          <label style={{ ...S.field, marginTop: 6 }}>
            <span style={S.label}>Trip summary</span>
            <textarea style={S.textarea} value={form.summary} onChange={function(event) { updateField("summary", event.target.value); }} placeholder="Summarize the route, the experience, and the practical planning value of this trip for someone else browsing it later." />
            <span style={S.help}>This becomes the main description on the trip detail page, so focus on what the trip covered and why it is useful.</span>
          </label>

          <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>Day-by-day itinerary</h2>
          <p style={S.sectionText}>Add the practical sequence of the trip. This is the core record other users will read.</p>
          <div style={S.itineraryWrap}>
            {itinerary.map(function(item, index) {
              return (
                <div key={index} style={S.itineraryCard}>
                  <div style={S.itineraryHeader}>
                    <label style={{ ...S.field, flex: 1 }}>
                      <span style={S.label}>Day label</span>
                      <input style={S.input} value={item.day} onChange={function(event) { updateItinerary(index, "day", event.target.value); }} placeholder={"Day " + String(index + 1)} />
                    </label>
                    <button type="button" style={S.smallButton} onClick={function() { removeItineraryRow(index); }} disabled={itinerary.length === 1}>Remove day</button>
                  </div>
                  <label style={S.field}>
                    <span style={S.label}>What happened on this day?</span>
                    <textarea style={S.textarea} value={item.description} onChange={function(event) { updateItinerary(index, "description", event.target.value); }} placeholder="Include the route, major stops, logistics, and anything another traveler would need to understand the flow of this day." />
                  </label>
                </div>
              );
            })}
          </div>

          <div style={S.actions}>
            <button type="button" style={S.addButton} onClick={addItineraryRow}>Add Another Day</button>
            <button type="submit" style={S.primary} disabled={saving}>{saving ? "Saving Trip..." : "Post Trip Record"}</button>
            <button type="button" style={S.secondary} onClick={function() { router.push("/dashboard"); }}>Back to Dashboard</button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default DocumentTripPage;