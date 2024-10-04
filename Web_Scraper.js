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
    const fs = require('fs');
    const { cleanup } = require('./Cleanup.js');
    const data = JSON.parse(fs.readFileSync('./Firestore_M_copy.json'));
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    let returnData;

    async function webscraper(store, query, searchlimit) {
        let parent_container, product_price, product_name, product_quantity, product_image, url;
        // Configure the scraper based on the store
        switch (store) {
            case "Lidl":
                parent_container = ".product-card";
                product_price = ".product-price-new__price";
                product_name = ".product-card__title";
                product_quantity = ".product-card__subtext";
                product_image = ".product-card__image > img";
                url = "https://www.lidl.com/search/products/";
                break;
            case "Aldi":
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
            case "Safeway":
                parent_container = ".product-card-container";
                product_price = ".product-price__saleprice";
                product_name = ".product-title__name";
                product_quantity = ".product-title__qty > .sr-only";
                product_image = ".product-card-container__product-image";
                url = "https://www.safeway.com/shop/search-results.html?q=";
                break;
        };

        puppeteer.use(StealthPlugin());
        const browser = await puppeteer.launch({ userDataDir: "./tmp" });
        try {
            const page = await browser.newPage();
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
                    return b ? b.textContent.trim() : null;
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

                if (!data["GroceryStores"][store]) {
                    data["GroceryStores"][store] = { "Products": {} };
                }

                // Check if product already exists before adding
                if (!data["GroceryStores"][store]["Products"][uniqueKey]) {
                    data["GroceryStores"][store]["Products"][uniqueKey] = { price, name, unit: quantity, image };
                    searchdepth++;
                    returnData = data["GroceryStores"][store]["Products"][uniqueKey];
                } else {
                    console.log(`Duplicate found for ${name} in ${store}. Skipping...`);
                }
            }

            // Write updated data back to the JSON file
            fs.writeFileSync('Firestore_M_copy.json', JSON.stringify(data, null, 2));

            // Optionally return the scraped data
            return returnData;
        } catch (error) {
            console.error("Error during web scraping:", error);
        } finally {
            await browser.close();
        }
    }

    module.exports = { webscraper };
