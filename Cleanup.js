const math = require('mathjs');
// Implement image later...
const acceptedNumValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
// Multiple-Use Functions
function findUnit(iunit) {
    iunit = iunit.toLowerCase();
    let workingval = iunit;
    let a = "";
    if (iunit.includes(".")) {
        workingval = replacePeriod(iunit, acceptedNumValues)
    }
    workingval = workingval.replace(findNums(iunit), " ");
    workingval = workingval.replace("/", " ");
    workingval = workingval.replace(")", " ");
    workingval = workingval.replace("(", " "); 
    workingval = workingval.split(" ");
    let prepush = ""
    for (x of workingval) {
        try {
            math.unit(x);
            if(x === '' || x === " " || acceptedNumValues.includes(x)) {   
            } else if (x === prepush) {
                a = "_d";
            }else {
                prepush = x;
            }
        } catch (error) {}
        }
    if (prepush === '') {
        return "Not Found";
    } else {
        return prepush + a
    }
}
function replacePeriod(iunit, acceptedNumValues) {
    if (iunit.includes(".")) {
        let result = "";
        for (let i = 0; i < iunit.length; i++) {
            if (iunit[i] === ".") {
                const charBefore = i > 0 ? iunit[i - 1] : '';
                const charAfter = i < iunit.length - 1 ? iunit[i + 1] : '';
                
                if (!acceptedNumValues.includes(charBefore) && !acceptedNumValues.includes(charAfter)) {
                    result += " ";
                } else {
                    result += ".";
                }
            } else {
                result += iunit[i];
            }
        }
        return result;
    }
    return iunit;
}
function findNums(iunit) {
    let unitnum = "";
    for (x of iunit) {
        if (acceptedNumValues.includes(x)) {
            unitnum +=x;
        }
    }
    return parseFloat(unitnum);
}
// Multi-Use Functions


function cleanup(iprice, iunit) {
    // Initialize all used values
    let unit = [], cV;
    // Initialize all used values
    
    // Price Handling
    let price = findNums(iprice);
    if (!iprice.includes("¢")){
        price = parseFloat(price);
    } else {
        price = parseFloat(price) / 100;
    }
    // Price Handling

 
    if (iunit.includes("$") || iunit.includes("¢")) {
        let b = findUnit(iunit);
        if ( (b.slice(b.indexOf("_") ) === "_d")) {
            iunit = iunit.replace(b.replace("_d", ""), " ");             
        }
        prepushindex = iunit.indexOf(b);
        if (iunit.charAt(prepushindex - 1) === "/") {
           // Qty Possibilites - 1 each (49¢ /lb) & 1 each, 49¢ /lb & 1 each, 49¢/lb
           // Qty Possibilites - 1 each ($2.49/lb) & 1 each, $2.49 /lb), $1.99/lb
            ministring = iunit.substring(prepushindex -8, prepushindex);
            if (iunit.includes("¢")) {
                cV = findNums(ministring) / 100;
            } else {
                cV = findNums(ministring);
            }
            unit.push( parseFloat((price / cV).toFixed(3)), findUnit(iunit) );
            
        } else {
            // Qty Possiblilites - 1.99 $ per oz & ($0.34 per oz);
            if (iunit.includes("¢")) {
                cV = findNums(iunit) / 100;
            } else {
                cV = findNums(iunit);
            }
            unit.push( parseFloat((price / cV).toFixed(3)), findUnit(iunit) );
        }
    } else {
        let prepushindex = iunit.indexOf(findUnit(iunit));
        if (iunit.charAt(prepushindex - 1) === "/") {
            // Qty Possibilites - 1.99/lb - Assumption that it is a dollar
            unit.push(parseFloat((price / findNums(iunit)).toFixed(3)), findUnit(iunit));

        } else {
            // Qty Possibilites - 28 oz & /28 oz
            unit.push(findNums(iunit), findUnit(iunit));
        }
    }

    return [price, unit];
};
module.exports  = { cleanup };