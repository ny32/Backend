/*
Ideal Stores(more later): 
-- Walmart --
Issues with bot-detection bypass and avoidance


-- Lidl --
Parent Container Ref: .product-card

Product Price Ref: .product-price-new__price
Product Name Ref: .product-card__title
Quantity Info(Indirect, requires parsing, requires error catching): .product-card__subtext
Product Image Ref(Optional, requires error catching, .getAttribute() method): .product-card__image > img

-- Aldis -- 
Parent Container Ref: .product-grid__item

Product Price Ref: .base-price__regular > span
Product Name Ref: .product-tile__name > p
Quantity Info(Indirect, requires parsing, requires error catching  and has issue with "oranges" query, 2nd item is a no-show): .product-tile__unit-of-measurement > p
Product Image Ref(Optional, requires error catching, .getAttribute() method): .product-tile__picture > img

-- Wegmans -- 
Parent Container Ref: .css-yxhcyb

Product Price Ref: .css-zqx11d
Product Name Ref: .css-131yigi
Quantity Info(Indirect, requires parsing, requires error catching  and has issue with "oranges" query, 2nd item is a no-show): .css-1kh7mkb
Product Image Ref(Optional, requires error catching, .getAttribute() method):  .css-15zffbe

-- Harris Teeter -- 
Parent Container Ref: .AutoGrid

Product Price Ref: .kds-Price kds-Price--alternate
Product Name Ref: .kds-Link kds-Link--inherit kds-Link--implied ProductDescription-truncated overflow-hidden text-primary
Quantity Info(Indirect, requires parsing, requires error catching  and has issue with "oranges" query, 2nd item is a no-show): .kds-Text--s text-neutral-more-prominent
Product Image Ref(Optional, requires error catching, .getAttribute() method):  .kds-Image-img

*/

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
export async function main(store, query, searchlimit) {
    let parent_container, product_price, product_name, product_quantity, product_image, url;
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
    };
    

    puppeteer.use(StealthPlugin())
    puppeteer.launch({ userDataDir: "./tmp",
        headless: false,
        defaultViewport: false }).then(async browser => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        });
        await page.goto(url + query);
        await page.waitForSelector(parent_container, { timeout: 30000 });
        searchthru = await page.$$(parent_container);
        let price, name, quantity, image;
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
                console.log(price, name, quantity, image);
                searchdepth++;
            } else {
                break;
            }
        }
        await browser.close();
    })
}