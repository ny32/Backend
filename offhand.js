async function convert(localobj) {
    const hitlist = Object.keys(firestoreStructure.GroceryStores);
    for (let store of hitlist) {
        for (let key in localobj) {
            const FirebaseRef = firestoreStructure.GroceryStores[store].Products;
            for (let item in FirebaseRef) {
                if ((FirebaseRef[item].name.toLowerCase()).includes(grocerylist[key].name.toLowerCase())) {
                    const storePrice = FirebaseRef[item].price;
                    const storeQuantity = FirebaseRef[item].unit[0];
                    const storeUnit = FirebaseRef[item].unit[1];
                    try {
                        const convertedQuantity = math.unit(localobj[key].unit[0], localobj[key].unit[1]).to(storeUnit);
                        const convertedPrice = (storePrice / storeQuantity) * convertedQuantity.toNumber();
                        if (localobj[key].price > Number(convertedPrice.toFixed(2))) {
                            localobj[key].price = Number(convertedPrice.toFixed(2));
                        }
                    } catch (err) {
                        console.error(`Error converting units ${err.message}`);
                    }
                }
                break;
            }
        }
    }
}