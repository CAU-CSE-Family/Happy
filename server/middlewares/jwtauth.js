const jwt = require('../modules/jwt')

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const jwtauth = {
  checkToken: async (req, res, next) => {
    console.log("Body: \n", req.body)
    var token = String(req.headers.authorization)
    token = token.split(" ")[1]
    token = token.replace("\"", "")
    console.log("Token: " + token)

    if (!token)
      return res.status(400).json("No token")
    const user = await jwt.verify(token)
    if (user === TOKEN_EXPIRED)
      return res.status(400).json("Expired token")
    if (user === TOKEN_INVALID)
      return res.status(400).json("Invalid token")
    if (user.id === undefined)
      return res.status(400).json("Invalid token")
    
    req.id = user.id
    next()
  }
}

module.exports = jwtauth