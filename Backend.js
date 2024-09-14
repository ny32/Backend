const firestoreStructure = require('./Firestore_M.json');
const convert = require('convert-units');

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

// Recursion?????
function getCheapestPrice(object, baseline) {
    const maxStores = 5;
    const localobj = object;
    const hitlist = Object.keys(firestoreStructure.GroceryStores);
    hitlist.splice(hitlist.indexOf(baseline), 1);
    console.log(hitlist);
    for (key in grocerylist) {
        for (x in firestoreStructure.GroceryStores[baseline].Products) {
            if (localobj[key].name == firestoreStructure.GroceryStores[baseline].Products[x].type) {
                localobj[key].price = firestoreStructure.GroceryStores[baseline].Products[x].price;
                localobj[key].groceryStore = baseline;
            }
        };
        for (GS in hitlist) {
            for (y in firestoreStructure.GroceryStores[hitlist[GS]].Products) {
                if (localobj[key].name == firestoreStructure.GroceryStores[hitlist[GS]].Products[y].type) {
                    if (localobj[key].price > firestoreStructure.GroceryStores[hitlist[GS]].Products[y].price) {
                        localobj[key].price = firestoreStructure.GroceryStores[hitlist[GS]].Products[y].price;
                        localobj[key].groceryStore = hitlist[GS];
                    }
                }
            };
        };
    };
    
    /*
    - Compare updated localobj prices to another store reference in .json
    - 
    */
    return localobj;
   
};
console.log(getCheapestPrice(grocerylist, "Aldis"));