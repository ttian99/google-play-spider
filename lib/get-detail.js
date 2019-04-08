const puppeteer = require('puppeteer');
const _ = require('lodash');

class DetailSpider {

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await(puppeteer.launch({
            timeout: 50000,
            ignoreHTTPSErrors: true,
            devtools: false,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }));
        this.page = await this.browser.newPage();
    }

    async getDetail(url, flag) {
        if (flag == 'start') {
            await this.init();
        }
        const page = this.page;
        const browser = this.browser;

        console.log(`==== start goto ${url}`);
        await page.goto(url, { timeout: 500000 }).catch(err => console.log(`==== error goto ${url} : ${err}`));
        console.log(`==== over goto ${url}`);

        const name = await page.$eval('h1.AHFaub', (item) => item.querySelector('span').innerText);
        // console.log(`name = ${name}`);

        const [devName, type] = await page.$$eval('a.hrTbp.R8zArc', (arr) => arr.map(item => item.innerText));
        // console.log(`devName = ${devName}`);
        // console.log(`type = ${type}`);

        let scoreStr = await page.$eval('div.pf5lIe', async div => await div.firstChild.getAttribute('aria-label'));
        const scoreArr = scoreStr.match(/\d+\.?\d*/i);
        const score = scoreArr[0];
        // console.log(`score = ${score}`);

        const scorePeople = await page.$eval('span.AYi5wd.TBRnV', span => span.childNodes[0].innerText);
        // console.log(`scorePeople = ${scorePeople}`);

        const obj = await page.$$eval('div.BgcNfc', async divs => {
            let update, size, install, version, website, email;
            for (let i = 0; i < divs.length; i++) {
                const div = divs[i];
                const name = div.innerText;
                const span = div.nextSibling;
                const dataSpan = span.querySelector('span.htlgb');
                if (name == '更新日期') {
                    update = dataSpan.innerText;
                } else if (name == '大小') {
                    size = dataSpan.innerText;
                    size = size.replace('M', '');
                } else if (name == '安装次数') {
                    install = dataSpan.innerText;
                    install = install.replace('+', '');
                } else if (name == '当前版本') {
                    version = dataSpan.innerText;
                } else if (name == '开发者') {
                    // 访问网站
                    const websiteItem = dataSpan.querySelector('a.hrTbp ')
                    website = '';
                    if (websiteItem && websiteItem.innerText == '访问网站') {
                        website = websiteItem.getAttribute('href');
                    }
                    // 联系邮箱
                    email = dataSpan.querySelector('a.hrTbp.KyaTEc').innerText;
                }
            }
            return { update, size, install, version, website, email };
        });

        _.merge(obj, { name, devName, type, score, scorePeople })
        // console.log('********* obj');
        // console.log(obj);
        if (flag == 'end') {
            browser.close();
        }
        return obj;
    }
}

const detailSpider = new DetailSpider();
module.exports = detailSpider;