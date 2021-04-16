exports.authNo = function (n) {
  var value = ""
  for (var i = 0; i < n; i++) {
    value += parseInt(Math.random() * (10))
  }
  return value
}

exports.randomString = function (length){
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
  }
  return result.join('')
}