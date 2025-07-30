const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthService = {
  // Verify Google token
  async verifyGoogleToken(token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  },

  // Find or create user from Google data
  async findOrCreateUser(googleData) {
    try {
      // Check if user exists with Google ID
      let user = await User.findOne({ googleId: googleData.googleId });
      
      if (!user) {
        // Check if user exists with email
        user = await User.findOne({ email: googleData.email });
        
        if (user) {
          // Update existing user with Google ID
          user.googleId = googleData.googleId;
          user.profilePicture = googleData.picture;
          await user.save();
        } else {
          // Create new user
          user = new User({
            name: googleData.name,
            email: googleData.email,
            googleId: googleData.googleId,
            profilePicture: googleData.picture,
            emailVerified: googleData.emailVerified,
            role: 'submitter', // Default role for Google sign-in
            isActive: true,
            permissions: {
              canCreateExpenses: true,
              canApproveExpenses: false,
              canManageUsers: false,
              canManageSites: false,
              canViewReports: false,
              canManageBudgets: false
            }
          });
          await user.save();
        }
      }
      
      return user;
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw new Error('Failed to process user data');
    }
  },

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
};

module.exports = googleAuthService; 