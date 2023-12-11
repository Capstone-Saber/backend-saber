require('dotenv').config();
const express = require('express')
const app = express()

const cors = require('cors')
const userRoute = require('./routes/user')
const electricityRoute = require('./routes/electricity');
const { port } = require('./config/');

const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const apiDocs = yaml.load('./docs/api_docs.yaml')

const serverPort = port || '5000';

app.use(cors())
app.use(express.json());
app.use('/v1/users/', userRoute)
app.use('/v1/electricities/', electricityRoute)
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

app.get('/', (req, res) => {
  res.send('Welcome to Saber API! 😁')
})

app.listen(serverPort, () => {
  console.log('Server Connected on port: ' + serverPort + '/');
})