const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { validateUserSignup } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Sign in with Google (or create account)
router.post('/sign-in', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new User({
        userId: uuidv4(),
        email: email.toLowerCase(),
        status: 'active',
        isEmailVerified: true // Since they're signing in with Google
      });
      
      await user.save();
      isNewUser = true;
    }

    // Update last active
    await user.updateLastActive();

    // Generate token
    const token = generateToken(user._id);

    // Prepare response data
    const userData = {
      userId: user.userId,
      id: user._id,
      email: user.email,
      name: user.name || user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      phone: user.phone,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      joinDate: user.joinDate,
      isPopup: isNewUser || !user.isProfileComplete
    };

    res.status(200).json({
      status: true,
      message: isNewUser ? 'Account created successfully' : 'Sign in successful',
      data: userData,
      extra_meta: {
        access_token: `Bearer ${token}`,
        token_type: 'Bearer',
        expires_in: '7d'
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      status: false,
      message: 'Sign in failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Complete user profile after Google sign in
router.post('/finish-sign-up', authenticateToken, validateUserSignup, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      occupation,
      church,
      interests,
      testimony,
      preferences
    } = req.body;

    const user = req.user;

    // Update user profile
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.name = `${firstName} ${lastName}`;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
    user.occupation = occupation || user.occupation;
    user.church = church || user.church;
    user.interests = interests || user.interests;
    user.testimony = testimony || user.testimony;
    
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    // Check if profile is complete
    user.checkProfileCompletion();

    await user.save();

    res.status(200).json({
      status: true,
      message: 'Profile completed successfully',
      data: {
        userId: user.userId,
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      status: false,
      message: 'Profile completion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: true,
      message: 'User profile retrieved successfully',
      data: {
        userId: user.userId,
        id: user._id,
        email: user.email,
        name: user.name || user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        occupation: user.occupation,
        church: user.church,
        interests: user.interests,
        testimony: user.testimony,
        preferences: user.preferences,
        role: user.role,
        status: user.status,
        isProfileComplete: user.isProfileComplete,
        joinDate: user.joinDate,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateUserSignup, async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'dateOfBirth',
      'occupation', 'church', 'interests', 'testimony', 'preferences'
    ];

    // Apply updates
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'preferences') {
          user.preferences = { ...user.preferences, ...updates[field] };
        } else {
          user[field] = updates[field];
        }
      }
    });

    // Update full name if first or last name changed
    if (updates.firstName || updates.lastName) {
      user.name = `${user.firstName} ${user.lastName}`;
    }

    // Check profile completion
    user.checkProfileCompletion();

    await user.save();

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: {
        userId: user.userId,
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just acknowledge the logout
    
    res.status(200).json({
      status: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;