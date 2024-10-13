const functions = require('firebase-functions');
const { sort } = require('./backendFunction.js');
const { findNearbyGroceryStores, getCoordinates } = require('./getCoordinatesFunction.js');

// const grocerylist = {
//     1: {
//         name: "Gala Apple",
//         requestedUnit: "kg",
//         requestedQuantity: 4,
//         //Everything here is algorithm adds
//         fromAlgo: {
//             price: null,
//         },
//     },
//     2: {
//         name: "Brown Rice",
//         requestedUnit: "lb",
//         requestedQuantity: 2,
//         //Everything here is algorithm adds
//         fromAlgo: {
//             price: null,
//         },
//     },
//     // 3: {
//     //     name: "Paper Towel",
//     //     quantity: 12,
//     //     unit: "Roll"
//     // },
//     // 4: {
//     //     name: "Carrots",
//     //     quantity: 1,
//     //     unit: "Bag"
//     // },
//     // 5: {
//     //     name: "Chicken",
//     //     quantity: 1,
//     //     unit: "Whole",
//     // },
//     // 6: {
//     //     name: "Cheese Crackers",
//     //     quantity: 2,
//     //     unit: "Box",
//     // },
//     // 7: {
//     //     name: "Rice",
//     //     quantity: 5,
//     //     unit: "kg",
//     // }
// };

// // User will send over the following
// /*
// - A Grocerylist(requested items)
// - A location
// - An acceptable radius for those items(if not specified default will be 10km)
//     - Using the grocery stores on the list, we pick out the ones with historically good prices(using our point system)
//     --> Order is Aldis, Lidl, Walmart, Target, and Walmart isn't on list, we use Aldis, Lidl, Target
// */

// //Later we will use a less rustic method to generate this, using cost-preferability points
const preferableStores = ["aldi", "lidl", "wegmans"]

exports.main = functions.https.onRequest(async (req, res) => {
    try {
        const { grocerylist, location, radius } = req.body;

        if (!grocerylist || !location || !radius) {
            return res.status(400).send("Did not fill in all the required inputs (Grocery List, Location and/or Radius).");
        }
        
        //Convert location to geocoded long/lat
        const coordinates = await getCoordinates(location);

        // Find nearby grocery stores to geocoded location
        const stores = await findNearbyGroceryStores(coordinates.lat, coordinates.lng, radius, 10);

        // Filter stores to match preferable ones
        const matchedStores = preferableStores.filter(store => {
            return stores.some(foundStore => foundStore.name.toLowerCase() === store);
        });

        const formattedLocation = [coordinates.lat, coordinates.lng];

        const result = await sort(grocerylist, "aldi", matchedStores, formattedLocation);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error in main function:", error);
        return res.status(500).send("An error occurred.");
    }
});