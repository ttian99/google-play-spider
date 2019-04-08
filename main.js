const CNT = require('./lib/CNT');
const getList = require('./lib/get-list');
const detailSpider = require('./lib/get-detail');
const moment = require('moment');
const fs = require('fs-extra');
const csv = require('fast-csv');
const path = require('path');
const utils = require('./lib/utils');

// 获取游戏榜单链接
function getUrl(collection) {
    const BASE_URL = 'https://play.google.com/store/apps';
    return `${BASE_URL}/category/GAME/collection/${collection}`;
}

// 获取游戏名称
function getFileName(collection) {
    const name = CNT.COLLECTION[collection];
    return `googleplay.${name}.${moment().format('YYYY.MM.DD')}`;
}


async function getDetailTask(arr, collection) {
    console.log('getDetail start ' + collection);
    const fileName = path.join(__dirname, 'temp', getFileName(collection) + '.csv');
    const fileNameNew = path.join(__dirname, 'db', getFileName(collection) + '.csv');

    // 创建可写流
    const writeStream = fs.createWriteStream(fileName);
    const csvStream = csv.createWriteStream({ headers: true });
    writeStream.on('finish', async function () {
        console.log('writeStream finish');
        await utils.utf8ToGbk(fileName, fileNameNew);
        console.log('DONE!');
    });
    csvStream.pipe(writeStream);

    for (let j = 0; j < arr.length; j++) {
        const item = arr[j];
        console.log(`rank = ${item.rank}, id = ${item.id}`);
        const url = item.detailUrl;
        let flag = '';
        if (j == 0) { flag = 'start' };
        if (j == arr.length - 1) { flag = 'end' };
        try {
            const data = await detailSpider.getDetail(url, flag);
            // console.log('data = ' + JSON.stringify(data));
            const newData = {
                '排名': item.rank,
                '游戏名称': data.name,
                '公司名称': data.devName,
                '分类': data.type,
                '评分': data.score,
                '评分人数': data.scorePeople,
                '安装次数+': data.install,
                '更新日期': data.update,
                '大小M': data.size,
                '当前版本': data.version,
                '包名': item.id,
                '网站': data.website,
                '联系方式': data.email
            }
            // 写入数据到表格
            csvStream.write(newData);
        } catch (error) {
            const newData = {
                '排名': item.rank,
                '游戏名称': '无',
                '公司名称': '无',
                '分类': '无',
                '评分': '无',
                '评分人数': '无',
                '安装次数+': '无',
                '更新日期': '无',
                '大小M': '无',
                '当前版本': '无',
                '包名': item.id,
                '网站': '无',
                '联系方式': '无'
            }
            // console.log(newData);
            csvStream.write(newData);
        }
    }
    // 数据写入完成
    csvStream.end();
    console.log('getDetail end ' + collection);
    return;
}

// 主程序
async function main(startId = 0, endId = 9) {
    const arr = Object.keys(CNT.COLLECTION);
    for (let i = 0; i < arr.length; i++) {
        if (i < startId || i > endId) continue;
        const collection = arr[i];
        await getSingleCollection(collection);
    }
}

async function getSingleCollection(collection) {
    const url = getUrl(collection);
    console.log(`task start: ${url}`);
    const list = await getList(url);
    console.log(`task over: ${url}`);
    await getDetailTask(list, collection);
}

// 单独获取
async function getSingleDetail(url) {
    try {
        const data = await detailSpider.getDetail(url, 'start');    
        console.log(data);   
    } catch (error) {
        console.log(error);
        // console.log(data);  
    }
}

async function getSingleDetailTask() {
    const arr = fs.readJsonSync(path.join('temp', 'topselling_new_free.json'));
    await getDetailTask(arr, 'topselling_new_free');
}
// var url1 = 'https://play.google.com/store/apps/details?id=com.vnlentertainment.coc';
// getSingleDetail(url1);

main(0, 0);
// getSingleDetailTask();