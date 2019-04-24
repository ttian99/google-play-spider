var http = require('http');
var express = require('express');
const app = express()
var compression = require('compression');
const allCrossDomain = require('./middleware/allowCrossDomain');
var path = require('path');
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
    state: 0, // 0-没有任务 1-有任务
    key: '', // 关键字
    curKey: '', // 上一个搜索的关键词
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
    return `<a id="test" download="${fileName}" href="${fileName}">${fileName}</a>
    <br/>`
}

// 请求搜索
app.get('/search', async (req, res) => {
    var key = req.query.name;
    if (curTask.state > 0) {
        res.send(`当前已有搜索任务【${curTask.key}】，正在搜索关键词【${curTask.curKey}】中...`);
        return;
    }
    curTask.state = 1;
    curTask.key = key;
    curTask.curKey = '';
    // var str = key.toString().replace(/,|，/ig, '|');
    var str = key.toString().replace(/\$/ig, '|');
    var arr = str.split('|');
    console.log('开始：本次搜索任务，key = ' + key);
    console.log(arr);
    // 返回信息
    var str = `开始搜索任务【${key}】, 请稍后访问/download查看
    </br>
    <a href="/download">
        <button>查看</button>
    </a>
    `;
    res.send(str);
    res.end();
    // 开始爬取
    try {
        for (let i = 0; i < arr.length; i++) {
            const keyword = arr[i];
            curTask.curKey = keyword;
            console.log('开始 爬取关键词： ' + keyword);
            var fileName = await getSearchTask(keyword);
            console.log('完成 爬取关键字： ' + keyword + ' , 文件名为： ' + fileName);
        }
        curTask.state = 0;
        curTask.curKey = '';
        console.log('完成 本次搜索任务');
    } catch (error) {
        console.error('错误 本次搜索任务 ：：  ' + error.name + ' : ' + error.message);
    }

});


// 下载
app.get('/download', function (req, res) {
    var str = '';
    var files = [];
    try {
        files = glob.sync('db/*.csv');
    } catch (e) {
        console.error(e.name + ' : ' + e.message);
    }
    for (let i = 0; i < files.length; i++) {
        var fileName = files[i];
        var file = path.basename(fileName);
        str += getLink(file);
    }
    res.send(str);
})

app.get('/', function (req, res) {
    var html = `
    <form action="../search" method="get">
        请输入搜索关键字: 
        <br/>
        <input type="search" name="name" style="width:500px"/>
        <br/>
        <br/>
        <input type="submit"  />
    </form>
    `;
    res.send(html);
});