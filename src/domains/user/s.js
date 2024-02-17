// Signup endpoint
router.post('/register', async (req, res) => {
  try {
      // Extract user data from request body
      const { userName, password } = req.body;
      
      // Generate unique codeName
      const codeName = await generateUniqueUsername();

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
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});