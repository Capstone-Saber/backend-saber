const router = require('express').Router()
const {
  averagePowerPerMinuteHandler,
  averagePowerPerHourHandler,
  sendElectricityHandler,
  usageDetailHandler
} = require('../../controller/v2/electricity');

// [GET] Get average power usage per minute (1 day)
router.get('/usages', averagePowerPerMinuteHandler)

// [GET] Get average power usage per hour (1 day)
router.get('/usages/hour', averagePowerPerHourHandler)

// [GET] Get all usage detail (1 day)
router.get('/detail', usageDetailHandler)

// [POST] Send electricity usage from IoT device
router.post('/', sendElectricityHandler);

module.exports = router