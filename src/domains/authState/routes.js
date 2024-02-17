require('dotenv').config();

const express = require('express');
const router = express.Router();
const AuthState = require('./model');

// GET endpoint to retrieve the Pinia store state from MongoDB
router.get('/getAuthState', async (req, res) => {
  try {
    // Find the latest document in the collection
    const authState = await AuthState.findOne().sort({ _id: -1 });

    // If no document is found, return an empty object
    if (!authState) {
      return res.status(200).json({});
    }

    // Return the state as a JSON object
    res.status(200).json(authState);
  } catch (error) {
    console.error('Error getting auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST endpoint to save the Pinia store state to MongoDB
router.post('/saveAuthState', async (req, res) => {
  try {
    const { userId, userName, isLoggedIn } = req.body;

    // Create a new document with the received state
    const authState = new AuthState({
      userId,
      userName,
      isLoggedIn,
    });

    // Save the document to MongoDB
    await authState.save();

    res.status(200).json({ message: 'Auth state saved successfully' });
  } catch (error) {
    console.error('Error saving auth state:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
