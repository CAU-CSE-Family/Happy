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

exports.randomString = async function (length){
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
   }
   return result.join('')
  }

module.exports = randomNum