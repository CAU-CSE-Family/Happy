const user   = require('../models/user');
const config = require('../config/config.json');
const bcrypt = require('bcryptjs');
const nodemailer   = require('nodemailer');
const randomstring = require("randomstring");


exports.changePassword = (email, password, newPassword) => 
  new Promise((resolve, reject) => {
    user.find({ email: email })
    .then(users => {
      let user = users[0];
	  const hashed_password = user.hashed_password;
      if (bcrypt.compareSync(password, hashed_password)) {
        const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newPassword, salt);
        user.hashed_password = hash;
        return user.save();
      } else {
        reject({ status: 401, message: 'Invalid: same as old password' });
      }
    })
    .then(user => resolve({ status: 200, message: 'password updated.' }))
    .catch(err => reject({ status: 500, message: 'server error.' }));
  });

exports.resetPasswordInit = email =>
  new Promise((resolve, reject) => {
    const random = randomstring.generate(8);
	user.find({ email: email })
    .then(users => {
      if (users.length == 0) {
        reject({ status: 404, message: 'User not found.' });
      } else {
        let user = users[0];
        const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(random, salt);
        user.temp_password = hash;
        user.temp_password_time = new Date();
        return user.save();
      }
	})
	.then(user => {
	  const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);

      const mailOptions = {
        from: `"${config.name}" <${config.email}>`,
        to: email,  
        subject: 'Request: to Reset the password.', 
        html: 
          `Hello ${user.name},
          Your reset password token is <b>${random}</b>.

          If you are viewing this mail from a Android Device then
          Click this <a href="http://learn2crack/${random}">link</a>.
  
          The token is valid for only 30 minutes.
 
          Thank you for using our application.
          Happy app. Admin`
	  };
      return transporter.sendMail(mailOptions);
    })
    .then(info => {
	  console.log(info);
	  resolve({ status: 200, message: 'Check mail for instructions.' })
	})
	.catch(err => {
	  console.log(err);
      reject({ status: 500, message: 'Server error.' });
    });
  });

exports.resetPasswordFinish = (email, token, password) => 
  new Promise((resolve, reject) => {
    user.find({ email: email })
	.then(users => {
      let user = users[0];
      
      const diff = new Date() - new Date(user.temp_password_time); 
	  const seconds = Math.floor(diff / 1000);
	  console.log(`Seconds : ${seconds}`);
      
      if (seconds < 1800) { return user; }
      else {
        reject({ status: 401, message: 'Time out: the token expired.' });
      }
    })
    .then(user => {
      if (bcrypt.compareSync(token, user.temp_password)) {
        const salt = bcrypt.genSaltSync(10);
	    const hash = bcrypt.hashSync(password, salt);
	    user.hashed_password = hash;
        user.temp_password = undefined;
		user.temp_password_time = undefined;
        return user.save();
      } else {
        reject({ status: 401, message: 'Invalid token.' });
      }
	})
    .then(user => resolve({ status: 200, message: 'Password changed.' }))
    .catch(err => reject({ status: 500, message: 'Server error.' }));
  });