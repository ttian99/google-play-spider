

// var str = 'https://www.gstatic.com/android/market_images/web/favicon_v2.ico';

// var reg = new RegExp('https://play.google.com/store/apps/category/GAME/collection/topselling_free?authuser=0', 'ig');
// var ccc = reg.test(str);
// var ccc = str.test(reg);

var str = '获评 4.2 颗星（最高 5 颗星）';
var reg = /^(获评)(\d+\.\d*)(颗星（最高 5 颗星）$)/ig;
var ccc = reg.test(str);
// var ccc = str.replace(reg, '');
var reg2 = /\d+\.?\d*/i;
var ccc = ('递四方速递sdfsd').match(reg2)

console.log('str = ' + str);
console.log('ccc = ' + ccc);
