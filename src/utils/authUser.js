// Middleware to check if the user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    // Check if the user's session contains authentication data
    if (req.session && req.session.userId) {
      // If the session contains a userId, try to find the user in the database
      const user = await User.findById(req.session.userId);
      
      // Check if the user exists and is authenticated
      if (user) {
        // If the user exists and is authenticated, attach the user object to the request for further processing
        req.user = user;
        next(); // Continue to the next middleware or route handler
      } else {
        // If the user does not exist, or is not authenticated, clear the session and redirect to the login page
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
          }
          res.redirect('http://localhost:3000/login'); // Redirect to the login page
        });
      }
    } else {
      // If the session does not contain a userId, the user is not authenticated, redirect to the login page
      res.redirect('http://localhost:3000/login'); // Redirect to the login page
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = authenticateUser;