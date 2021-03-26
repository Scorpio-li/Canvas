// 兼容版本
var a1 = new Animator(1000, function(p) {
    var tx = 100 * p;
    block.style.transform = 'translateX(' +
        tx + 'px)';
});

var a2 = new Animator(1000, function(p) {
    var ty = 100 * p;
    block.style.transform = 'translate(100px,' +
        ty + 'px)';
});

var a3 = new Animator(1000, function(p) {
    var tx = 100 * (1 - p);
    block.style.transform = 'translate(' +
        tx + 'px, 100px)';
});

var a4 = new Animator(1000, function(p) {
    var ty = 100 * (1 - p);
    block.style.transform = 'translateY(' +
        ty + 'px)';
});


block.addEventListener('click', async function() {
    await a1.animate();
    await a2.animate();
    await a3.animate();
    await a4.animate();
});