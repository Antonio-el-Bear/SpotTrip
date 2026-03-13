import { useCallback, useEffect, useState } from "react";

async function readJson(response) {
  var payload = await response.json().catch(function() {
    return null;
  });

  if (!response.ok) {
    throw new Error((payload && (payload.error || payload.detail)) || "Request failed with status " + response.status);
  }

  return payload;
}

export function useFlightDeals(options) {
  var config = options || {};
  var origin = config.origin;
  var destination = config.destination;
  var date = config.date;
  var adults = config.adults || 1;
  var max = config.max || 8;
  var fs = useState([]);
  var flights = fs[0];
  var setFlights = fs[1];
  var ls = useState(false);
  var loading = ls[0];
  var setLoading = ls[1];
  var es = useState(null);
  var error = es[0];
  var setError = es[1];
  var ms = useState(null);
  var message = ms[0];
  var setMessage = ms[1];
  var modeState = useState(null);
  var mode = modeState[0];
  var setMode = modeState[1];
  var sourceState = useState(null);
  var source = sourceState[0];
  var setSource = sourceState[1];

  var search = useCallback(async function() {
    if (!origin || !destination || !date) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      var response = await fetch(
        "/api/deals/flights?origin=" + encodeURIComponent(origin) +
        "&destination=" + encodeURIComponent(destination) +
        "&date=" + encodeURIComponent(date) +
        "&adults=" + encodeURIComponent(String(adults)) +
        "&max=" + encodeURIComponent(String(max))
      );
      var data = await readJson(response);
      setFlights(data.flights || []);
      setMessage(data.message || null);
      setMode(data.mode || "live");
      setSource(data.source || null);
    } catch (requestError) {
      setFlights([]);
      setError(requestError.message);
      setMode("error");
      setSource(null);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, date, adults, max]);

  return { flights: flights, loading: loading, error: error, message: message, mode: mode, source: source, search: search };
}

export function useAttractions(options) {
  var config = options || {};
  var lat = config.lat;
  var lng = config.lng;
  var radius = config.radius || 10;
  var as = useState([]);
  var attractions = as[0];
  var setAttractions = as[1];
  var ls = useState(false);
  var loading = ls[0];
  var setLoading = ls[1];
  var es = useState(null);
  var error = es[0];
  var setError = es[1];
  var ms = useState(null);
  var message = ms[0];
  var setMessage = ms[1];
  var modeState = useState(null);
  var mode = modeState[0];
  var setMode = modeState[1];
  var sourceState = useState(null);
  var source = sourceState[0];
  var setSource = sourceState[1];

  useEffect(function() {
    if (lat == null || lng == null) {
      return undefined;
    }

    var cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);
    setAttractions([]);

    fetch(
      "/api/deals/attractions?lat=" + encodeURIComponent(String(lat)) +
      "&lng=" + encodeURIComponent(String(lng)) +
      "&radius=" + encodeURIComponent(String(radius))
    )
      .then(readJson)
      .then(function(data) {
        if (!cancelled) {
          setAttractions(data.attractions || []);
          setMessage(data.message || null);
          setMode(data.mode || "live");
          setSource(data.source || null);
        }
      })
      .catch(function(requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setMode("error");
          setSource(null);
        }
      })
      .finally(function() {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return function() {
      cancelled = true;
    };
  }, [lat, lng, radius]);

  return { attractions: attractions, loading: loading, error: error, message: message, mode: mode, source: source };
}

export function useTourDeals(options) {
  var config = options || {};
  var lat = config.lat;
  var lng = config.lng;
  var radius = config.radius || 20;
  var ts = useState([]);
  var tours = ts[0];
  var setTours = ts[1];
  var ls = useState(false);
  var loading = ls[0];
  var setLoading = ls[1];
  var es = useState(null);
  var error = es[0];
  var setError = es[1];
  var ms = useState(null);
  var message = ms[0];
  var setMessage = ms[1];
  var modeState = useState(null);
  var mode = modeState[0];
  var setMode = modeState[1];
  var sourceState = useState(null);
  var source = sourceState[0];
  var setSource = sourceState[1];

  useEffect(function() {
    if (lat == null || lng == null) {
      return undefined;
    }

    var cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);
    setTours([]);

    fetch(
      "/api/deals/tours?lat=" + encodeURIComponent(String(lat)) +
      "&lng=" + encodeURIComponent(String(lng)) +
      "&radius=" + encodeURIComponent(String(radius))
    )
      .then(readJson)
      .then(function(data) {
        if (!cancelled) {
          setTours(data.tours || []);
          setMessage(data.message || null);
          setMode(data.mode || "live");
          setSource(data.source || null);
        }
      })
      .catch(function(requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setMode("error");
          setSource(null);
        }
      })
      .finally(function() {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return function() {
      cancelled = true;
    };
  }, [lat, lng, radius]);

  return { tours: tours, loading: loading, error: error, message: message, mode: mode, source: source };
}