const path    = require('path')
const dotenv  = require('dotenv')
dotenv.config({ path: './config/config.env' }) // Load config

const Image = require('../models/image')

exports.uploadImage = async function (req, res){
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  }

  Image.create(obj, (err, item) => {
    if (err) { res.json({result: false, message: err}) }
    else {
      item.save()
      res.json({result: true, message: "Successfully uploaded image."})
    }
  })
}

exports.getImages = async function (req, res){
  Image.find({}, (err, items) => {
    if (err) {
      console.log(err)
      res.json({result: false, message: err})
    }
    else {
      res.json({result: true, message: "Successfully get images.", images: items})
    }
  })
}