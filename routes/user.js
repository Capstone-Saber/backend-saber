const router = require('express').Router()
const db = require('../config/firebase')

router.get('/', async (req, res) => {
  try {
    const allData = []
    const snapshot = await db.collection('users').get();

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