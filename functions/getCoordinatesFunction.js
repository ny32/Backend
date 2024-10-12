const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI';

// We can use the Geolocation API to get the latitude and longitude of the user
const findNearbyGroceryStores = async (latitude, longitude, radius, depth) => {
  // Use enviornment variables to store the API Key, since it's sensitive info

  const searchType = 'grocery_or_supermarket';

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${searchType}&key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return Promise.all(data.results.slice(0, depth).map(store =>
        getCoordinates(store.vicinity).then(coordinates => ({ name: store.name, address: coordinates })).catch(error => console.log(error))
      ))
    })
    .catch(error => console.error('Error fetching data:', error));
}

//Geocoding function
const getCoordinates = async (userAddress) => {
  const address = encodeURIComponent(userAddress);
  // Replace with your actual API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=20872,%20Damascus,%20Maryland&key=AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return location;
    } else {
      console.error('Geocoding failed:', data.status, data.error_message);
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'No results found'}`);
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
//Example 
//10,000m or 10km

module.exports = { findNearbyGroceryStores, getCoordinates }
