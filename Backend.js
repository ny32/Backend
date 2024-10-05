const firestoreStructure = require('./Firestore_M_copy.json');
const { webscraper } = require('./Web_Scraper');
//Math - Capable of using unit conversions
const math = require('mathjs');
const fs = require('fs').promises;


// Sign up for Google Maps API(to factor in transportation costs)
//console.log(firestoreStructure.GroceryStores.Lidl.Products.product1);

//console.log(convert(100).from('lb').to('kg'));

/* 

    Notes:
    - Might Need Google Map API for locating stores/finding distance
    - ...

    Cloud Firestore Structure:

        Collection(GroceryStores) -> Document(Giant, etc.) -> Field
                                     Document(Giant, etc.) -> Subcollection(Products) -> Document(Proudct1, etc.) -> Field
                                                                                         Document(Proudct1, etc.) -> Subcollection(Not in use)
*/
/*

- 5 Apples
- 1 Bag of Mixed Nuts
- 12 Roll of Paper Towels
- 1 Bag of Carrots
- 1 Whole Chicken
- 2 Box of Cheese Crackers
- 5 Kg of Rice

Set Baseline store as Aldi's

*/

// Grocery list with items


/*
1. First access the Grocerylist 
2. Then access .json Database
3. Look for each grocery item by name(from grocerylist) in the .json Database
4. Append Grocery Object to have searched for prices
*/

// Recursive function to find the cheapest price
async function getCheapestPrice(object, hitlist, location) {
    
    if (hitlist.length !== 0) {
        const currentStore = hitlist[0];
        let working;
        for (let key in object) {
            let found = false;
            const FirebaseRef = firestoreStructure.GroceryStores[currentStore].Products;
            for (let x in FirebaseRef) {     
                if ((FirebaseRef[x].name.toLowerCase()).includes(object[key].name.toLowerCase())) {
                    found = true;
                    working = FirebaseRef[x];
                    break;
                }
            } 
            if (!found) {
                // Fix this logic next
                console.log(object[key].name + " not found in " + currentStore + " database");
                const a = await webscraper(currentStore, object[key].name, 1, location);
                working = a;
                
            }
            //Comparison logic below 
            try {
                // Convert store quantity to requested unit
                const storeQuantity = math.unit(working.unit[0], working.unit[1]).toNumber(object[key].requestedUnit);
                
                // Calculate price per requested unit
                
                // Calculate how many store units are needed
                const unitsNeeded = Math.ceil(object[key].requestedQuantity / storeQuantity);
                
                // Calculate total price
                const totalPrice = Number((unitsNeeded * working.price).toFixed(2));
                
                if (object[key].fromAlgo.price === null || totalPrice < object[key].fromAlgo.price) {
                    object[key].fromAlgo = {
                        price: totalPrice,
                        quantity: unitsNeeded,
                        Grocery_Store: currentStore,
                        unit: working.unit,
                        pricePerUnit: working.price,
                        productName: working.name,
                    };
        
                    // object[key].fromAlgo.Gunit will return an array, it just is not shown in VScode because of its array depth settings, not sure how to fix
        
                }
            } catch (error) {
                console.log(`Error processing ${object[key].name} from ${currentStore}: ${error.message}`);
            }
                
                
                    
        } 
        return getCheapestPrice(object, hitlist.slice(1), location);
    } else {
        return object;
    }
}

async function sort(grocerylist, baseline, stores, location) {
    const hitlist = stores;
    for (x of hitlist) {
        if (!Object.keys(firestoreStructure.GroceryStores).includes(x)) {
            hitlist.splice(hitlist.indexOf(x), 1);
        }
    }
    const localobj = grocerylist;
    const baselineIndex = hitlist.indexOf(baseline);
    if (baselineIndex !== -1) {
        hitlist.unshift(hitlist.splice(baselineIndex, 1)[0]);
    }
    // These few lines of code above will locate aldis, and then move it to the front(the if condition just checks if it exists, indexof will return -1 if it doesn't exist)
    return await getCheapestPrice(localobj, hitlist, location);
}


// Execute the sort function
module.exports = { sort };