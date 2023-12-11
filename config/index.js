'use strict';
const dotenv = require('dotenv');
dotenv.config();

const {
  PORT,
  JWT_SECRET,
  PROJECT_ID
} = process.env;

module.exports = {
  port: PORT,
  jwtSecret: JWT_SECRET,
  projectId: PROJECT_ID
};