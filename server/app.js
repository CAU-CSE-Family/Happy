const path    = require('path')
const dotenv  = require('dotenv')
dotenv.config({ path: './config/config.env' }) // Load config

const passport   = require('passport')
const session    = require('express-session')
const morgan  = require('morgan')
const express = require('express')
const app     = express()

// connect to MongoDB
const connectDB  = require('./config/db')
connectDB() 

// Static folder
app.use(express.static(path.join(__dirname, 'public'))) 
// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// View ejs - not use now
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Passport config
require('./config/passport')(passport) 
app.use(passport.initialize()) // Passport middleware
app.use(passport.session())

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
  })
)

app.use('/auth', require('./routes/auth'))

app.set('PORT', process.env.PORT || 5000)
app.listen(app.get('PORT'), function() {
  console.log('Server running on port ' + app.get('PORT'))
})

module.exports = app