const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  picture: {
    type: String
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date
  },
  occupation: {
    type: String,
    trim: true
  },
  church: {
    type: String,
    trim: true
  },
  
  // Interests and Ministry
  interests: [{
    type: String,
    enum: [
      'Bible Study', 'Prayer Ministry', 'Worship Music', 'Youth Ministry',
      'Children\'s Ministry', 'Outreach & Missions', 'Community Service',
      'Christian Fellowship', 'Discipleship', 'Counseling & Support',
      'Teaching & Education', 'Leadership Development'
    ]
  }],
  
  // Spiritual Information
  testimony: {
    type: String
  },
  prayerRequests: {
    type: String
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  },
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    prayerUpdates: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  
  // System Information
  role: {
    type: String,
    enum: ['admin', 'writer', 'member', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Authentication
  password: {
    type: String,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Profile completion
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  // Password reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || this.email;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const requiredFields = ['firstName', 'lastName', 'phone'];
  const isComplete = requiredFields.every(field => this[field] && this[field].trim() !== '');
  
  if (this.isProfileComplete !== isComplete) {
    this.isProfileComplete = isComplete;
  }
  
  return isComplete;
};

// Static method to find by email or userId
userSchema.statics.findByEmailOrUserId = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { userId: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);