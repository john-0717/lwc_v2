const express = require('express');
const User = require('../models/User');
const Prayer = require('../models/Prayer');
const Article = require('../models/Article');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalPrayers,
      activePrayers,
      urgentPrayers,
      totalArticles,
      publishedArticles,
      draftArticles
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'pending' }),
      Prayer.countDocuments(),
      Prayer.countDocuments({ status: 'active' }),
      Prayer.countDocuments({ isUrgent: true, status: 'active' }),
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' })
    ]);

    // Get recent activity
    const recentUsers = await User.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    const recentPrayers = await Prayer.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title authorName createdAt')
      .lean();

    res.status(200).json({
      status: true,
      message: 'Admin dashboard stats retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers
        },
        prayers: {
          total: totalPrayers,
          active: activePrayers,
          urgent: urgentPrayers
        },
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles
        },
        recentActivity: {
          users: recentUsers,
          prayers: recentPrayers
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User Management
router.get('/users', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -emailVerificationToken -passwordResetToken')
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user status
router.put('/users/:id/status', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'User status updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user role
router.put('/users/:id/role', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'writer', 'member', 'user'].includes(role)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'User role updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Prayer Management
router.get('/prayers', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const urgent = req.query.urgent === 'true';

    // Build query
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (urgent) {
      query.isUrgent = true;
    }

    const prayers = await Prayer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();

    const total = await Prayer.countDocuments(query);

    res.status(200).json({
      status: true,
      message: 'Prayers retrieved successfully',
      data: prayers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get prayers error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve prayers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Moderate prayer
router.put('/prayers/:id/moderate', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject' | 'archive'

    if (!['approve', 'reject', 'archive'].includes(action)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid action'
      });
    }

    const prayer = await Prayer.findById(id);

    if (!prayer) {
      return res.status(404).json({
        status: false,
        message: 'Prayer not found'
      });
    }

    prayer.isModerated = true;
    prayer.moderatedBy = req.user._id;
    prayer.moderatedAt = new Date();

    if (action === 'reject' || action === 'archive') {
      prayer.status = 'archived';
    }

    await prayer.save();

    res.status(200).json({
      status: true,
      message: `Prayer ${action}d successfully`,
      data: prayer
    });

  } catch (error) {
    console.error('Moderate prayer error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to moderate prayer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Article Management
router.get('/articles', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    // Build query
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();

    const total = await Article.countDocuments(query);

    res.status(200).json({
      status: true,
      message: 'Articles retrieved successfully',
      data: articles,
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

// Delete user (soft delete by changing status)
router.delete('/users/:id', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting other admins
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    if (userToDelete.role === 'admin' && userToDelete._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: 'Cannot delete other admin users'
      });
    }

    // Soft delete by changing status
    userToDelete.status = 'inactive';
    await userToDelete.save();

    res.status(200).json({
      status: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get system health
router.get('/system-health', async (req, res) => {
  try {
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.status(200).json({
      status: true,
      message: 'System health retrieved successfully',
      data: {
        database: dbStatus,
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        environment: process.env.NODE_ENV,
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;