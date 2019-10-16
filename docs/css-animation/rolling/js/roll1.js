// 一、使用jquery的animate动画
// animate()方法
// $(selector).animate(styles,speed,easing,callback)

// 参数：
// styles:必需参数，需要产生动画的css样式(使用驼峰式命名)
// speed: 规定动画的速度
// @number:1000(ms)
// @string:"slow","normal","fast"
// easing:动画速度（swing,linear）
// callback:函数执行完之后的回调函数

$(document).ready(function() {
    setInterval(function() { // 添加定时器，每1.5s进行转换
        $("#roll").find("ul:first").animate({
            marginTop: "-40px" //每次移动的距离
        }, 500, function() { // 动画运动的时间
            //$(this)指的是ul对象，
            //ul复位之后把第一个元素和第二个元素插入
            //到ul的最后一个元素的位置
            $(this).css({
                marginTop: "0px"
            }).find("li:first").appendTo(this);
            $(this).find("li:first").appendTo(this);
        });
    }, 1500)
});

// 二、使用css3的animation动画
// 通过css3中的关键帧，可以得到跳步的效果。先通过一个短的看一下思路。
function addKeyFrame() {
    var ulObj = $("#roll2 ul"), //获取ul对象
        length = $("#roll2 li").length, //获取li数组长度
        per = 100 / (length / 2 * 2);
    //计算中间间隔百分比
    // 拼接字符串
    var keyframes = `\    
       @keyframes ani{`;
    for (var i = 0; i <= length; i++) {
        keyframes += `${i * per}%{
                           margin-top: ${i % 2 == 0 ? -i * 20 : -(i - 1) * 20}px;
                       }`;
    }
    keyframes += '}';
    var liFirst = $("#roll2 li:first"), //获取第一个元素
        liSec = liFirst.next(); //获取第二个元素
    ulObj.append(liFirst.clone()).append(liSec.clone()); //将两个元素插入到ul里面
    $("<style>").attr("type", "text/css").html(keyframes).appendTo($("head")); //创建style标签把关键帧插入到头部
    ulObj.css("animation", "ani 5s linear infinite"); //给ul添加css3动画
}
addKeyFrame();