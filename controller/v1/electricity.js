const { db, FieldValue } = require('../../config/firebase')
const { Timestamp } = require("@firebase/firestore");
const { nanoid } = require('nanoid')

const averagePowerHandler = async (req, res) => {
  try {
    const { alat_id } = req.params;
    const { date } = req.query;
    const usages = []
    const newDate = date ? new Date(date) : new Date();
    newDate.setUTCHours(0, 0, 0)
    // Get start time of usage
    const startTime = newDate;
    // Convert the time to UTC. I know it's a bad practice :(
    startTime.setUTCHours(startTime.getUTCHours() - 7);
    // Get end time of usages
    const endTime = new Date(startTime);
    endTime.setUTCDate(startTime.getUTCDate() + 1)
    // Convert date to YYYY-MM-DD
    const convertedDate = newDate.getUTCFullYear() + "-" +
      (newDate.getUTCMonth() + 1) + "-" +
      (newDate.getUTCDate() + 1)

    // Get all usages data from a sensor where date == date
    const sensorRef = db.collection('sensors').doc(alat_id);
    const usagesRef = sensorRef.collection('electricity_usages')
    const usagesSnapshot = await usagesRef
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<', endTime)
      .orderBy('timestamp')
      .get()

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    // Insert each docs to usages object
    usagesSnapshot.forEach(usageSnapshot => {
      const { voltage, timestamp } = usageSnapshot.data()
      let convertedTime = timestamp.toDate()
      convertedTime.setUTCHours(convertedTime.getUTCHours() + 7) // Convert back the time to UTC+7
      const hourMinute = ("0" + (convertedTime.getUTCHours())).slice(-2) + "." +
        ("0" + convertedTime.getUTCMinutes()).slice(-2)
      usages.push({
        _id: usageSnapshot.id,
        voltage,
        timestamp: hourMinute,
      })
    })

    const result = usages.map(async usage => {
      let powerSum = 0
      // Query all current usages by seconds
      const currentUsagesSnapshot = await usagesRef.doc(usage._id).collection("current_usages").get()
      currentUsagesSnapshot.forEach((currentUsageSnapshot) => {
        const { current } = currentUsageSnapshot.data()
        const power = current * usage.voltage // Calculate the power from each current
        powerSum += power; // Accumulate all power from each current
      })
      return { ...usage, totalPower: powerSum }
    })

    Promise.all(result).then((usageResult => {
      const groupedUsageById = Object.entries(
        usageResult.reduce((acc, { timestamp, totalPower }) => {
          // Group initialization
          if (!acc[timestamp]) acc[timestamp] = [];
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
}

const averageElectricityHandler = async (req, res) => {
  try {
    const { alat_id } = req.params;
    const { date } = req.query;
    const usages = []
    const newDate = date ? new Date(date) : new Date();
    newDate.setUTCHours(0, 0, 0)
    // Get start time of usage
    const startTime = newDate;
    // Convert the time to UTC. I know it's a bad practice :(
    startTime.setUTCHours(startTime.getUTCHours() - 7);
    // Get end time of usages
    const endTime = new Date(startTime);
    endTime.setUTCDate(startTime.getUTCDate() + 1)
    // Convert date to YYYY-MM-DD
    const convertedDate = newDate.getUTCFullYear() + "-" +
      (newDate.getUTCMonth() + 1) + "-" +
      (newDate.getUTCDate() + 1)

    // Get all usages data from a sensor where date == date
    const sensorRef = db.collection('sensors').doc(alat_id);
    const usagesRef = sensorRef.collection('electricity_usages')
    const usagesSnapshot = await usagesRef
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<', endTime)
      .orderBy('timestamp')
      .get()

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    // Insert each docs to usages object
    usagesSnapshot.forEach(usageSnapshot => {
      const { voltage, timestamp } = usageSnapshot.data()
      let convertedTime = timestamp.toDate()
      convertedTime.setUTCHours(convertedTime.getUTCHours() + 7) // Convert back the time to UTC+7
      const time =
        ("0" + (convertedTime.getUTCHours())).slice(-2) + ":" +
        ("0" + convertedTime.getUTCMinutes()).slice(-2) + ":" +
        ("0" + convertedTime.getUTCSeconds()).slice(-2)
      usages.push({
        _id: usageSnapshot.id,
        voltage,
        timestamp: time
      })
    })

    const result = usages.map(async usage => {
      let powerSum = 0
      const currents = []
      // Query all current usages by seconds
      const currentUsagesSnapshot = await usagesRef.doc(usage._id).collection("current_usages").get()
      currentUsagesSnapshot.forEach((currentUsageSnapshot) => {
        const { current } = currentUsageSnapshot.data()
        // Calculate the power from each current
        const power = current * usage.voltage
        // Accumulate all power from each current
        powerSum += power;
        // Insert each current to currents object
        currents.push(current)
      })
      // Return the object
      return { ...usage, totalPower: powerSum, currents }
    })

    Promise.all(result).then((usageResult => {
      res.status(200).json({
        status: "Success",
        message: `Successfully get all power usages on ${convertedDate}`,
        data: usageResult
      })
    }))
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
}

const sendElectricityHandler = async (req, res, next) => {
  try {
    const { alat_id } = req.params

    // Ngambil data voltage (double) dan arus (array)
    const { voltage, current } = req.body;

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
    // Masukkin data daftar arus ke table electricity usages
    const timestampID = Date.now()
    await currentRef.doc(`arus-1_${timestampID}`).set({
      current: current[0],
      currentID: db.collection('currents').doc('arus_1')
    })
    await currentRef.doc(`arus-2_${timestampID}`).set({
      current: current[1],
      currentID: db.collection('currents').doc('arus_2')
    })
    await currentRef.doc(`arus-3_${timestampID}`).set({
      current: current[2],
      currentID: db.collection('currents').doc('arus_3')
    })

    res.status(201).json({
      status: "Success",
      message: 'Data Added',
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = {
  averagePowerHandler,
  averageElectricityHandler,
  sendElectricityHandler
}