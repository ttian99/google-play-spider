const puppeteer = require('puppeteer');

/**
 * @method spider 新建爬虫页面
 */
async function spider() {
    const browser = await (puppeteer.launch({
        timeout: 50000,
        ignoreHTTPSErrors: true,
        devtools: true,
        headless: false
    }));
    const page = await browser.newPage();
    return {
        browser: browser,
        page: page
    }
}

module.export = spider;