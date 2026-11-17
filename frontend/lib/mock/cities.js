// Fake place lookup data. Real backend will replace this behind lib/api.js.
export const CITIES = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata" },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, tz: "Asia/Kolkata" },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lon: 80.3319, tz: "Asia/Kolkata" },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lon: 79.0882, tz: "Asia/Kolkata" },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lon: 75.8577, tz: "Asia/Kolkata" },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lon: 72.9781, tz: "Asia/Kolkata" },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126, tz: "Asia/Kolkata" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, tz: "Asia/Kolkata" },
  { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, tz: "Asia/Kolkata" },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lon: 73.1812, tz: "Asia/Kolkata" },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lon: 77.4538, tz: "Asia/Kolkata" },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lon: 75.8573, tz: "Asia/Kolkata" },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lon: 78.0081, tz: "Asia/Kolkata" },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lon: 73.7898, tz: "Asia/Kolkata" },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lon: 77.3178, tz: "Asia/Kolkata" },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lon: 77.7064, tz: "Asia/Kolkata" },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lon: 70.8022, tz: "Asia/Kolkata" },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata" },
  { name: "Srinagar", state: "Jammu and Kashmir", lat: 34.0837, lon: 74.7973, tz: "Asia/Kolkata" },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lon: 74.8723, tz: "Asia/Kolkata" },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, tz: "Asia/Kolkata" },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, tz: "Asia/Kolkata" },
];

export function searchCities(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
}
