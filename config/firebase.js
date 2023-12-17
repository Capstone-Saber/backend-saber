require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../firebase-credentials-2.json');
const { projectId } = require('.');

initializeApp({
  credential: cert(serviceAccount),
  projectId
});

const db = getFirestore();

module.exports = { db, FieldValue };