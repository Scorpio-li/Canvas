//	beginPath()                 //重置或者开始当前路径
//	strokeStyle                 //设置笔触的颜色，即画出来的颜色
//	arc(x,y,r,sangle,eangle,boolean)      //画一个圆弧，参数分别是：圆心的x，y轴、半径、起始点和结束点、逆时针还是顺时针
//	stroke()                    //绘制定义好的路径
//	font                        //设置字体的属性
//	lineWidth                   //绘制路径时线的宽度
//	strokeText(text,x,y)        //绘制字体,参数分别是：要绘制的字、起始点的x、y坐标
//	clearRect(x,y,width,height)       //清除矩形内所有的路径，参数分别是：矩形起点的x、y坐标、矩形的宽、高
//	save()                      //保存当前环境的状态
//	restore()                   //返回之前保存过的路径状态和属性

window.onload = function() {
    //获取canvas
    var canvas = document.getElementById("canvas2");
    //获取2d上下文
    var context = canvas.getContext("2d");
    //获取画布x轴的中点
    var cirX = canvas.width / 2,
        //获取画布Y轴的中点
        cirY = canvas.height / 2,
        //获取360度圆的百分之一
        rad = Math.PI * 2 / 100,
        //初始值
        n = 1,
        //速度
        speed = 150,
        r = 100;

    //首先绘制最外层比较细的圆
    function writeCircle() {
        context.save(); //save和restore可以保证样式属性只运用于该段canvas元素
        context.beginPath(); //开始路径
        context.strokeStyle = "#49f"; //设置边线的颜色
        context.arc(cirX, cirY, r, 0, Math.PI * 2, false); //画一个圆的路径
        context.stroke(); //绘制边线
        context.restore();
    }

    //接下来我们绘制内层的百分比数，需要用到font设置字体属性，strokeText()绘制数字，因为数字是动的，所以需要传入一个参数n来代表百分比的数字，为了防止传入的是小数，可以通过toFixed()设置小数点后有0位数，即没有小数
    function writeText(n) {
        context.save();
        context.strokeStyle = "#49f";
        context.font = "40px Arial";
        context.strokeText(n.toFixed(0) + "%", cirX - 30, cirY + 10);
        context.stroke();
        context.restore();
    }

    //最后绘制外层粗线圆，这里通过lineWidth属性将边线设置比原始的粗即可，然后传入参数n，因为这个是按角度画的，所以n要乘以我们最上面定义的rad，即100%为360度，另外还要注意的是圆的起始点，arc()绘制圆的时候起始点是最右侧的点，而我们的起点需要是圆最上方的，所以起始角度应该为 -Math.PI/2
    function writeBlue(n) {
        context.save();
        context.strokeStyle = "#49f"; //设置边线颜色
        context.lineWidth = 4; //设置边线宽度
        context.beginPath();
        context.arc(cirX, cirY, r, -Math.PI / 2, -Math.PI / 2 + rad * n, false); //画圆
        context.stroke();
        context.restore();
    }

    function DreamLoading() {
        //清除所有，重新绘制
        context.clearRect(0, 0, canvas.width, canvas.height)

        writeCircle();
        writeText(n);
        writeBlue(n)
        if (n < 100) {
            n = n + 0.1;
        } else {
            n = 0;
        }
        //setTimeout(DreamLoading,speed);
        requestAnimationFrame(DreamLoading);
    }
    DreamLoading();
}