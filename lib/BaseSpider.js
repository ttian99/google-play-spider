/** 默认配置 */
const DEFAULT_OPTIONS = {
    timeout: 50000,
    ignoreHTTPSErrors: true,
    devtools: true,
    headless: false
};

class BaseSpider {
    _browser: null,
    _page = null;
    
    get page() {
        return this._page;
    }
    
    get browser() {
        return this._browser;
    }
    
    constructor() { }

    async init(opts) {
        if (!opts) opts = DEFAULT_OPTIONS;
        this._browser = await(puppeteer.launch(opts));
        this._page = await this.browser.newPage();
    }

    async close() {
        this.browser.close();
    }
}

module.exports = BaseSpider;