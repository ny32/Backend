const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI';

// We can use the Geolocation API to get the latitude and longitude of the user
const findNearbyGroceryStores = (latitude, longitude, radius, depth) => {
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
const getCoordinates = (userAddress) => {
  const address = `${userAddress}`;
  const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI'; // Replace with your actual API key

  return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const location = data.results[0].geometry.location; // Access location data from geocoding response
      return location; // Return the location object
    })
    .catch(error => {
      console.error('Error fetching coordinates:', error);
      // Handle the error appropriately
    });
};
//Example 
//10,000m or 10km

module.exports = { findNearbyGroceryStores, getCoordinates }
