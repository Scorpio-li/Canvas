function go(obj,attr,target,dir,endFn){
	dir = parseInt(getCss(obj,attr)) > target ? -dir : dir;
	clearInterval(obj.iTimer);
	obj.iTimer = setInterval(function(){
		var raw = parseInt(getCss(obj,attr));
		var blen = raw + dir;
		if(blen > target && dir > 0 || blen < target && dir < 0){
			blen = target;
		}
		obj.style[attr] = blen + 'px';
		if(blen == target){
			clearInterval(obj.iTimer);
			endFn && endFn();
		}
	},30);
}

function getCss(obj,attr){
	return parseFloat(obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr]);
}