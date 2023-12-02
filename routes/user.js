const router = require('express').Router()
const db = require('../config/firebase')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = process.env.TOKEN_SECRET_KEY;

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

    const checkPassword = password === foundPassword;
    // const checkPassword = await bcrypt.compare(password, foundUser[0].password);

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
      data: token
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
});

// router.post('/data', (req, res) => {
//   db.settings({
//     timestampsInSnapshots: true
//   })
//   db.collection('karyawan').add({
//     nama: req.body.nama,
//     usia: req.body.usia,
//     kota: req.body.kota,
//     waktu: new Date()
//   })
//   res.send({
//     nama: req.body.nama,
//     usia: req.body.usia,
//     kota: req.body.kota,
//     waktu: new Date()
//   })
// })

module.exports = router