const multer = require('multer')

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      const ext = file.originalname
      cb(null, file.fieldname + '-' + Date.now() + ext)
    }
  })

module.exports = store = multer({ storage: storage })