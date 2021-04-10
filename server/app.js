const path    = require('path')
const dotenv  = require('dotenv')
const morgan  = require('morgan')
const express = require('express')
const passport  = require('passport')
const session   = require('express-session')
const connectDB = require('./config/db')
const app = express()

dotenv.config({ path: './config/config.env' }) // Load config

connectDB() // connect to MongoDB

require('./config/passport')(passport) // Passport config
app.use(passport.initialize()) // Passport middleware
app.use(passport.session())

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
    secret: 'Happy',
    resave: false,
    saveUninitialized: false,
  })
)

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})
app.use(express.static(path.join(__dirname, 'public'))) // Static folder

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT || 3000
app.listen(PORT,
  console.log(`Server running on port ${PORT}`)
)