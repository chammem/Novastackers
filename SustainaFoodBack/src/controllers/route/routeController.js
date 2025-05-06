const axios = require('axios');

exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Use Nominatim for geocoding (free)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SustainaFood/1.0'
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      
      return res.status(200).json({
        success: true,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        displayName: result.display_name
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return res.status(500).json({
      success: false,
      message: 'Error geocoding address',
      error: error.message
    });
  }
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Use Nominatim for reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'SustainaFood/1.0'
        }
      }
    );
    
    if (response.data) {
      // Parse the address components
      const addressData = response.data.address;
      
      const formattedAddress = {
        street: [addressData.road, addressData.house_number].filter(Boolean).join(' '),
        city: addressData.city || addressData.town || addressData.village || '',
        state: addressData.state || '',
        zipCode: addressData.postcode || '',
        country: addressData.country || ''
      };
      
      const displayAddress = response.data.display_name;
      
      return res.status(200).json({
        success: true,
        address: displayAddress,
        addressComponents: formattedAddress
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Address not found for this location'
      });
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return res.status(500).json({
      success: false,
      message: 'Error reverse geocoding',
      error: error.message
    });
  }
};