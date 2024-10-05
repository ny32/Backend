const fs = require('fs');

// We can use the Geolocation API to get the latitude and longitude of the user
const findNearbyGroceryStores = (latitude, longitude, radius) => {
  // Use enviornment variables to store the API Key, since it's sensitive info
  const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI';
  const searchType = 'grocery_or_supermarket';

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${searchType}&key=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Nearby grocery stores:', data.results);

      const selectedData = data.results.map(store => ({
        name: store.name,
        address: store.vicinity,
      }));

      fs.writeFile('nearbyGroceryStores.json', JSON.stringify(selectedData, null, 2), (err) => {
        if (err) {
          console.error('Error writing file', err);
        } else {
          console.log('Data sucessfully saved to nearbyGroceryStores.json');
        }
      });
    })
  .catch(error => console.error('Error fetching data:', error));
}

//Example 
findNearbyGroceryStores(39.228618, -77.240075, 5000)

module.exports = { findNearbyGroceryStores }