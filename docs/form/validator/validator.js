// 第一步我们先来把这些校验逻辑封装成策略对象
var strategies = {
    // errorMsg参数，提升了适用性
    isNonEmpty: function(value, errorMsg) { //不为空
        if (value === '') {
            // 返回字符串true  错误信息
            return errorMsg;
        }
    },
    minLength: function(value, length, errorMsg) { //限制最小长度
        if (value.length < length) {
            return errorMsg;
        }
    },
    isMobile: function(value, errorMsg) {
        if (!/^1[1|5|8|7|4|3][0-9]{9}$/.test(value)) { //电话号码校验
            return errorMsg;
        }
    }
}
// Validator负责接收用户的请求并委托给strategy对象。
var Validator = function() {
    this.cache = [];
}

Validator.prototype.add = function(ele, rule, errorMsg) {
    var arr = rule.split(':');
    this.cache.push(function() {
        // 规则
        var strategy = arr.shift();
        arr.unshift(ele.value);
        arr.push(errorMsg);
        return strategies[strategy].apply(ele, arr);
    });
}


Validator.prototype.start = function() {
    for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
        var msg = validatorFunc();
        if (msg) {
            return msg;
        }
    }
};

const registerForm =
    document.getElementById('registerForm');

function validateFunc() {
    // 校验处理 分离出去
    var validator = new Validator();
    // 一个个去校验， 
    // 数组  遍历 
    validator.add(registerForm.userName,
        'isNonEmpty', '用户名不能为空');
    validator.add(registerForm.password,
        'minLength:6', '密码长度不能少于6位');
    validator.add(registerForm.phoneNumber,
        'isMobile', '手机号码格式不正确');
    var errorMsg = validator.start();
    // 一个个去校验，  
    return errorMsg;
}
registerForm.onsubmit = function() {
    // 一票规则 数组
    var errorMsg = validateFunc();
    if (errorMsg) {
        alert(errorMsg);
        return false;
    }
}