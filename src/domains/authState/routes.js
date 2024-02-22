require('dotenv').config();

const express = require('express');
const router = express.Router();
const AuthState = require('./model');
const session = require('express-session');

// Get isLogged in status
router.get('/isLoggedIn/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the authentication state document for the specified user
    const authState = await AuthState.findOne({ userId });

    if (!authState) {
      return res.status(200).json({ isLoggedIn: false });
    }

    res.status(200).json({ isLoggedIn: authState.isLoggedIn });
  } catch (error) {
    console.error('Error getting auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET endpoint to retrieve the Pinia store state from MongoDB
router.get('/getAuthState/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the authentication state document for the specified user
    const authState = await AuthState.findOne({ userId });

    if (!authState) {
      return res.status(200).json({});
    }

    res.status(200).json(authState);
  } catch (error) {
    console.error('Error getting auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Initialize the Pinia store state from MongoDB using req.session.userId
router.post('/initAuthState', async (req, res) => {
  // Check if session data exists
  if (!req.session.userId) {
    return res.status(400).json({ message: 'Session data not found' });
  }
  try {
    // Fetch the authentication state data from MongoDB
    const authState = await AuthState.findOne({ userId: req.session.userId });

    // If no authentication state is found, respond with an appropriate message
    if (!authState) {
      return res.status(404).json({ message: 'Authentication state not found' });
    }

    // If authentication state is found, respond with the state data
    res.status(200).json(authState);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error initializing auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST endpoint to save the Pinia store state to MongoDB
router.post('/saveAuthState', async (req, res) => {
  try {
    const { userId, userName, isLoggedIn, codeName } = req.body;

    // Create a new document with the received state
    const authState = new AuthState({
      userId,
      userName,
      isLoggedIn,
      codeName
    });

    // Save the document to MongoDB
    await authState.save();
    //req.session.isLoggedIn=true;

    res.status(200).json({ message: 'Auth state saved successfully' });
  } catch (error) {
    console.error('Error saving auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
