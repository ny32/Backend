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

*/

const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "./tmp",
        headless: false,
        defaultViewport: false
    })
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    await page.goto("https://new.aldi.us/results?q=oranges");

    searchthru = await page.$$(".product-grid__item");
    for (const x of searchthru) {
        try {const price = await x.evaluate(y => y.querySelector(".product-tile__picture > img").getAttribute('src'));
            console.log(price);} catch{}
    }
    await browser.close();
})() 