const mongoose = require('mongoose');

// Define the schema for storing the Pinia store state
const authStateSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  isLoggedIn: Boolean,
});

// Create a model using the schema
const AuthState = mongoose.model('AuthState', authStateSchema);

module.exports = AuthState;
