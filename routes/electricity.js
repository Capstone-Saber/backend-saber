const { Timestamp } = require("@firebase/firestore");
const router = require('express').Router()
const db = require('../config/firebase')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = process.env.TOKEN_SECRET_KEY;
const { nanoid } = require('nanoid')


// // GET all
// router.get('/:alat_id/usages?', async (req, res) => {
//   try {
//     const { alat_id } = req.params;
//     const { date } = req.query;

//     const allData = []
//     const usersRef = db.collection('users');
//     const snapshot = await usersRef.get();

//     snapshot.forEach((hasil) => {
//       allData.push(hasil.data())
//     })

//     res.status(200).json({
//       status: "Success",
//       message: 'Successfully get all users',
//       data: allData
//     })
//   } catch (error) {
//     return res.status(error.statusCode || 500).json({
//       status: "Error",
//       message: error.message,
//     })
//   }
// })

// POST Electricity Usage
router.post('/:alat_id', async (req, res, next) => {
  try {
    const { alat_id } = req.params

    // Ngambil data voltage (double) dan arus (array)
    const { voltage, arus } = req.body;

    const usageID = nanoid()
    const sensorRef = db.collection('sensors').doc(alat_id);
    const usageRef = sensorRef.collection('electricity_usages').doc(usageID)
    const currentRef = usageRef.collection('current_usages')

    let currentTime = Timestamp.fromDate(new Date()).toDate();
    console.log(currentTime)

    // Masukkin data waktu sama voltage ke table electricity_usages
    await usageRef.set({
      voltage,
      timestamp: currentTime
    });
    console.log('tes2')

    const timestampID = Date.now()
    await currentRef.doc(`arus-1_${timestampID}`).set({
      current: arus[0],
      currentID: db.collection('currents').doc('arus_1')
    })
    await currentRef.doc(`arus-2_${timestampID}`).set({
      current: arus[1],
      currentID: db.collection('currents').doc('arus_2')
    })
    await currentRef.doc(`arus-3_${timestampID}`).set({
      current: arus[2],
      currentID: db.collection('currents').doc('arus_3')
    })

    res.status(200).json({
      status: "Success",
      message: 'Data Added',
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