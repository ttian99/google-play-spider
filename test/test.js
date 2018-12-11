

var str = 'https://www.gstatic.com/android/market_images/web/favicon_v2.ico';

var reg = new RegExp('https://play.google.com/store/apps/category/GAME/collection/topselling_free?authuser=0', 'ig');
var ccc = reg.test(str);
// var ccc = str.test(reg);
console.log('str = ' + str);
console.log('ccc = ' + ccc);