const { Client } = require("@googlemaps/google-maps-services-js");
// USED A LIBARY - Googmaps/google-maps-services-js
// Replace with your actual API key
const apiKey = 'AIzaSyBBeOmbEg6xvCikzE9LeC4a8EBB5r82qTI';

const client = new Client({});

async function calculateDistance(origin, destination) {
  try {
    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        mode: 'driving',
        units: 'imperial',
        key: apiKey
      }
    });

    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];
      if (element.status === "OK") {
        console.log(`Driving distance from ${origin} to ${destination}:`);
        console.log(`Distance: ${element.distance.text}`);
        console.log(`Estimated time: ${element.duration.text}`);
      } else {
        console.log("Unable to calculate distance");
      }
    } else {
      console.log("Distance calculation failed");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Example usage
const origin = "11522 Dogwood Hills Dr, Clarksburg, MD";
const destination = "11304 Kings Valley Drive, Damascus, MD";

calculateDistance(origin, destination);