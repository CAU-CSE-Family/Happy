const user = require('../models/user');

exports.getProfile = email => 
  new Promise((resolve,reject) => {
    user.find({ email: email }, { name: 1, phone:1, email: 1 })
	.then(users => resolve(users[0]))
	.catch(err => reject({ status: 500, message: 'server error.' }))
  });