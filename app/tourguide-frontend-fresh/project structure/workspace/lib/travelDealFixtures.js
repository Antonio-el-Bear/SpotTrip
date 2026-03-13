function getDestinationProfileByCoordinates(lat, lng) {
  var latitude = Number(lat);
  var longitude = Number(lng);

  if (Math.abs(latitude - 41.3851) < 1 && Math.abs(longitude - 2.1734) < 1) {
    return { city: "Barcelona", country: "Spain", currency: "EUR" };
  }
  if (Math.abs(latitude - 48.8566) < 1 && Math.abs(longitude - 2.3522) < 1) {
    return { city: "Paris", country: "France", currency: "EUR" };
  }
  if (Math.abs(latitude - 51.5074) < 1 && Math.abs(longitude + 0.1278) < 1) {
    return { city: "London", country: "United Kingdom", currency: "GBP" };
  }
  if (Math.abs(latitude - 40.7128) < 1 && Math.abs(longitude + 74.006) < 1) {
    return { city: "New York", country: "United States", currency: "USD" };
  }
  if (Math.abs(latitude - 40.4168) < 1 && Math.abs(longitude + 3.7038) < 1) {
    return { city: "Madrid", country: "Spain", currency: "EUR" };
  }

  return { city: "This destination", country: "", currency: "EUR" };
}
export function getDemoAttractions(lat, lng) {
  var profile = getDestinationProfileByCoordinates(lat, lng);

  return [
    {
      id: "demo-attraction-1",
      name: profile.city + " Old Town District",
      category: "Historic Site",
      address: profile.city + (profile.country ? ", " + profile.country : ""),
      distance: "1.2 km",
      webUrl: null,
      photo: null,
      rating: "4.6",
      numReviews: "1280",
      rankingString: "One of the most visited heritage areas in " + profile.city,
    },
    {
      id: "demo-attraction-2",
      name: profile.city + " Riverside Promenade",
      category: "Scenic Walk",
      address: profile.city + (profile.country ? ", " + profile.country : ""),
      distance: "2.0 km",
      webUrl: null,
      photo: null,
      rating: "4.5",
      numReviews: "940",
      rankingString: "Popular for sunsets, cafes, and easy orientation walks",
    },
  ];
}