const axios = require('axios');

const getCoordinates = (zipCode, city) => {
  const address = `${zipCode}, ${city}`;
  const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI'; // Replace with your actual API key

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
    .then(response => {
      const location = response.data.results[0].geometry.location; // Access location data from geocoding response
      return location; // Return the location object
    })
    .catch(error => {
      console.error('Error fetching coordinates:', error);
      // Handle the error appropriately
    });
};

// Example usage
// zipCode = '90210';
// city = 'Beverly Hills, USA';
getCoordinates('90210', 'Beverly Hills, USA').then(result => console.log(result)).catch(error => console.log(error))
module.exports = { getCoordinates }