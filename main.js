const CNT = require('./lib/CNT');
const getList = require('./lib/get-list');
const getDetail = require('./lib/get-detail');

// const EventEmitter = require('events').EventEmitter;
// const eventMgr = new EventEmitter();

const BASE_URL = 'https://play.google.com/store/apps';

// 创建任务
function makeTask() {
    let task = [];
    for (const key in CNT.COLLECTION) {
        const url = `${BASE_URL}/category/GAME/collection/${key}`;
        task.push(url);
    }
    return task;
}

async function getDetailTask(arr) {
    for (let j = 0; j < arr.length; j++) {
        const item = arr[j];
        const url = item.detailUrl;
        const data = await getDetail(url);
    }
}

// 主程序
async function main() {
    var task = makeTask();
    for (let i = 0; i < task.length; i++) {
        const url = task[i];
        console.log(`task start: ${url}`);
        const arr = await getList(url);
        console.log(`task over: ${url}`);
    }
}

// main();

var url = 'https://play.google.com/store/apps/details?id=com.parking.game'
getDetail(url);