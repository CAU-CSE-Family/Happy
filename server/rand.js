var randomNum = {};

randomNum.random = function (n1, n2) {
    return parseInt(Math.random() * (n2 - n1 + 1)) + n1
}

randomNum.authNo = function (n) {
    var value = ""
    for (var i = 0; i < n; i++) {
        value += randomNum.random(0, 9)
    }
    return value
};

module.exports = randomNum