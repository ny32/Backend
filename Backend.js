const firestoreStructure = require('./Firestore_M_copy');

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

const grocerylist = {
    1: {
        name: "Apple",
        quantity: 5,
        unit: null,
    },
    2: {
        name: "Mixed Nuts",
        quantity: 1,
        unit: "Bag"
    },
    3: {
        name: "Paper Towels",
        quantity: 12,
        unit: "Roll"
    },
    4: {
        name: "Carrots",
        quantity: 1,
        unit: "Bag"
    },
    5: {
        name: "Chicken",
        quantity: 1,
        unit: "Whole",
    },
    6: {
        name: "Cheese Crackers",
        quantity: 2,
        unit: "Box",
    },
    7: {
        name: "Rice",
        quantity: 5,
        unit: "kg",
    }
};


//Promise???

/*
1. First access the Grocerylist 
2. Then access .json Database
3. Look for each grocery item by name(from grocerylist) in the .json Database
4. Append Grocery Object to have searched for prices
*/

// Recursion
function getCheapestPrice(object, hitlist) {
    if (hitlist.length !== 0) {
        const currentStore = hitlist[0];
        for (key in object) {
            let found = false;
            const FirebaseRef = firestoreStructure.GroceryStores[currentStore].Products;
            for (x in FirebaseRef) {                    
                if (FirebaseRef[x].type == object[key].name) {
                    found = true;
                    if (FirebaseRef[x].price < object[key].price || object[key].price == null) {
                        object[key].price = FirebaseRef[x].price;
                        object[key].groceryStore = currentStore;
                    }
                    break;
                }
            } if (!found ) {
                console.log(object[key].name + " not found in " + currentStore)
            }
        } 
        return getCheapestPrice(object, hitlist.slice(1));
    } else {
        return object;
    }
}

function main(grocerylist, baseline) {
    const localobj = grocerylist;
    const hitlist = Object.keys(firestoreStructure.GroceryStores);
    
    baseline = hitlist.indexOf(baseline)
    if (baseline != -1) { 
        hitlist.unshift(hitlist.splice(baseline, 1)[0])
    }
    // These few lines of code above will locate aldis, and then move it to the front(the if condition just checks if it exists, indexof will return -1 if it doesn't exist)

    return getCheapestPrice(localobj, hitlist);
}
console.log(main(grocerylist, "Aldis"));