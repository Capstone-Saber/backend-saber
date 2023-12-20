const { db, FieldValue } = require('../../config/firebase')
const { Timestamp } = require("@firebase/firestore");
const { nanoid } = require('nanoid')

const averagePowerPerMinuteHandler = async (req, res) => {
  try {
    const { date } = req.query;
    let newDate;
    if (date) {
      newDate = new Date(date)
      newDate.setUTCHours(0, 0, 0, 0)
    } else {
      newDate = new Date()
      // newDate.setUTCHours(newDate.getUTCHours() + 7, 0, 0, 0)
    }
    newDate.setUTCHours(0, 0, 0, 0)
    // Get start time of usage
    const startTime = newDate;
    // Convert the time to UTC. I know it's a bad practice :(
    startTime.setUTCHours(startTime.getUTCHours() - 7);
    // Set the end time
    const endTime = new Date(startTime);
    endTime.setUTCMilliseconds(999)
    console.log(startTime, endTime)

    // Convert date to YYYY-MM-DD
    const convertedDate = newDate.getUTCFullYear() + "-" +
      (newDate.getUTCMonth() + 1) + "-" +
      (newDate.getUTCDate() + 1)

    const sensorRef = db.collection('electrcities');
    const usagesSnapshot = await sensorRef
      .where('startDate', '>=', startTime)
      .where('startDate', '<=', endTime)
      .limit(1)
      .get()

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    console.log(usagesSnapshot.docs[0].data().startDate.toDate())
    const usages = usagesSnapshot.docs[0].data().usages
    usages.forEach(usage => {
      // Convert back the time to UTC+7
      let convertedTime = usage.timestamp.toDate()
      convertedTime.setUTCHours(convertedTime.getUTCHours() + 7)
      const hourMinute =
        ("0" + (convertedTime.getUTCHours())).slice(-2) + "." +
        ("0" + convertedTime.getUTCMinutes()).slice(-2)
      usage.power = usage.current * usage.voltage
      usage.timestamp = hourMinute
    });

    const groupedUsageById = Object.entries(
      usages.reduce((acc, { timestamp, power }) => {
        // Group initialization
        if (!acc[timestamp]) acc[timestamp] = [];
        // Grouping
        acc[timestamp].push(power);
        return acc;
      }, {})
    ).map(([timestamp, power]) => {
      let avgPower = power.reduce((a, b) => a + b, 0) / power.length;
      avgPower = Math.round(avgPower * 100) / 100
      return ({ timestamp, avgPower })
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully get all power usages on ${convertedDate}`,
      data: groupedUsageById
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
}

const averagePowerPerHourHandler = async (req, res) => {
  try {
    const { date } = req.query;
    const newDate = date ? new Date(date) : new Date();
    newDate.setUTCHours(0, 0, 0, 0)
    // Get start time of usage
    const startTime = newDate;
    // Convert the time to UTC. I know it's a bad practice :(
    startTime.setUTCHours(startTime.getUTCHours() - 7);
    // Set the end time
    const endTime = new Date(startTime);
    endTime.setUTCMilliseconds(999)

    // Convert date to YYYY-MM-DD
    const convertedDate = newDate.getUTCFullYear() + "-" +
      (newDate.getUTCMonth() + 1) + "-" +
      (newDate.getUTCDate() + 1)

    const sensorRef = db.collection('electrcities');
    const usagesSnapshot = await sensorRef
      .where('startDate', '>=', startTime)
      .where('startDate', '<=', endTime)
      .limit(1)
      .get()

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    const usages = usagesSnapshot.docs[0].data().usages
    usages.forEach(usage => {
      // Convert back the time to UTC+7
      let convertedTime = usage.timestamp.toDate()
      convertedTime.setUTCHours(convertedTime.getUTCHours() + 7)
      const hour = ("0" + (convertedTime.getUTCHours())).slice(-2)
      usage.power = usage.current * usage.voltage
      usage.timestamp = hour
    });

    const groupedUsagePerHour = Object.entries(
      usages.reduce((acc, { timestamp, power }) => {
        // Group initialization
        if (!acc[timestamp]) acc[timestamp] = [];
        // Grouping
        acc[timestamp].push(power);
        return acc;
      }, {})
    ).map(([timestamp, power]) => {
      const avgPower = power.reduce((a, b) => a + b, 0) / power.length;
      return [avgPower]
    });

    // [
    //   [
    //     [1, 1, 1,... 1], // Rerata per jamS
    //   ]
    // ]

    res.status(200).json({
      status: "Success",
      message: `Successfully get average power usages on ${convertedDate} (per hour)`,
      data: [groupedUsagePerHour]
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
}

// [ADMIN ONLY]
const usageDetailHandler = async (req, res) => {
  try {
    const { date } = req.query;
    const newDate = date ? new Date(date) : new Date();
    newDate.setUTCHours(0, 0, 0, 0)
    // Get start time of usage
    const startTime = newDate;
    // Convert the time to UTC. I know it's a bad practice :(
    startTime.setUTCHours(startTime.getUTCHours() - 7);
    // Set the end time
    const endTime = new Date(startTime);
    endTime.setUTCMilliseconds(999)

    // Convert date to YYYY-MM-DD
    const convertedDate = newDate.getUTCFullYear() + "-" +
      (newDate.getUTCMonth() + 1) + "-" +
      (newDate.getUTCDate() + 1)

    const sensorRef = db.collection('electrcities');
    const usagesSnapshot = await sensorRef
      .where('startDate', '>=', startTime)
      .where('startDate', '<=', endTime)
      .limit(1)
      .get()

    // Check if there is a usage or not in a given date
    if (usagesSnapshot.empty) {
      const error = new Error(`No electricity usage from ${convertedDate} yet.`);
      error.statusCode = 404;
      throw error;
    }

    let usages = usagesSnapshot.docs[0].data().usages
    usages = usages.map(usage => {
      // Convert back the time to UTC+7
      let convertedTime = usage.timestamp.toDate()
      convertedTime.setUTCHours(convertedTime.getUTCHours() + 7)
      const hourMinute =
        ("0" + (convertedTime.getUTCHours())).slice(-2) + "." +
        ("0" + convertedTime.getUTCMinutes()).slice(-2) + "." +
        ("0" + convertedTime.getUTCSeconds()).slice(-2)
      return { ...usage, timestamp: hourMinute }
    });

    res.status(200).json({
      data: usages
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    })
  }
}

const sendElectricityHandler = async (req, res, next) => {
  try {
    // Get voltage & current data from request body
    const { voltage, current } = req.body;

    // Get start time of usage
    const startTime = new Date();
    // startTime.setUTCHours(0, 0, 0, 0)
    // Convert the time to UTC. I know it's a bad practice :(
    // startTime.setUTCHours(startTime.getUTCHours() - 7);
    console.log(startTime.toString())

    const sensorRef = db.collection('electrcities');
    const usagesSnapshot = await sensorRef
      .where('startDate', '>=', startTime)
      .limit(1)
      .get()

    /* 
      Check if there is a usage or not in a given date
      If yes, update the usage doc
      If not, create a new doc based on a given date
    */

    if (!usagesSnapshot.empty) {
      const id = usagesSnapshot.docs[0].data()._id
      const newUsage = {
        current,
        voltage,
        timestamp: Timestamp.fromDate(new Date()).toDate()
      }
      console.log(usagesSnapshot.docs[0].data().startDate.toDate().toString())
      // await sensorRef.doc(id).update({
      //   usages: FieldValue.arrayUnion(newUsage)
      // });
    } else {
      console.log('gada')
      const docID = nanoid()
      const newUsage = {
        current,
        voltage,
        timestamp: Timestamp.fromDate(new Date()).toDate()
      }
      // await sensorRef.doc(docID).set({
      //   _id: docID,
      //   startDate: startTime,
      //   usages: [newUsage]
      // })
    }

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

// // [ADMIN ONLY]
// const adminSendElectricityHandler = async (req, res, next) => {
//   try {
//     // Get start time of usage
//     const startTime = new Date("2023-12-12");
//     startTime.setUTCHours(0, 0, 0, 0)
//     // Convert the time to UTC. I know it's a bad practice :(
//     startTime.setUTCHours(startTime.getUTCHours() - 7);

//     const sensorRef = db.collection('electrcities');
//     const docID = nanoid()
//     const usageData = require('./saber_detail_12')
//     const newData = usageData.map((usage) => ({
//       ...usage,
//       timestamp: Timestamp.fromDate(new Date(usage.timestamp)).toDate()
//     }))

//     await sensorRef.doc(docID).set({
//       _id: docID,
//       startDate: startTime,
//       usages: newData
//     })

//     res.status(201).json({
//       status: "Success",
//       message: 'Data Added',
//     })
//   } catch (error) {
//     res.status(error.statusCode || 500).json({
//       status: "Error",
//       message: error.message
//     })
//   }
// }

module.exports = {
  averagePowerPerMinuteHandler,
  averagePowerPerHourHandler,
  usageDetailHandler,
  sendElectricityHandler,
}