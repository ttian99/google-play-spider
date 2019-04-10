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
        let rstObj = { name, devName, type, score, scorePeople, editorsChoice }

        // 其他信息
        let update, size, install, version, website, email;
        // 更新日期
        try {
            update = await page.$$eval('div.BgcNfc', divs => {
                var div = divs.find(div => div.innerText == '更新日期' || div.innerText == 'Updated');
                var dataSpan = div.nextSibling;
                return dataSpan.innerText;
            });
        } catch (error) {
            console.log('获取 更新日期 error: ' + error.message);
        }
        // 大小
        try {
            size = await page.$$eval('div.BgcNfc', divs => {
                var div = divs.find(div => div.innerText == '大小' || div.innerText == 'Size');
                var dataSpan = div.nextSibling;
                return dataSpan.innerText.replace('M', '');
            });
        } catch (error) {
            console.log('获取 大小 error: ' + error.message);
        }

        // 安装次数
        try {
            install = await page.$$eval('div.BgcNfc', divs => {
                var div = divs.find(div => div.innerText == '安装次数' || div.innerText == 'Installs');
                var dataSpan = div.nextSibling;
                return dataSpan.innerText.replace('+', '');
            });
        } catch (error) {
            console.log('获取 安装次数 error: ' + error.message);
        }

        // 当前版本
        try {
            version = await page.$$eval('div.BgcNfc', divs => {
                var div = divs.find(div => div.innerText == '当前版本' || div.innerText == 'Current Version');
                var dataSpan = div.nextSibling;
                return dataSpan.innerText;
            });
        } catch (error) {
            console.log('获取 当前版本 error: ' + error.message);
        }

        // 开发者
        try {
            const obj = await page.$$eval('div.BgcNfc', divs => {
                var div = divs.find(div => div.innerText == '开发者' || div.innerText == 'Developer');
                var dataSpan = div.nextSibling;
                // 访问网站
                // const websiteItem = dataSpan.querySelector('a.hrTbp ');
                const websiteItem = dataSpan.querySelector('a.hrTbp ');
                let websiteStr = '', emailStr = '';
                if (websiteItem && (websiteItem.innerText == '访问网站' || websiteItem.innerText == 'Visit website')) {
                    websiteStr = websiteItem.getAttribute('href');
                }
                // 联系邮箱
                const emailItem = dataSpan.querySelector('a.hrTbp.euBY6b');
                if (emailItem) {
                    emailStr = emailItem.innerText;
                }
                var obj = { websiteStr, emailStr };
                return obj
            });
            website = obj.websiteStr;
            email = obj.emailStr;
        } catch (error) {
            console.log('获取 开发者 error: ' + error.message);
        }

        var otherInfo = {
            update: update,
            size: size,
            install: install,
            version: version,
            website: website,
            email: email,
        };
        _.merge(rstObj, otherInfo);
        if (flag == 'end') {
            browser.close();
        }
        return rstObj;
    }
}

const detailSpider = new DetailSpider();
module.exports = detailSpider;