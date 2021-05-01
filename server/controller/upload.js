const multer = require("multer")
const sharp  = require("sharp")

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) { cb(null, true) }
  else { cb("Please upload only images.", false) }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

const uploadFiles = upload.array("images", 10) // limit to 10 images

exports.uploadImages = (req, res, next) => {
  uploadFiles(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        res.json({result: false, message: "Too many images exceeding the allowed limit."})
      }
    } else if (err) {
      res.json({result: false, message: "Multer error occurred when uploading."})
    }

    next()
  })
}

exports.resizeImages = async (req, res, next) => {
  if (!req.files) return next()

  req.body.images = []
  await Promise.all(
    req.files.map(async file => {
      console.log(file)
      const fileName = file.originalname.replace(/\..+%/, "")
      const newFileName = `${fileNmae}_${Date.now()}.jpeg`

      await sharp(file.buffer)
        .resize(640, 320)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`upload/${newFileNMame}`)

      req.body.images.push(newFileName)
    })
  )

  next()
}

exports.getResult = async (req, res) => {
  if (req.body.images.length <= 0) {
    return res.send('No image selected.')
  }

  const images = req.body.images
    .map(image => "" + image + "")
    .join("");

  return res.send(`Images were uploaded:${images}`)
}