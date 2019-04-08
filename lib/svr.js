var http = require('http');
var express = require('express');
const app = express()
var compression = require('compression');
const allCrossDomain = require('./middleware/allowCrossDomain');
var favicon = require('serve-favicon');

var glob = require('glob');

var PORT = 9898;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => console.log(`HTTP Server running on port ${PORT}!`))

/** socket链接 */
var io = require('socket.io')(httpServer)
io.on('connection', function (socket) {
    console.log('a user connect');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
})
/** 中间件 */
app.use(express.static('db'));
app.use(allCrossDomain); // 允许跨域访问
// app.use(favicon('res/favicon.ico')); 
app.use(compression()); // 开启Gzip压缩
app.use(function (req, res, next) {  // 记录请求时间
    const start = req.query.startTime;
    const end = new Date().getTime() / 1000;
    const del = (end - start).toFixed(2);
    console.log(`${req.protocol} : ${req.url} | endTime=${end} | delTime=${del}`);
    next();
});

/** 当前任务 */
var curTask = {
    len: 0, // 长度（限制最多能同时进行3个任务）
    name: '', // 当前任务名字
    list: {} // 任务列表
}
var getSearch = require('./get-search');
var getDetailList = require('./get-detail-list');
async function getSearchTask(key) {
    var searchList = await getSearch(null, key);
    // await getDetailTask(searchList, key);
    var data = await getDetailList(searchList, key);
    console.log('over');
    return data;
}

// 获取连接标签
function getLink(fileName) {
    return `<a id="test" download="db/${fileName}" href="data:text/txt;charset=utf-8,download Test Data">${fileName}</a>
    <br/>`
}

// 请求搜索
app.get('/search', async (req, res) => {
    var key = req.query.name;
    if (curTask.state == 1) {
        res.send(`当前已有任务，关键词【${curTask.name}】正在搜索中...`);
        return;
    }
    // res.send(`开始搜索：关键字【${key}】`);
    curTask.state = 1;
    curTask.name = key;
    console.log(key);
    var fileName = await getSearchTask(key);
    curTask.state = 0;
    curTask.name = '';
    // res.send(`完成搜索：关键字【${key}】`);
    // res.send(JSON.stringify(data));
    // var fileName = 'googleplay.热门付费新品.2018.12.12.csv';
    console.log('fileName = ' + fileName);
    var html = `
<a id="test" download="db/${fileName}" href="data:text/txt;charset=utf-8,download Test Data">${fileName}</a>
`;
    res.send(html)
    res.end();
})


// 下载
app.get('/download', function (req, res) {
    var str = '';
    var files = [];
    try {
        files = glob.sync('db/*.csv');
    } catch(e) {
        console.error(e.name + ' : ' + e.message);
    }
    for (let i = 0; i < files.length; i++) {
        var fileName = files[i];
        str += getLink(fileName);
    }
    res.send(str);
})