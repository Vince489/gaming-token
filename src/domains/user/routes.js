require('dotenv').config();

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./model');
const Transaction = require('../transaction/model'); 
const generateUsername = require('../../utils/names'); 
const AuthState = require('../authState/model');

// Convert Tokens to zennies 1 token = 100 zennies
const tokensToZennies = (tokens) => {
  return tokens * 100;
};

// Convert Zennies to Tokens 1 zenny = 0.01 tokens
const zenniesToTokens = (zennies) => {
  return zennies / 100;
};

// Set up express-session middleware
const sessionOptions = {
  name: 'platform',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    domain: 'virtronboxing.club',
    sameSite: 'none',
    secure: 'true'
  }
};

router.use(session(sessionOptions));

// Get all users endpoint
router.get('/', async (req, res) => {
  try {
    // Fetch all users from the database, excluding password and airdropReceived
    const users = await User.find({}, { password: 0, airdropReceived: 0, transactions: 0});

    // Respond with the users
    res.status(200).json(users);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
    req.session.isLoggedIn = true;

    // Authentication successful
    res.status(200).json({ 
      message: 'Login successful',
      user: user, 
      isLoggedIn: true,
    });
    console.log('User logged in:', user.userName);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get isLogged in status from session
router.get('/isLoggedIn', (req, res) => {
  // Retrieve the sessionId from the request headers or query parameters
  const sessionId = req.headers['Sessionid']; // Use 'Sessionid' here

  // Check if the sessionId is present
  if (!sessionId) {
    return res.status(400).json({ message: 'SessionId not found' });
  }

  // Check if the sessionId is valid
  if (req.sessionID === sessionId) {
    return res.status(200).json({ isLoggedIn: true });
  }

  // SessionId is invalid
  res.status(401).json({ isLoggedIn: false });
});

// GET endpoint to retrieve the Pinia store state from MongoDB

// Logout endpoint
router.get('/logout', (req, res) => {
  // Destroy session data
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Logout successful' });
  });
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

// Check if user is logged in
router.get('/check-session', (req, res) => {
  // Check if session data exists
  if (req.session.isLoggedIn) {
    return res.status(200).json({ message: 'User: ' + req.session.userName });
  }
  // No session data
  res.status(401).json({ message: 'User not logged in' });
});

// GET endpoint to fetch user data
router.get('/getUser', async (req, res) => {
  if (req.session.isLoggedIn) {
    try {
      // Fetch user data based on session user ID
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Populate the user's transactions
      await user.populate('transactions')

      // Return user data along with isLoggedIn property
      res.status(200).json({ user, isLoggedIn: req.session.isLoggedIn });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(401).json({ message: 'User not logged in' });  
  }
});


// Get user by ID endpoint
router.get('/:id', async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;

    // Fetch user from the database
    const user = await User.findById(id);

    // Respond with the user
    res.status(200).json(user);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Airdrop endpoint for logged in users
router.post('/airdrop', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Fetch user from the database
    const user = await User.findById(req.session.userId);

    // Check if user already received airdrop
    if (user.airdropReceived) {
      return res.status(400).json({ message: 'Airdrop already received' });
    }

    // Update user's balance
    user.balance += tokensToZennies(100);

    // Update user's received field to true
    user.airdropReceived = true;

    // Create a transaction record for the airdrop
    const transaction = new Transaction({
      sender: null, // Airdrop doesn't have a sender
      recipient: user._id,
      amount: tokensToZennies(100), // Airdrop amount
      type: 'airdrop'
    });

    // Save the transaction to the database
    await transaction.save();

    // Save the transaction to the user's transactions
    user.transactions.push(transaction);

    // Save the updated user to the database
    await user.save();

    // Respond with success message
    res.status(200).json({ message: 'Airdrop successfully received' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Extract transfer data from request body
    const { to, amount } = req.body;

    // Fetch sender from the database
    const sender = await User.findById(req.session.userId);

    // Fetch receiver from the database
    const receiver = await User.findById(to);

    // Check if receiver exists
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Convert amount to zennies
    const zennies = tokensToZennies(amount);

    // Check if sender is the receiver
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to self' });
    }

    // Check if amount is positive
    if (zennies <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Check if sender has enough balance
    if (sender.balance < zennies) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      sender: sender._id,
      recipient: receiver._id,
      amount: zenniesToTokens(zennies),
    });

    // Save the transaction to the database
    await transaction.save();

    // Add transaction to sender's transactions
    sender.transactions.push(transaction);

    // Add transaction to receiver's transactions
    receiver.transactions.push(transaction);

    // Update sender's balance
    sender.balance -= zennies;

    // Update receiver's balance
    receiver.balance += zennies;

    // Save the updated users to the database
    await sender.save();
    await receiver.save();

    // Respond with success message and updated balances
    res.status(200).json({
      message: 'Funds transferred successfully',
      senderBalance: zenniesToTokens(sender.balance).toFixed(2),
      recipientBalance: zenniesToTokens(receiver.balance).toFixed(2)
    });
  } catch (error) {
    // Handle errors
    console.error('Error in transfer endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by userId from request body
router.get('/getUser', async (req, res) => {
  if (req.session.isLoggedIn) {
    try {
      // Fetch user data based on session user ID
      const user = await User.findById(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Populate the user's transactions
      await user.populate('transactions');

      // Return user data with populated transactions
      res.status(200).json({ user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(401).json({ message: 'User not logged in' });  
  }
});




        


// obtain transaction history by user id
router.get('/:id/transactions', async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;

    // Fetch user from the database
    const user = await User.findById(id).populate('transactions');

    // Respond with the user's transactions
    res.status(200).json(user.transactions);
  } catch (error) {
    // Handle errors
    console.error('Error in transactions endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Obtain transaction history for the logged-in user
router.get('/transactions', async (req, res) => {
  try {
    // Extract user ID from session data
    const { userId } = req.session;

    // Fetch user from the database
    const user = await User.findById(userId).populate('transactions');

    // Respond with the user's transactions
    res.status(200).json(user.transactions);
  } catch (error) {
    // Handle errors
    console.error('Error in transactions endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
    } 
});
   
// Get balance by user ID endpoint
router.get('/:id/balance', async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;

    // Fetch user from the database
    const user = await User.findById(id);

    // Respond with the user's balance
    res.status(200).json({ 
      Balance: zenniesToTokens(user.balance).toFixed(2),
    });
  } catch (error) {
    // Handle errors
    console.error('Error in balance endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get user by id with transactions populated 
router.get('/:id', async (req, res) => {
  try {
    // Fetch user from the database and populate transactions with actual data
    const user = await User.findById(req.params.id).populate('transactions');

    // Respond with the user
    res.status(200).json(user);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/transactions/:id', async (req, res) => {
  try {
    // Fetch user from the database
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all transactions associated with the user
    const transactions = await Transaction.find({ _id: { $in: user.transactions } });

    // Respond with the transactions
    res.status(200).json(transactions);
  } catch (error) {
    // Handle errors
    console.error('Error in transaction endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router;
