const router = require('express').Router()
const {
  averagePowerHandler,
  sendElectricityHandler
} = require('../../controller/v2/electricity');

// [GET] Get average power (1m) usage
router.get('/usages', averagePowerHandler)
// [POST] Send electricity usage from IoT device
router.post('/', sendElectricityHandler);

module.exports = router