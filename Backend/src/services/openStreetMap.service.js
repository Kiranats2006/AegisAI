const axios = require('axios');

const getNearbyEmergencyServices = async (lat, lng, radius = 5000, type = 'hospital') => {
  try {
    // Map types to OSM categories
    const typeMapping = {
      'hospital': 'hospital',
      'police': 'police', 
      'fire': 'fire_station'
    };

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${typeMapping[type]}"](around:${radius},${lat},${lng});
        way["amenity"="${typeMapping[type]}"](around:${radius},${lat},${lng});
        relation["amenity"="${typeMapping[type]}"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const response = await axios.post(overpassUrl, query);
    
    return response.data.elements.map(place => ({
      id: place.id,
      name: place.tags?.name || 'Unknown',
      type: type,
      contact: place.tags?.phone || 'Not available',
      location: {
        coordinates: [
          place.lon || place.center?.lon,
          place.lat || place.center?.lat
        ]
      },
      address: place.tags?.['addr:full'] || place.tags?.['addr:street'] || 'Address not available',
      distance: calculateDistance(lat, lng, place.lat || place.center?.lat, place.lon || place.center?.lon)
    }));
  } catch (error) {
    console.error('OpenStreetMap API error:', error);
    throw error;
  }
};

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

module.exports = { getNearbyEmergencyServices };