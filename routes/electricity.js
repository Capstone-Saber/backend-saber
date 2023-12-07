const { Timestamp } = require("@firebase/firestore");
const router = require('express').Router()
const db = require('../config/firebase')

const jwt = require('jsonwebtoken');
const key = process.env.TOKEN_SECRET_KEY;
const { nanoid } = require('nanoid')


// [GET] Get electricity usage from DB
router.get('/:alat_id/usages', async (req, res) => {
  try {
    const { alat_id } = req.params;
    const { date } = req.query;

    const usages = []

    // Get start time of usages
    const startTime = date ? new Date(date) : new Date();
    startTime.setHours(0, 0, 0, 0)

    // Get end time of usages
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + 1)
    endTime.setHours(0, 0, 0, 0)

    const convertedDate = startTime.getFullYear() + "-" + startTime.getMonth() + "-" + startTime.getDate()

    // Get all usages data from a sensor where date == date
    const sensorRef = db.collection('sensors').doc(alat_id);
    const usagesRef = sensorRef.collection('electricity_usages')
    const usagesSnapshot = await usagesRef
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<', endTime)
      .orderBy('timestamp')
      .get()
    // const usagesSnapshot = await usagesRef.get();

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    usagesSnapshot.forEach(usageSnapshot => {
      const { voltage, timestamp } = usageSnapshot.data()
      const convertedTime = timestamp.toDate()
      const hourMinute = ("0" + convertedTime.getHours()).slice(-2) + "." + ("0" + convertedTime.getMinutes()).slice(-2)
      usages.push({
        _id: usageSnapshot.id,
        voltage,
        timestamp: hourMinute
      })
    })

    const result = usages.map(async usage => {
      let powerSum = 0

      // Query all current usages by seconds
      const currentUsagesSnapshot = await usagesRef.doc(usage._id).collection("current_usages").get()
      currentUsagesSnapshot.forEach((currentUsageSnapshot) => {
        const { current } = currentUsageSnapshot.data()
        const power = current * usage.voltage
        powerSum += power;
      })
      return { ...usage, totalPower: powerSum }
    })

    Promise.all(result).then((usageResult => {
      const groupedUsageById = Object.entries(
        usageResult.reduce((acc, { timestamp, totalPower }) => {
          // Group initialization
          if (!acc[timestamp]) {
            acc[timestamp] = [];
          }
          // Grouping
          acc[timestamp].push(totalPower);
          return acc;
        }, {})
      ).map(([timestamp, totalPower]) => {
        const avgPower = totalPower.reduce((a, b) => a + b, 0) / totalPower.length;
        return ({ timestamp, avgPower })
      });

      res.status(200).json({
        status: "Success",
        message: `Successfully get all power usages on ${convertedDate}`,
        data: groupedUsageById
      })
    }))
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
})

// [POST] Send electricity usage from IoT device
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

    // Masukkin data waktu sama voltage ke table electricity_usages
    await usageRef.set({
      voltage,
      timestamp: currentTime
    });

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

module.exports = router