const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Prayer details
  isUrgent: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'answered', 'closed', 'archived'],
    default: 'active'
  },
  
  // Prayer interactions
  usersPrayed: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prayedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  prayerCount: {
    type: Number,
    default: 0
  },
  
  // Comments/Updates
  updates: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['update', 'praise', 'comment'],
      default: 'update'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Categories/Tags
  category: {
    type: String,
    enum: [
      'Health & Healing',
      'Family & Relationships',
      'Work & Career',
      'Spiritual Growth',
      'Financial Provision',
      'Guidance & Direction',
      'Protection & Safety',
      'Salvation',
      'Church & Ministry',
      'Community & World',
      'Other'
    ],
    default: 'Other'
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'members', 'private'],
    default: 'public'
  },
  
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  // Expiry (for temporary prayer requests)
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
prayerSchema.index({ author: 1 });
prayerSchema.index({ status: 1 });
prayerSchema.index({ isUrgent: 1 });
prayerSchema.index({ category: 1 });
prayerSchema.index({ visibility: 1 });
prayerSchema.index({ createdAt: -1 });
prayerSchema.index({ 'usersPrayed.user': 1 });

// Virtual for time since created
prayerSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to add prayer
prayerSchema.methods.addPrayer = function(userId) {
  // Check if user already prayed
  const alreadyPrayed = this.usersPrayed.some(
    prayer => prayer.user.toString() === userId.toString()
  );
  
  if (!alreadyPrayed) {
    this.usersPrayed.push({ user: userId });
    this.prayerCount = this.usersPrayed.length;
  }
  
  return this.save();
};

// Method to remove prayer
prayerSchema.methods.removePrayer = function(userId) {
  this.usersPrayed = this.usersPrayed.filter(
    prayer => prayer.user.toString() !== userId.toString()
  );
  this.prayerCount = this.usersPrayed.length;
  
  return this.save();
};

// Method to add update
prayerSchema.methods.addUpdate = function(authorId, authorName, content, type = 'update') {
  this.updates.push({
    author: authorId,
    authorName,
    content,
    type
  });
  
  return this.save();
};

// Method to increment views
prayerSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to get prayer statistics
prayerSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalPrayers = await this.countDocuments();
  const activePrayers = await this.countDocuments({ status: 'active' });
  const answeredPrayers = await this.countDocuments({ status: 'answered' });
  const urgentPrayers = await this.countDocuments({ isUrgent: true, status: 'active' });
  
  // Get unique prayer warriors count
  const prayerWarriors = await this.aggregate([
    { $unwind: '$usersPrayed' },
    { $group: { _id: '$usersPrayed.user' } },
    { $count: 'count' }
  ]);
  
  return {
    totalPrayers,
    activePrayers,
    answeredPrayers,
    urgentPrayers,
    prayerWarriorsCount: prayerWarriors[0]?.count || 0,
    statusBreakdown: stats
  };
};

// Pre-save middleware
prayerSchema.pre('save', function(next) {
  // Update prayer count
  this.prayerCount = this.usersPrayed.length;
  next();
});

module.exports = mongoose.model('Prayer', prayerSchema);