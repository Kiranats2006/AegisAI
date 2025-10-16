const { getNearbyEmergencyServices } = require("../services/openStreetMap.service");

// GET Nearby Hospitals / Emergency Services with REAL data
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type = 'hospital' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude format"
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90, Longitude between -180 and 180"
      });
    }

    // Get REAL data from OpenStreetMap
    const nearbyServices = await getNearbyEmergencyServices(
      latitude, 
      longitude, 
      parseInt(radius), 
      type
    );

    // Sort by distance
    nearbyServices.sort((a, b) => a.distance - b.distance);

    // Format response
    const formattedServices = nearbyServices.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      contact: service.contact,
      address: service.address,
      distance: `${service.distance.toFixed(2)} km`,
      distanceInMeters: Math.round(service.distance * 1000),
      coordinates: service.location.coordinates
    }));

    res.json({ 
      success: true, 
      data: formattedServices,
      count: formattedServices.length,
      searchLocation: { 
        lat: latitude, 
        lng: longitude 
      },
      radius: `${radius} meters`,
      dataSource: "OpenStreetMap",
      note: "Data provided by OpenStreetMap contributors"
    });

  } catch (error) {
    console.error("Nearby hospitals error:", error);
    
    // Provide helpful error messages
    let errorMessage = "Error fetching nearby emergency services";
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Unable to connect to map service. Please check your internet connection.";
    } else if (error.response?.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a few moments.";
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage, 
      error: error.message 
    });
  }
};

// Get all types of emergency services nearby
const getAllNearbyServices = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Get hospitals, police, and fire stations
    const [hospitals, policeStations, fireStations] = await Promise.all([
      getNearbyEmergencyServices(latitude, longitude, radius, 'hospital'),
      getNearbyEmergencyServices(latitude, longitude, radius, 'police'),
      getNearbyEmergencyServices(latitude, longitude, radius, 'fire')
    ]);

    const allServices = [
      ...hospitals.map(s => ({ ...s, type: 'hospital' })),
      ...policeStations.map(s => ({ ...s, type: 'police' })),
      ...fireStations.map(s => ({ ...s, type: 'fire' }))
    ].sort((a, b) => a.distance - b.distance);

    const formattedServices = allServices.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      contact: service.contact,
      address: service.address,
      distance: `${service.distance.toFixed(2)} km`,
      distanceInMeters: Math.round(service.distance * 1000),
      coordinates: service.location.coordinates
    }));

    res.json({
      success: true,
      data: formattedServices,
      count: formattedServices.length,
      summary: {
        hospitals: hospitals.length,
        police: policeStations.length,
        fire: fireStations.length
      },
      searchLocation: { lat: latitude, lng: longitude },
      radius: `${radius} meters`,
      dataSource: "OpenStreetMap"
    });

  } catch (error) {
    console.error("All nearby services error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby emergency services",
      error: error.message
    });
  }
};

module.exports = { 
  getNearbyHospitals,
  getAllNearbyServices 
};