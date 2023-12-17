const router = require('express').Router()
const { averageElectricityHandler, averagePowerHandler, sendElectricityHandler } = require('../../controller/v1/electricity');

// [GET] Get average power (1m) usage
router.get('/:alat_id/usages', averagePowerHandler)
// [GET] Get average electricity usage (1m)
router.get('/:alat_id/usages/detail', averageElectricityHandler)
// [POST] Send electricity usage from IoT device
router.post('/:alat_id', sendElectricityHandler);

module.exports = router