/*
Broken cases (why no work):
case "Harris_Teeter":
    parent_container = ".ProductCard";
    product_price = "";
    product_name = "kds-Link"; 
    product_quantity = "kds-Text--s";
    product_image = ".kds-Image-img";
    url = "https://www.harristeeter.com/search?query=";
    break;
*/
const { cleanup } = require('./cleanUpFunction.js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { admin, db } = require('./firebase');

let returnData;

async function webscraper(store, query, searchlimit, location) {
    let parent_container, product_price, product_name, product_quantity, product_image, url;
    
    // Configure the scraper based on the store
    switch (store) {
        case "lidl":
            parent_container = ".product-card";
            product_price = ".product-price-new__price";
            product_name = ".product-card__title";
            product_quantity = ".product-card__subtext";
            product_image = ".product-card__image > img";
            url = "https://www.lidl.com/search/products/";
            break;
        case "aldi":
            parent_container = ".product-grid__item";
            product_price = ".base-price__regular > span";
            product_name = ".product-tile__name > p";
            product_quantity = ".product-tile__unit-of-measurement > p";
            product_image = ".product-tile__picture > img";
            url = "https://new.aldi.us/results?q=";
            break;
        // case "Wegmans":
        //     parent_container = ".css-yxhcyb";
        //     product_price = ".css-zqx11d";
        //     product_name = ".css-131yigi";
        //     product_quantity = ".css-1kh7mkb";
        //     product_image = ".css-15zffbe";
        //     url = "https://shop.wegmans.com/search?search_term=";
        //     break;
        // Geolocation doesn't change
        //     case "safeway":
        //         parent_container = ".product-card-container";
        //         product_price = ".product-price__saleprice";
        //         product_name = ".product-title__name";
        //         product_quantity = ".product-title__qty > .sr-only";
        //         product_image = ".product-card-container__product-image";
        //         url = "https://www.safeway.com/shop/search-results.html?q=";
        //         break;
    }

    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ userDataDir: "./tmp" });
    try {
        const page = await browser.newPage();
        //Location settings
        await page.setGeolocation({
            latitude: location[0],
            longitude: location[1],
            accuracy: 100,
        });
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(url, ['geolocation']);

        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        });
        await page.goto(url + query);
        await page.waitForSelector(parent_container, { timeout: 30000 });

        const searchthru = await page.$$(parent_container);
        let searchdepth = 0;

        for (const x of searchthru) {
            if (searchdepth >= searchlimit) {
                break; // Break if we've reached the search limit
            }

            const rawPrice = await x.evaluate((el, product_price) => {
                const a = el.querySelector(product_price);
                return a ? a.textContent.trim() : null;
            }, product_price);
            const name = await x.evaluate((el, product_name) => {
                const b = el.querySelector(product_name);
                return b ? (b.textContent.trim()).toLowerCase() : null;
            }, product_name);
            const rawQuantity = await x.evaluate((el, product_quantity) => {
                const c = el.querySelector(product_quantity);
                return c ? c.textContent.trim() : null;
            }, product_quantity);
            const image = await x.evaluate((el, product_image) => {
                const d = el.querySelector(product_image);
                return d ? d.getAttribute('src') : null;
            }, product_image);

            const price = cleanup(rawPrice, rawQuantity)[0];
            const quantity = cleanup(rawPrice, rawQuantity)[1];

            // Define a unique key for the product
            const uniqueKey = name.toLowerCase().trim().replace(/\s+/g, '_');

            // Check if product already exists before adding
            const docRef = db.collection('GroceryStores').doc(store).collection('Products').doc(uniqueKey);
            const doc = await docRef.get();
            
            nameArray = name.split(' ');

            if (!doc.exists) {
                // Save product data to Firestore
                await docRef.set({
                    price,
                    nameArray,
                    unit: quantity,
                    image
                });
                searchdepth++;
                returnData = { price, name, unit: quantity, image };
            } else {
                console.log(`Duplicate found for ${name} in ${store} database. Skipping...`);
                break;
            }
        }

        // Optionally return the scraped data
        return returnData;
    } catch (error) {
        console.error("Error during web scraping:", error);
    } finally {
        await browser.close();
    }
}

module.exports = { webscraper };