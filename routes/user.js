const router = require('express').Router()
const db = require('../config/firebase')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = process.env.TOKEN_SECRET_KEY;
const { nanoid } = require('nanoid')

router.get('/', async (req, res) => {
  try {
    const allData = []
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    snapshot.forEach((hasil) => {
      allData.push(hasil.data())
    })

    res.status(200).json({
      status: "Success",
      message: 'Successfully get all users',
      data: allData
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
})

router.post("/login", async (req, res, next) => {
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
    }, key, {
      algorithm: "HS256",
      expiresIn: "10d"
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
});

// Register new User
router.post("/register", async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = nanoid()

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
    await usersRef.doc(id).set({
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
});

module.exports = router