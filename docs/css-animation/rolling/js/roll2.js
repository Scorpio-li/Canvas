// 方法一：
// 触发条件函数
// function lowEnough(){
//            var pageHeight = Math.max(document.body.scrollHeight,document.body.offsetHeight);
//            var viewportHeight = window.innerHeight || 
//                document.documentElement.clientHeight ||
//                document.body.clientHeight || 0;
//            var scrollHeight = window.pageYOffset ||
//                document.documentElement.scrollTop ||
//                document.body.scrollTop || 0;
//            return pageHeight - viewportHeight - scrollHeight < 20;  // 通过 真实内容高度 - 视窗高度 - 上面隐藏的高度 < 20，作为加载的触发条件
//        }


// 方法二
function infinityScroll(footerNode, callback) {
    /*
    time：可见性发生变化的时间，是一个高精度时间戳，单位为毫秒
    target：被观察的目标元素，是一个 DOM 节点对象
    rootBounds：根元素的矩形区域的信息，getBoundingClientRect()方法的返回值，如果没有根元素（即直接相对于视口滚动），则返回null
    boundingClientRect：目标元素的矩形区域的信息
    intersectionRect：目标元素与视口（或根元素）的交叉区域的信息
    intersectionRatio：目标元素的可见比例，即intersectionRect占boundingClientRect的比例，完全可见时为1，完全不可见时小于等于0
    */
    var observer = new IntersectionObserver(function(changes) {

        // 注意intersectionRatio这个属性值的判断
        if (changes[0].intersectionRatio <= 0) return;

        callback();

    });
    // 开始观察
    observer.observe(document.querySelector(footerNode));
    // 停止观察
    //         io.unobserve(element);

    //         // 关闭观察器
    //         io.disconnect();
}
infinityScroll('.scrollerFooter1', function() {
    for (var i = 0; i < 3; i++) {
        document.getElementById('container').appendChild(document.getElementById('container').firstChild)
    }
});

// 懒加载
// function lazyLoad(imgClassName) {
//         const imgList = Array.from(document.querySelectorAll(imgClassName));
// var io = new IntersectionObserver(function (ioes) {
//     ioes.forEach(function (ioe) {
//         var el = ioe.target;
//         var intersectionRatio = ioe.intersectionRatio;
//         if (intersectionRatio > 0 && intersectionRatio <= 1) {
//             if (!el.src) {
//                 el.src = el.dataset.src
//             }
//         }
//     })
// });
// imgList.forEach(function(item) {
//     io.observe(item)
// });
// }
// lazyLoad('.my-photo');