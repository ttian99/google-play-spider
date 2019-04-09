const puppeteer = require('puppeteer');
const _ = require('lodash');

class DetailSpider {

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await (puppeteer.launch({
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

        let [name, devName, type, editorsChoice, score, scorePeople] = ['', '', '', '', '', '', '', '']

        // 游戏名称
        try {
            name = await page.$eval('h1.AHFaub', (item) => item.querySelector('span').innerText);
        } catch (error) {
            console.error(error);
        }
        // 开发者 类型
        try {
            [devName, type] = await page.$$eval('a.hrTbp.R8zArc', (arr) => arr.map(item => item.innerText));
        } catch (err) {
            console.error(error);
        }
        // 编辑推荐
        try {
            const editorsChoiceItem = await page.$('span.giozf');
            editorsChoice = editorsChoiceItem ? true : false;
        } catch (error) {
            console.error(error);
        }
        // 游戏评分
        try {
            const scoreStr = await page.$eval('div.dNLKff', async (div) => {
                const father = div.querySelector('c-wiz');
                return await father.firstChild.firstChild.getAttribute('aria-label');
            });
            const scoreArr = scoreStr.match(/\d+\.?\d*/i);
            score = scoreArr[0];
        } catch (error) { 
            console.error(error);
        }

        // 评分人数
        try {
            scorePeople = await page.$eval('span.AYi5wd.TBRnV', span => span.childNodes[0].innerText);
        } catch (error) {
            console.error(error);
        }

        // 其他信息
        let obj = {};
        try {
            obj = await page.$$eval('div.BgcNfc', async (divs) => {
                let pArr = [];
                let update, size, install, version, website, email;

                for (let i = 0; i < divs.length; i++) {
                    const div = divs[i];
                    const name = div.innerText;
                    const span = div.nextSibling;
                    const dataSpan = span.querySelector('span.htlgb');
                    if (!dataSpan) {
                        pArr.push(romise.resolve);
                        continue;
                    }
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
                        const emailItem = dataSpan.querySelector('a.hrTbp.euBY6b');
                        // const emailItem = dataSpan.querySelector('a.hrTbp.KyaTEc');
                        if (emailItem) email = emailItem.innerText;
                    }
                    pArr.push(Promise.resolve);
                }

                return Promise.all(pArr).then(() => {
                    return {
                        update: update,
                        size: size,
                        install: install,
                        version: version,
                        website: website,
                        email: email,
                    };
                });
            });
            _.merge(obj, { name, devName, type, score, scorePeople, editorsChoice })
        } catch (error) {
            console.error(error);
        }

        if (flag == 'end') {
            browser.close();
        }
        return obj;
    }
}

const detailSpider = new DetailSpider();
module.exports = detailSpider;