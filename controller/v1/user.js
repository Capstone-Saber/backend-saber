const { db } = require('../../config/firebase')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config');

const loginHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (snapshot.empty) {
      const error = new Error("Wrong username or password");
      error.statusCode = 400;
      throw error;
    }

    const foundUser = []
    snapshot.forEach((hasil) => foundUser.push(hasil.data()))
    const {
      name: foundName,
      username: foundUsername,
      password: foundPassword
    } = foundUser[0]

    // const checkPassword = password === foundPassword;
    const checkPassword = await bcrypt.compare(password, foundPassword);

    // Apabila password salah
    if (!checkPassword) {
      const error = new Error("Wrong username or password");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign({
      name: foundName,
      username: foundUsername
    }, jwtSecret, {
      algorithm: "HS256"
    })

    res.status(200).json({
      status: "Success",
      message: 'Login Successful',
      token
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const registerHandler = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SELECT * FROM users WHERE username = username
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    // Ngecek username udah ada atau belum
    if (!snapshot.empty) {
      const error = new Error(`Username ${username} already exist!`);
      error.statusCode = 400;
      throw error;
    }

    // Masukkin data ke table users
    await usersRef.doc().set({
      name: name ? name : username,
      username,
      password: hashedPassword
    });

    // Send response
    res.status(201).json({
      status: "Success",
      message: "Register Successful",
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = { loginHandler, registerHandler }