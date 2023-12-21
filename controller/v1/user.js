const { db } = require('../../config/firebase')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config');

const registerHandler = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;
    // SELECT * FROM users WHERE username = username
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();

    // Check if username already exist
    if (!snapshot.empty) {
      const error = new Error(`Username ${username} already exist!`);
      error.statusCode = 400;
      throw error;
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    await usersRef.doc().set({
      name: name ? name : username,
      username,
      password: hashedPassword
    });

    // Send response
    res.status(201).json({
      status: "Success",
      message: "Register Successful",
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const loginHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const usersRef = db.collection('users').where('username', '==', username).limit(1);
    const foundUserRef = await usersRef.get();

    // Check username
    if (foundUserRef.empty) {
      const error = new Error("Wrong username or password");
      error.statusCode = 400;
      throw error;
    }

    // Check password
    const { password: foundPassword } = foundUserRef.docs[0].data()
    const checkPassword = await bcrypt.compare(password, foundPassword);
    if (!checkPassword) {
      const error = new Error("Wrong username or password");
      error.statusCode = 400;
      throw error;
    }

    // Sign token
    const token = jwt.sign(
      { userId: foundUserRef.docs[0].id },
      jwtSecret,
      { algorithm: "HS256" }
    )

    res.status(200).json({
      status: "Success",
      message: 'Login Successful',
      token
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const userInfoHandler = async (req, res, next) => {
  try {
    const decoded = req.decoded;
    const authUserRef = await db.collection('users').doc(decoded.userId).get();

    // Check if user doesn't exist
    if (!authUserRef.exists) {
      const error = new Error("User doesn't exist!");
      error.status = 400;
      throw error;
    }

    // Extract user data from auth user ref
    const { name, username } = authUserRef.data();
    res.status(200).json({
      status: "Success",
      message: "Successfully get user information",
      user: { name, username }
    })
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = { registerHandler, loginHandler, userInfoHandler }