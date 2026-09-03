/**
 * Reverse geocoding utility to extract city and country from coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} - Object containing city and country
 */
export const reverseGeocode = async (latitude, longitude) => {
  let city = "";
  let country = "";

  if (!process.env.OPENCAGE_API_KEY) {
    console.warn(
      "OpenCage API key not configured. Skipping reverse geocoding."
    );
    return { city, country };
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const components = data.results[0].components;
      city =
        components.city ||
        components.town ||
        components.village ||
        components.municipality ||
        "";
      country = components.country || "";
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
  }

  return { city, country };
};
