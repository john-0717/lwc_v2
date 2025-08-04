const express = require('express');
const Prayer = require('../models/Prayer');
const Article = require('../models/Article');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get public prayer requests
router.get('/prayer-listing', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const urgent = req.query.urgent === 'true';

    // Build query
    let query = { 
      visibility: { $in: ['public', 'members'] },
      status: 'active'
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (urgent) {
      query.isUrgent = true;
    }

    const prayers = await Prayer.find(query)
      .sort({ isUrgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name firstName lastName picture')
      .lean();

    const total = await Prayer.countDocuments(query);

    // Format prayers for frontend
    const formattedPrayers = prayers.map(prayer => ({
      id: prayer._id,
      title: prayer.title,
      content: prayer.description,
      author: prayer.authorName,
      timestamp: prayer.createdAt,
      prayerCount: prayer.prayerCount,
      isUrgent: prayer.isUrgent,
      isAnonymous: prayer.isAnonymous,
      category: prayer.category,
      usersPrayed: prayer.usersPrayed.map(up => up.user),
      updates: prayer.updates.slice(-3) // Last 3 updates
    }));

    res.status(200).json({
      status: true,
      message: 'Prayer requests retrieved successfully',
      data: formattedPrayers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get public prayers error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve prayer requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get prayer statistics
router.get('/prayer-stats', async (req, res) => {
  try {
    const stats = await Prayer.getStats();

    res.status(200).json({
      status: true,
      message: 'Prayer statistics retrieved successfully',
      data: {
        activeCount: stats.activePrayers,
        answeredCount: stats.answeredPrayers,
        prayerWarriorsCount: stats.prayerWarriorsCount
      }
    });

  } catch (error) {
    console.error('Get prayer stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve prayer statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get published articles
router.get('/articles', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    // Build query
    let query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const articles = await Article.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name firstName lastName picture')
      .lean();

    const total = await Article.countDocuments(query);

    // Format articles for frontend
    const formattedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      author: article.authorName,
      category: article.category,
      tags: article.tags,
      featuredImage: article.featuredImage,
      pdfFile: article.pdfFile,
      contentType: article.contentType,
      status: article.status,
      createdDate: article.createdAt.toISOString().split('T')[0],
      publishedDate: article.publishedDate ? article.publishedDate.toISOString().split('T')[0] : null,
      readTime: article.readTime,
      views: article.views,
      likeCount: article.likes.length,
      commentCount: article.comments.filter(c => c.isApproved).length
    }));

    res.status(200).json({
      status: true,
      message: 'Articles retrieved successfully',
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single article by slug
router.get('/article/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug, status: 'published' })
      .populate('author', 'name firstName lastName picture')
      .populate('comments.author', 'name firstName lastName picture')
      .lean();

    if (!article) {
      return res.status(404).json({
        status: false,
        message: 'Article not found'
      });
    }

    // Increment views (in background)
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    // Format article for frontend
    const formattedArticle = {
      id: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      author: article.authorName,
      category: article.category,
      tags: article.tags,
      featuredImage: article.featuredImage,
      pdfFile: article.pdfFile,
      contentType: article.contentType,
      status: article.status,
      createdDate: article.createdAt.toISOString().split('T')[0],
      publishedDate: article.publishedDate ? article.publishedDate.toISOString().split('T')[0] : null,
      readTime: article.readTime,
      views: article.views + 1, // Include the increment
      likeCount: article.likes.length,
      comments: article.comments
        .filter(comment => comment.isApproved)
        .map(comment => ({
          id: comment._id,
          author: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt,
          replies: comment.replies.map(reply => ({
            id: reply._id,
            author: reply.authorName,
            content: reply.content,
            createdAt: reply.createdAt
          }))
        }))
    };

    res.status(200).json({
      status: true,
      message: 'Article retrieved successfully',
      data: formattedArticle
    });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get community statistics
router.get('/community-stats', async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalPrayers,
      totalArticles
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ 
        status: 'active',
        lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      Prayer.countDocuments({ status: 'active' }),
      Article.countDocuments({ status: 'published' })
    ]);

    res.status(200).json({
      status: true,
      message: 'Community statistics retrieved successfully',
      data: {
        totalMembers,
        activeMembers,
        totalPrayers,
        totalArticles
      }
    });

  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve community statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get prayer categories
router.get('/prayer-categories', async (req, res) => {
  try {
    const categories = await Prayer.distinct('category', { 
      status: 'active',
      visibility: { $in: ['public', 'members'] }
    });

    res.status(200).json({
      status: true,
      message: 'Prayer categories retrieved successfully',
      data: categories
    });

  } catch (error) {
    console.error('Get prayer categories error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve prayer categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get article categories
router.get('/article-categories', async (req, res) => {
  try {
    const categories = await Article.distinct('category', { status: 'published' });

    res.status(200).json({
      status: true,
      message: 'Article categories retrieved successfully',
      data: categories
    });

  } catch (error) {
    console.error('Get article categories error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve article categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;