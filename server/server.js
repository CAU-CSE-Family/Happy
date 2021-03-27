require('dotenv').config();
const PORT = process.env.PORT || 8000;
const app = require('./app');
const http = require("http");
const mongoose = require("mongoose");
const server = http.createServer(app);

const MONGO_URL = "mongodb+srv://root:root@happycluster.ehdqt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

(async function () {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("DB CONNECTED");
      
    server.listen(PORT, () =>
      console.log("Server is listening on ${PORT}")
    );
  } catch (err) {
    console.log("DB CONNECTION ERROR");
    console.log(err);
  }
})();
