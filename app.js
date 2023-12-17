require('dotenv').config();
const express = require('express')
const app = express()

const cors = require('cors')
const userRoute = require('./routes/v1/user')
const electricityRoute = require('./routes/v1/electricity');
const newElectricityRoute = require('./routes/v2/electricity');
const { port } = require('./config/');

// Load Swagger (Open API)
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const apiDocs = yaml.load('./docs/api_docs.yaml')

const serverPort = port || '5000';

app.use(cors())
app.use(express.json());


// V1
app.use('/v1/users/', userRoute)
app.use('/v1/electricities/', electricityRoute)

// V2
app.use('/v2/electricities/', newElectricityRoute)

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

app.get('/', (req, res) => {
  res.send('Welcome to Saber API! 😁')
})

app.listen(serverPort, () => {
  console.log('Server Connected on port: ' + serverPort + '/');
})