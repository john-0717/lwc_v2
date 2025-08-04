const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: function() {
      return this.contentType === 'text';
    }
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Author information
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
  
  // Content details
  contentType: {
    type: String,
    enum: ['text', 'pdf'],
    default: 'text'
  },
  pdfFile: {
    type: String // URL or file path
  },
  featuredImage: {
    type: String // URL or file path
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
      '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
      'General', 'Devotional', 'Theology', 'Christian Living'
    ]
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedDate: {
    type: Date
  },
  
  // SEO
  metaDescription: {
    type: String,
    maxlength: 160
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      authorName: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ publishedDate: -1 });
articleSchema.index({ createdAt: -1 });

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Method to generate slug
articleSchema.methods.generateSlug = function() {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return this.slug;
};

// Method to calculate read time
articleSchema.methods.calculateReadTime = function() {
  if (this.contentType === 'pdf') {
    this.readTime = 30; // Default for PDF
  } else {
    const wordsPerMinute = 200;
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(' ').length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  return this.readTime;
};

// Method to add like
articleSchema.methods.addLike = function(userId) {
  const alreadyLiked = this.likes.some(
    like => like.user.toString() === userId.toString()
  );
  
  if (!alreadyLiked) {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Method to remove like
articleSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(
    like => like.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to add comment
articleSchema.methods.addComment = function(authorId, authorName, content) {
  this.comments.push({
    author: authorId,
    authorName,
    content,
    isApproved: false // Require moderation
  });
  
  return this.save();
};

// Method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Generate slug if not exists
  if (!this.slug && this.title) {
    this.generateSlug();
  }
  
  // Calculate read time
  if (this.isModified('content') || this.isModified('contentType')) {
    this.calculateReadTime();
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  
  // Generate meta description from excerpt if not provided
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.substring(0, 160);
  }
  
  next();
});

module.exports = mongoose.model('Article', articleSchema);