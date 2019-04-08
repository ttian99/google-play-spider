var http = require('http');
var express = require('express');
const app = express()
var compression = require('compression');
const allCrossDomain = require('./middleware/allowCrossDomain');

var glob = require('glob');

var PORT = 9898;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => console.log(`HTTP Server running on port ${PORT}!`))

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
    console.log(`${key} 总长度: ${searchList.length}`);
    var data = await getDetailList(searchList, key);
    console.log(`${key} over`);
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
    if (curTask.len >= 3) {
        var nowKeys = '';
        for (const key in curTask.list) {
            if (curTask.list.hasOwnProperty(key)) {
                nowKeys += key + ' , ';
            }
        }
        res.send(`暂时只允许同时爬取3个关键词, 目前爬取的关键词有【${nowKeys}】`);
        return;
    }

    if (curTask[key]) {
        res.send(`当前已有任务，关键词【${curTask.name}】正在搜索中...`);
        return;
    }

    curTask.len++;
    curTask.list[key] = true;
    // 返回信息
    var str = `开始搜索关键词【${key}】, 请稍后访问/download查看
    </br>
    <a href="/download">
        <button>查看</button>
    </a>
    `;
    res.send(str);
    res.end();

    // 开始爬取
    var fileName = await getSearchTask(key);
    console.log('fileName = ' + fileName);
    curTask.len--;
    delete curTask.list[key];
});


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

app.get('/', function(req, res) {
    var html = `
    <form action="../search" method="get">
        请输入搜索关键字: <input type="search" name="name"/>
        <input type="submit"  />
    </form>
    `;
    res.send(html);
});