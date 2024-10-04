const firestoreStructure = require('./Firestore_M_copy.json');
const { webscraper } = require('./Web_Scraper');
//Math - Capable of using unit conversions
const math = require('mathjs');
const fs = require('fs').promises;
const itemsNotFound = {};


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
    // 2: {
    //     name: "Rice",
    //     requestedUnit: "lb",
    //     requestedQuantity: 2,
    //     //Everything here is algorithm adds
    //     fromAlgo: {
    //         price: null,
    //     },
    // },
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

/*
1. First access the Grocerylist 
2. Then access .json Database
3. Look for each grocery item by name(from grocerylist) in the .json Database
4. Append Grocery Object to have searched for prices
*/

// Recursive function to find the cheapest price
async function getCheapestPrice(object, hitlist) {
    
    if (hitlist.length !== 0) {
        const currentStore = hitlist[0];
        let working;
        for (let key in object) {
            let found = false;
            const FirebaseRef = firestoreStructure.GroceryStores[currentStore].Products;
            for (let x in FirebaseRef) {     
                if ((FirebaseRef[x].name.toLowerCase()).includes(object[key].name.toLowerCase())) {
                    found = true;
                    working=FirebaseRef[x];
                    break;
                }
            } 
            if (!found) {
                // Fix this logic next
                console.log(object[key].name + " not found in " + currentStore + " database");
                Object.assign(itemsNotFound, {[key]: object[key]} );
                await webscraper(currentStore, object[key].name, 1)
            } else {
                //Add comparison logic here 
                
                
                try {
                    // Convert store quantity to requested unit
                    const storeQuantity = math.unit(working.unit[0], working.unit[1]).toNumber(object[key].requestedUnit);
                    
                    // Calculate price per requested unit
                    const pricePerUnit = working.price / storeQuantity;
                    
                    // Calculate how many store units are needed
                    const unitsNeeded = Math.ceil(object[key].requestedQuantity / storeQuantity);
                    
                    // Calculate total price
                    const totalPrice = unitsNeeded * working.price;
                    if (object[key].fromAlgo.price === null || totalPrice < object[key].fromAlgo.price) {
                        object[key].fromAlgo = {
                            price: totalPrice,
                            quantity: unitsNeeded,
                            Grocery_Store: currentStore,
                            unit: working.unit,
                            pricePerUnit: pricePerUnit
                        };

                        // object[key].fromAlgo.Gunit will return an array, it just is not shown in VScode because of its array depth settings, not sure how to fix

                    }
                } catch (error) {
                    console.log(`Error processing ${object[key].name} from ${currentStore}: ${error.message}`);
                }
            
            }        
        } 
        return getCheapestPrice(object, hitlist.slice(1));
    } else {
        return object;
    }
}

async function main(grocerylist, baseline) {
    const hitlist = Object.keys(firestoreStructure.GroceryStores);
    const localobj = grocerylist;
    const baselineIndex = hitlist.indexOf(baseline);
    if (baselineIndex !== -1) {
        hitlist.unshift(hitlist.splice(baselineIndex, 1)[0]);
    }
    // These few lines of code above will locate aldis, and then move it to the front(the if condition just checks if it exists, indexof will return -1 if it doesn't exist)

    return await getCheapestPrice(localobj, hitlist);
}


// Execute the main function
main(grocerylist, "Aldi", 1)
    .then(result => {
        
        if(Object.keys(itemsNotFound).length > 0) {
            console.log("2nd iteration...")
            main(itemsNotFound, "Aldi", 1).then(result => {console.log(result)}).catch(error => console.error("Error in main:", error));
        } else {
            console.log(result);
        }

    })
    .catch(error => console.error("Error in main:", error));