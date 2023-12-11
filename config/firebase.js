require('dotenv').config();
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../firebase-credentials.json');
const { projectId } = require('.');

initializeApp({
  credential: cert(serviceAccount),
  projectId
});

const db = getFirestore();

module.exports = db;