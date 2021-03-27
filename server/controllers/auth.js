const User = require("../models//user");
const bcrypt = require("bcryptjs");

const createUserData = async (userInput) => { 
  const user = await userWithEncodePassword(userInput); 
  return user.save();
};

const userWithEncodePassword = async ({
  password,
  name,
  phone,
}) => {

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    password: hashedPassword,
    name,
    phone,
  });
  return user;
};

const errorGenerator = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const signUp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (user) errorGenerator("The phone number is duplicated", 404);
  
    await createUserData(req.body);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    next(err);
  }
};

module.exports = { signUp };
