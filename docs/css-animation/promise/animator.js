// Animator 构造的时候可以传三个参数，
// 第一个是动画的总时长，
// 第二个是动画每一帧的 update 事件，在这里可以改变元素的属性，从而实现动画，
// 第三个参数是 easing。其中第二个参数 update 事件回调提供两个参数，一是 ep，是经过 easing 之后的动画进程，二是 p，是不经过 easing 的动画进程，ep 和 p 的值都是从 0 开始，到 1 结束。

function Animator(duration, update, easing) {
    this.duration = duration;
    this.update = update;
    this.easing = easing;
}

Animator.prototype = {

    animate: function() {

        var startTime = 0,
            duration = this.duration,
            update = this.update,
            easing = this.easing,
            self = this;

        return new Promise(function(resolve, reject) {
            var qId = 0;

            function step(timestamp) {
                startTime = startTime || timestamp;
                var p = Math.min(1.0, (timestamp - startTime) / duration);

                update.call(self, easing ? easing(p) : p, p);

                if (p < 1.0) {
                    qId = requestAnimationFrame(step);
                } else {
                    resolve(self);
                }
            }

            self.cancel = function() {
                cancelAnimationFrame(qId);
                update.call(self, 0, 0);
                reject('User canceled!');
            }

            qId = requestAnimationFrame(step);
        });
    },
    ease: function(easing) {
        return new Animator(this.duration, this.update, easing);
    }
};

// module.exports = Animator;