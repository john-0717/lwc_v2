const express = require('express');
const User = require('../models/User');
const Prayer = require('../models/Prayer');
const { authenticateToken } = require('../middleware/auth');
const { validatePrayerRequest, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Add prayer request
router.post('/add-prayer-request', validatePrayerRequest, async (req, res) => {
  try {
    const { title, description, isUrgent, isAnonymous, category, visibility } = req.body;
    const user = req.user;

    const prayer = new Prayer({
      title,
      description,
      author: user._id,
      authorName: isAnonymous ? 'Anonymous' : (user.name || user.fullName),
      isUrgent: isUrgent || false,
      isAnonymous: isAnonymous || false,
      category: category || 'Other',
      visibility: visibility || 'public'
    });

    await prayer.save();

    res.status(201).json({
      status: true,
      message: 'Prayer request added successfully',
      data: prayer
    });

  } catch (error) {
    console.error('Add prayer request error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to add prayer request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's prayer requests
router.get('/prayer-listing', async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name firstName lastName picture')
      .lean();

    const total = await Prayer.countDocuments({ author: user._id });

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
      status: prayer.status,
      category: prayer.category,
      usersPrayed: prayer.usersPrayed.map(up => up.user)
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
    console.error('Get user prayers error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve prayer requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update prayer (add/remove user from prayers)
router.post('/update-prayer', async (req, res) => {
  try {
    const { id } = req.body;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'Prayer ID is required'
      });
    }

    const prayer = await Prayer.findById(id);

    if (!prayer) {
      return res.status(404).json({
        status: false,
        message: 'Prayer request not found'
      });
    }

    // Check if user already prayed
    const alreadyPrayed = prayer.usersPrayed.some(
      up => up.user.toString() === user._id.toString()
    );

    if (alreadyPrayed) {
      // Remove prayer
      await prayer.removePrayer(user._id);
    } else {
      // Add prayer
      await prayer.addPrayer(user._id);
    }

    res.status(200).json({
      status: true,
      message: alreadyPrayed ? 'Prayer removed' : 'Prayer added',
      data: {
        prayerCount: prayer.prayerCount,
        usersPrayed: prayer.usersPrayed.map(up => up.user)
      }
    });

  } catch (error) {
    console.error('Update prayer error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update prayer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add prayer update/testimony
router.post('/prayer/:id/update', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;
    const user = req.user;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Update content is required'
      });
    }

    const prayer = await Prayer.findById(id);

    if (!prayer) {
      return res.status(404).json({
        status: false,
        message: 'Prayer request not found'
      });
    }

    // Only the author can add updates
    if (prayer.author.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: 'Only the prayer author can add updates'
      });
    }

    await prayer.addUpdate(
      user._id,
      user.name || user.fullName,
      content.trim(),
      type || 'update'
    );

    res.status(200).json({
      status: true,
      message: 'Prayer update added successfully',
      data: prayer.updates[prayer.updates.length - 1]
    });

  } catch (error) {
    console.error('Add prayer update error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to add prayer update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update prayer status
router.put('/prayer/:id/status', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!['active', 'answered', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status'
      });
    }

    const prayer = await Prayer.findById(id);

    if (!prayer) {
      return res.status(404).json({
        status: false,
        message: 'Prayer request not found'
      });
    }

    // Only the author can update status
    if (prayer.author.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: 'Only the prayer author can update status'
      });
    }

    prayer.status = status;
    await prayer.save();

    res.status(200).json({
      status: true,
      message: 'Prayer status updated successfully',
      data: { status: prayer.status }
    });

  } catch (error) {
    console.error('Update prayer status error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update prayer status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const user = req.user;

    const [
      totalPrayers,
      activePrayers,
      answeredPrayers,
      prayersOffered
    ] = await Promise.all([
      Prayer.countDocuments({ author: user._id }),
      Prayer.countDocuments({ author: user._id, status: 'active' }),
      Prayer.countDocuments({ author: user._id, status: 'answered' }),
      Prayer.countDocuments({ 'usersPrayed.user': user._id })
    ]);

    res.status(200).json({
      status: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalPrayers,
        activePrayers,
        answeredPrayers,
        prayersOffered
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;