const PORT = process.env.PORT || 8080;
const app  = require('./app');
const http = require('http');
const mongoose = require('mongoose');
const server   = http.createServer(app);

(async function () {
  try {
    await mongoose.connect('mongodb://localhost:27017/node-login', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('DB is connected.');
      
    server.listen(PORT, () =>
      console.log("Server is listening on http://localhost:"+PORT)
    );
  }
  catch (err) {
    console.log("DB connection error.");
    console.log(err);
  }
})();