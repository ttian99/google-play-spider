var path = require('path');
var detailSpider = require('./get-detail');
var moment = require('moment');
var fs = require('fs-extra');
const csvtojson = require('csvtojson');
const iconv = require('iconv-lite');
const csv = require('fast-csv');
const utils = require('./utils');

// 获取游戏名称
function getFileName(name) {
    return 'googleplay.' + name + '.' + moment().format('YYYY.MM.DD');
}

async function getDetailList(arr, collection) {
    console.log('getDetailList start ' + collection);
    const fileName = path.join(__dirname, '../temp', getFileName(collection) + '.csv');
    const fileNameNew = path.join(__dirname, '../db', getFileName(collection) + '.csv');

    // 创建可写流
    const writeStream = fs.createWriteStream(fileName);
    const csvStream = csv.createWriteStream({ headers: true });
    writeStream.on('finish', async function () {
        console.log('writeStream finish');
        await utils.utf8ToGbk(fileName, fileNameNew);
        console.log('DONE!');
    });
    csvStream.pipe(writeStream);
    // var arr11 = [];
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
            // arr11[j] = newData;
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
            // arr11[j] = newData;
        }
    }
    // 数据写入完成
    csvStream.end();
    console.log('getDetail end ' + collection);
    // return arr11;
    return path.basename(fileName);
}


module.exports = getDetailList;