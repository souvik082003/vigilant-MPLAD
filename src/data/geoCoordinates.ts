export const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "andaman and nicobar islands": { lat: 11.7401, lng: 92.6586 },
  "andhra pradesh": { lat: 15.9129, lng: 79.7400 },
  "arunachal pradesh": { lat: 28.2180, lng: 94.7278 },
  "assam": { lat: 26.2006, lng: 92.9376 },
  "bihar": { lat: 25.0961, lng: 85.3131 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "chhattisgarh": { lat: 21.2787, lng: 81.8661 },
  "dadra and nagar haveli and daman and diu": { lat: 20.1809, lng: 73.0169 },
  "delhi": { lat: 28.7041, lng: 77.1025 },
  "goa": { lat: 15.2993, lng: 74.1240 },
  "gujarat": { lat: 22.2587, lng: 71.1924 },
  "haryana": { lat: 29.0588, lng: 76.0856 },
  "himachal pradesh": { lat: 31.1048, lng: 77.1734 },
  "jammu and kashmir": { lat: 33.7782, lng: 76.5762 },
  "jharkhand": { lat: 23.6102, lng: 85.2799 },
  "karnataka": { lat: 15.3173, lng: 75.7139 },
  "kerala": { lat: 10.8505, lng: 76.2711 },
  "ladakh": { lat: 34.1526, lng: 77.5771 },
  "lakshadweep": { lat: 10.5667, lng: 72.6417 },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569 },
  "maharashtra": { lat: 19.7515, lng: 75.7139 },
  "manipur": { lat: 24.6637, lng: 93.9063 },
  "meghalaya": { lat: 25.4670, lng: 91.3662 },
  "mizoram": { lat: 23.1645, lng: 92.9376 },
  "nagaland": { lat: 26.1584, lng: 94.5624 },
  "odisha": { lat: 20.9517, lng: 85.0985 },
  "puducherry": { lat: 11.9416, lng: 79.8083 },
  "punjab": { lat: 31.1471, lng: 75.3412 },
  "rajasthan": { lat: 27.0238, lng: 74.2179 },
  "sikkim": { lat: 27.5330, lng: 88.5122 },
  "tamil nadu": { lat: 11.1271, lng: 78.6569 },
  "telangana": { lat: 18.1124, lng: 79.0193 },
  "tripura": { lat: 23.9408, lng: 91.9882 },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462 },
  "uttarakhand": { lat: 30.0668, lng: 79.0193 },
  "west bengal": { lat: 22.9868, lng: 87.8550 }
};

export const CONSTITUENCY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "alwar": { lat: 27.5530, lng: 76.6346 },
  "bikaner": { lat: 28.0229, lng: 73.3119 },
  "barmer": { lat: 25.7532, lng: 71.3917 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "ernakulam": { lat: 9.9816, lng: 76.2999 },
  "gorakhpur": { lat: 26.7606, lng: 83.3732 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
};

/**
 * Returns a coordinate for a project. 
 * If constituency matches, use that.
 * Otherwise, use state center + some pseudo-random jitter based on the constituency name to spread them out.
 */
export function getCoordinates(state: string, constituency: string) {
  const cKey = (constituency || "").toLowerCase();
  const sKey = (state || "").toLowerCase().trim();
  
  if (CONSTITUENCY_COORDINATES[cKey]) {
    return CONSTITUENCY_COORDINATES[cKey];
  }
  
  const stateCenter = STATE_COORDINATES[sKey];
  if (!stateCenter) {
    // Fallback center of India
    return { lat: 20.5937, lng: 78.9629 };
  }
  
  // Create a stable jitter based on constituency string so markers don't overlap entirely
  let hash = 0;
  for (let i = 0; i < cKey.length; i++) {
    hash = cKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Math.sin(hash) yields -1 to 1. Multiply by some degree span for state-sized spread (e.g. ~1.5 degrees)
  const latJitter = Math.sin(hash) * 1.5;
  const lngJitter = Math.cos(hash) * 1.5;
  
  return {
    lat: stateCenter.lat + latJitter,
    lng: stateCenter.lng + lngJitter
  };
}
