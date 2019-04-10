# facebook-instant-game-spider

## reference
- [Puppeteer实战](https://www.jianshu.com/p/a9a55c03f768)
- [Puppeteer github](https://github.com/GoogleChrome/puppeteer)
- [Puppeteer中文API](https://zhaoqize.github.io/puppeteer-api-zh_CN/)

## use
``` bash
    node main.js
```

## todo
- 1.爬取单个榜单的所有游戏id(即包名)
- 2.爬取榜单内单个游戏的详细信息
- 3.比较榜单内游戏的排名变化(未完成)

## 需要爬取的游戏URL如下
- 热门免费新品-游戏	https://play.google.com/store/apps/category/GAME/collection/topselling_new_free
- 热门付费新品-游戏	https://play.google.com/store/apps/category/GAME/collection/topselling_new_paid
- 热门免费-游戏	https://play.google.com/store/apps/category/GAME/collection/topselling_free
- 热门付费-游戏	https://play.google.com/store/apps/category/GAME/collection/topselling_paid
- 创收最高-游戏	https://play.google.com/store/apps/category/GAME/collection/topgrossing

- 搜索关键字爬取：https://play.google.com/store/search?q=鲨鱼&c=apps&authuser
## [linux依赖库](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)


## 注意问题

- 中文和英文切换：在URL后面加上下列参数
&hl=en-US
&hl=zh-CN
- 未登录账号为英文:
0:"Updated"
1:"Size"
2:"Installs"
3:"Current Version"
4:"Requires Android"
5:"Content Rating"
6:"Interactive Elements"
7:"In-app Products"
8:"Permissions"
9:"Report"
10:"Offered By"
11:"Developer"