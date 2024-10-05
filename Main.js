const { logDependencies } = require('mathjs');
const { sort } = require('./Backend.js');
const { findNearbyGroceryStores, getCoordinates } = require('./MapsAPI.js');

const grocerylist = {
    1: {
        name: "Apple",
        requestedUnit: "kg",
        requestedQuantity: 4,
        //Everything here is algorithm adds
        fromAlgo: {
            price: null,
        },
    },
    2: {
        name: "Rice",
        requestedUnit: "lb",
        requestedQuantity: 2,
        //Everything here is algorithm adds
        fromAlgo: {
            price: null,
        },
    },
    // 3: {
    //     name: "Paper Towel",
    //     quantity: 12,
    //     unit: "Roll"
    // },
    // 4: {
    //     name: "Carrots",
    //     quantity: 1,
    //     unit: "Bag"
    // },
    // 5: {
    //     name: "Chicken",
    //     quantity: 1,
    //     unit: "Whole",
    // },
    // 6: {
    //     name: "Cheese Crackers",
    //     quantity: 2,
    //     unit: "Box",
    // },
    // 7: {
    //     name: "Rice",
    //     quantity: 5,
    //     unit: "kg",
    // }
};

// User will send over the following
/*
- A Grocerylist(requested items)
- A location
- An acceptable radius for those items(if not specified default will be 10km)
    - Using the grocery stores on the list, we pick out the ones with historically good prices(using our point system)
    --> Order is Aldis, Lidl, Walmart, Target, and Walmart isn't on list, we use Aldis, Lidl, Target
*/

//Later we will use a less rustic method to generate this, using cost-preferability points
preferableStores = ["aldi", "lidl", "safeway"]
async function main(grocerylist, location, radius) {
    //Convert location to geocoded long/lat
    const coordinates = await getCoordinates(location);
    const stores = await findNearbyGroceryStores(coordinates.lat, coordinates.lng, radius, 10);
    const myarray = [];
    //Find nearby grocery stores to geocoded location
    for (x of preferableStores) {
            let b = stores.find(store => (store.name).toLowerCase() === x)
            if (b != undefined) {
                myarray.push((b.name).toLowerCase());
            }
    }
    const FormattedLocation = [
        coordinates.lat,
        coordinates.lng
    ]
    return sort(grocerylist, "aldi", myarray, FormattedLocation)
        .then(result => { return result} )
        .catch(error => console.error("Error in main:", error));
};

main(grocerylist, "20872, Damascus, Maryland", 10000).then(result => console.log(result));
//10Km  