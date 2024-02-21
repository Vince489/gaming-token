require('dotenv').config();

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./model');
const generateUsername = require('../../utils/names'); 

// Set up express-session middleware
router.use(session({
  name: 'platform',
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI 
  })
}));

// Signup endpoint
router.post('/register', async (req, res) => {
  try {
    // Extract user data from request body
    const { userName, password } = req.body;

    // Generate unique codeName
    const codeName = await generateUsername(); 

    // Check if user already exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      userName,
      codeName,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();


    // Respond with success message
    res.status(201).json({ 
      message: 'User created successfully',
      codeName: newUser.codeName,
     });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Extract user data from request body
    const { userName, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Set session data 
    req.session.userId = user._id;
    req.session.userName = user.userName; 
    req.session.sessionId = req.sessionID;
    req.session.codeName = user.codeName;
    req.session.isLoggedIn = true;

    // Authentication successful
    res.status(200).json({ 
      message: 'Login successful', 
      userId: user._id, 
      userName: user.userName,
      codeName: user.codeName,
      sessionId: req.sessionID,
      isLoggedIn: true
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});