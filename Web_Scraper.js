/*
Broken cases (why no work):
        case "Harris_Teeter":
            parent_container = ".ProductCard";
            product_price = "";
            product_name = "kds-Link"; 
            product_quantity = "kds-Text--s";
            product_image = ".kds-Image-img";
            url = "https://www.harristeeter.com/search?query=";
            special = true;
            break;
*/
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./Firestore_M.json'));
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
async function webscraper(store, query, searchlimit) {
    let parent_container, product_price, product_name, product_quantity, product_image, url;
    let special = false;
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
        case "Wegmans":
            parent_container = ".css-yxhcyb";
            product_price = ".css-zqx11d";
            product_name = ".css-131yigi";
            product_quantity = ".css-1kh7mkb";
            product_image = ".css-15zffbe";
            url = "https://shop.wegmans.com/search?search_term=";
            break;
        case "Trader_Joes":
            parent_container = ".SearchResults_searchResults__category__2aZDP > div > article";
            product_price = ".ProductPrice_productPrice__price__3-50j";
            product_name = ".SearchResultCard_searchResultCard__title__2PdBv > a";
            product_quantity = ".ProductPrice_productPrice__unit__2jvkA";
            product_image = ".SearchResultCard_searchResultCard__image__2Yf2S > img";
            url = "https://www.traderjoes.com/home/search?q=";
            break;
        case "Safeway":
            parent_container = ".product-card-container";
            product_price = ".product-price__saleprice";
            product_name = ".product-title__name";
            product_quantity = ".product-title__qty > .sr-only";
            product_image = ".product-card-container__product-image";
            url = "https://www.safeway.com/shop/search-results.html?q=";
            break;
    };
    

    puppeteer.use(StealthPlugin())
    puppeteer.launch({ userDataDir: "./tmp"}).then(async browser => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        });
        await page.goto(url + query);
        await page.waitForSelector(parent_container, { timeout: 30000 });
        searchthru = await page.$$(parent_container);
        let price, name, quantity, image, productname;
        let searchdepth = 0;
        for (const x of searchthru) {
            if (searchdepth != searchlimit) {
                price = await x.evaluate((el, product_price) => {
                    const a = el.querySelector(product_price);
                    return a ? a.textContent : null;
                }, product_price);
                name = await x.evaluate((el, product_name) => {
                    const b = el.querySelector(product_name);
                    return b ? b.textContent : null;
                }, product_name);
                quantity = await x.evaluate((el, product_quantity) => {
                    const c = el.querySelector(product_quantity);
                    return c ? c.textContent : null;
                }, product_quantity);
                image = await x.evaluate((el, product_image) => {
                    const d = el.querySelector(product_image);
                    return d ? d.getAttribute('src') : null;
                }, product_image);
                productname = name + "productdepth" + searchdepth.toString();
                if (!data[store]) {
                    data[store] = { Products: {}};
                }
                data[store]["Products"][productname] = {"price": price, "name": name, "unit": quantity, "image": image};
                searchdepth++;
            } else {
                break;
            }
        }
        await browser.close();
        fs.writeFileSync('Firestore_M.json', JSON.stringify(data, null, 2));
    })
}