const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

/**
 * @method getList 
 * @param {*} url 
 * 这是爬取的第一步，首先获取排行榜总的列表
 */
async function getList(url) {
    const browser = await (puppeteer.launch({
        timeout: 50000,
        ignoreHTTPSErrors: true,
        devtools: false,
        headless: true
    }));
    const page = await browser.newPage();

    console.log(`==== start goto ${url}`);
    await page.goto(url, { timeout: 500000 }).catch(err => console.log(`==== error goto ${url} : ${err}`));
    console.log(`==== over goto ${url}`);
    await page.waitForResponse('https://www.gstatic.com/android/market_images/web/favicon_v2.ico');

    // 滑到页面底部
    async function pageEnd(id) {
        console.log(`page End ${id}`);
        await page.keyboard.press('End');
        // await page.waitForResponse(`${url}?authuser=0`);
        await page.waitFor(5000);
    }
    // 点击更多游戏按钮
    async function moreGame(id) {
        console.log(`more game ${id}`);
        await page.$eval('button#show-more-button', async (showMoreBtn) => {
            await showMoreBtn.click();
        });
        await page.waitFor(5000);
    }

    // 开始获取所有游戏
    async function getAll() {
        for (let j = 0; j < 9; j++) {
            const id = j + 1;
            if (id === 5) {
                await moreGame(id);
            } else {
                await pageEnd(id);
            }
        }
        return;
    }

    await getAll();
    await page.waitFor(5000);

    try {
        const ctx = await page.$('div.id-card-list.card-list.two-cards');
        const dataArr = await ctx.$$eval('div.card.no-rationale.square-cover.apps.small', async (nodes) => {
            var arr = [];
            for (let i = 0; i < nodes.length; i++) {
                const item = nodes[i];
                // 获取id
                const id = await item.getAttribute('data-docid');
                const detailUrl = `https://play.google.com/store/apps/details?id=${id}`;
                // 获取图片src
                const img = await item.querySelector('img.cover-image');
                const icon = await img.getAttribute('src');
                // 获取游戏名
                const title = await item.querySelector('a.title');
                const name = await title.getAttribute('title');
                // 获取开发商名字
                const subtitle = await item.querySelector('a.subtitle');
                const dev = await subtitle.getAttribute('title');
                arr.push({ rank: i + 1, id, name, dev, icon, detailUrl });
            }
            return arr;
        });
        console.log('====> arr ====');
        console.log(dataArr);
        let fileName = url.replace('https://play.google.com/store/apps/category/GAME/collection/', '');
        fileName = path.join('temp', fileName + '.json');
        await fs.writeJson(fileName, dataArr, { encoding: 'utf8' });
        browser.close();
        return dataArr;
    } catch (error) {
        console.error(error);
    }
}

module.exports = getList;