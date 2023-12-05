require('dotenv').config();
const express = require('express')
const cors = require('cors')
const userRoute = require('./routes/user')
const electricityRoute = require('./routes/electricity')

const app = express()
const port = process.env.PORT || '5000';

app.use(cors())
app.use(express.json());
app.use('/v1/users/', userRoute)
app.use('/v1/electricities/', electricityRoute)

app.listen(port, () => {
  console.log('Server Connected on: http://localhost:' + port + '/');
})