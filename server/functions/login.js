const user = require('../models/user');
const bcrypt = require('bcryptjs');

exports.loginUser = (email, password) => 
  new Promise((resolve,reject) => {
    user.find({email: email})
	.then(users => {
      if (users.length == 0) {
        reject({ status: 404, message: 'User not found.' });
      } else {
        return users[0];
      }
	})
	.then(user => {
      const hashed_password = user.hashed_password;
      if (bcrypt.compareSync(password, hashed_password)) {
        resolve({ status: 200, message: email });
      } else {
        reject({ status: 401, message: 'Invalid credentialse.' });
      }
	})
	.catch(err => reject({ status: 500, message: 'server error.' }));
  });