// 异步版本
let animator = new Animator(2000, function(p) {
    let tx = -100 * Math.sin(2 * Math.PI * p),
        ty = -100 * Math.cos(2 * Math.PI * p);

    block.style.transform = 'translate(' +
        tx + 'px,' + ty + 'px)';
});


block.addEventListener('click', async function(evt) {
    let i = 0;

    //noprotect
    while (1) {
        await animator.animate()
        block.style.background = ['red', 'green', 'blue'][i++ % 3];
    }
});