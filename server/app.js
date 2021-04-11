const path    = require('path')
const dotenv  = require('dotenv')
const morgan  = require('morgan')
const express = require('express')
const app = express()

const passport  = require('passport')
const session   = require('express-session')
const connectDB = require('./config/db')

dotenv.config({ path: './config/config.env' }) // Load config

connectDB() // connect to MongoDB

// View ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

require('./config/passport')(passport) // Passport config
app.use(passport.initialize()) // Passport middleware
app.use(passport.session())

// Static folder
app.use(express.static(path.join(__dirname, 'public'))) 
// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Logging for dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Sessions
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
)

// Routes
app.use('/', require('./routes/index'))
app.use('/requestSmsCode', require('./routes/index'))
app.use('/requestVerify', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

app.set('PORT', process.env.PORT || 3000)
app.listen(app.get('PORT'), function() {
  console.log('Server running on port ' + app.get('PORT'))
})

module.exports = app