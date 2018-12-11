const puppeteer = require('puppeteer');

async function getDetail(url) {
    const browser = await (puppeteer.launch({
        timeout: 50000,
        ignoreHTTPSErrors: true,
        devtools: true,
        headless: false
    }));
    const page = await browser.newPage();

    console.log(`==== start goto ${url}`);
    await page.goto(url, { timeout: 500000 }).catch(err => console.log(`==== error goto ${url} : ${err}`));
    console.log(`==== over goto ${url}`);

    const name = await page.$eval('h1.AHFaub', (item) => item.querySelector('span').innerText);
    console.log(`name = ${name}`);
    const devName = await page.$eval('a.hrTbp.R8zArc', (item) => item.innerText);
    console.log(`devName = ${devName}`);

    return {name, devName};
}

module.exports = getDetail;