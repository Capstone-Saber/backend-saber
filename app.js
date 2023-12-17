require('dotenv').config();
const express = require('express')
const app = express()

const cors = require('cors')
const userRoute = require('./routes/v1/user')
const electricityRoute = require('./routes/v1/electricity');
const newElectricityRoute = require('./routes/v2/electricity');
const { port } = require('./config/');

const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const apiDocs = yaml.load('./docs/v1/api_docs.yaml')

const serverPort = port || '5000';

app.use(cors())
app.use(express.json());

// V1
app.use('/v1/users/', userRoute)
app.use('/v1/electricities/', electricityRoute)
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

// V2
app.use('/v2/electricities/', newElectricityRoute)

app.get('/', (req, res) => {
  res.send('Welcome to Saber API! 😁')
})

app.listen(serverPort, () => {
  console.log('Server Connected on port: ' + serverPort + '/');
})