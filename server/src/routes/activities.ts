import express from 'express';
import { createActivitySchema, updateActivitySchema, activityFiltersSchema, validateRequest, createCommentSchema } from '../utils/validation';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all activities with filtering and pagination
router.get('/', optionalAuth, async (req: any, res) => {
  try {
    const filters = validateRequest(activityFiltersSchema, req.query);
    const prisma = req.prisma;

    const where: any = {
      status: filters.status || { not: 'CANCELLED' }
    };

    if (filters.category) {
      where.categoryId = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags
      };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, firstName: true, lastName: true, role: true }
          },
          category: true,
          _count: {
            select: { comments: true, likes: true }
          },
          likes: req.user ? {
            where: { userId: req.user.id },
            select: { id: true }
          } : false
        },
        orderBy: { startTime: 'asc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.activity.count({ where })
    ]);

    // Add isLiked field for authenticated users
    const activitiesWithLikes = activities.map((activity: any) => ({
      ...activity,
      isLiked: req.user ? activity.likes.length > 0 : false,
      likes: undefined // Remove the likes array from response
    }));

    res.json({
      activities: activitiesWithLikes,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error: any) {
    console.error('Get activities error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to fetch activities'
      }
    });
  }
});

// Get single activity by ID
router.get('/:id', optionalAuth, async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true, role: true }
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { id: true, username: true, firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { likes: true }
        },
        likes: req.user ? {
          where: { userId: req.user.id },
          select: { id: true }
        } : false
      }
    });

    if (!activity) {
      return res.status(404).json({
        error: {
          message: 'Activity not found'
        }
      });
    }

    const activityWithLikes = {
      ...activity,
      isLiked: req.user ? activity.likes.length > 0 : false,
      likes: undefined
    };

    res.json({ activity: activityWithLikes });
  } catch (error: any) {
    console.error('Get activity error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch activity'
      }
    });
  }
});

// Create new activity
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const activityData = validateRequest(createActivitySchema, req.body);
    const prisma = req.prisma;
    const userId = req.user.id;

    // Validate start and end times
    const startTime = new Date(activityData.startTime);
    const endTime = activityData.endTime ? new Date(activityData.endTime) : null;

    if (endTime && endTime <= startTime) {
      return res.status(400).json({
        error: {
          message: 'End time must be after start time'
        }
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: activityData.categoryId }
    });

    if (!category) {
      return res.status(400).json({
        error: {
          message: 'Invalid category'
        }
      });
    }

    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        startTime,
        endTime,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true, role: true }
        },
        category: true,
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });

    res.status(201).json({
      message: 'Activity created successfully',
      activity: {
        ...activity,
        isLiked: false
      }
    });
  } catch (error: any) {
    console.error('Create activity error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to create activity'
      }
    });
  }
});

// Update activity
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = validateRequest(updateActivitySchema, req.body);
    const prisma = req.prisma;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find existing activity
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!existingActivity) {
      return res.status(404).json({
        error: {
          message: 'Activity not found'
        }
      });
    }

    // Check permissions
    if (existingActivity.authorId !== userId && !['STUDENT_SENATE', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to update this activity'
        }
      });
    }

    // Validate dates if provided
    const startTime = updateData.startTime ? new Date(updateData.startTime) : existingActivity.startTime;
    const endTime = updateData.endTime ? new Date(updateData.endTime) : existingActivity.endTime;

    if (endTime && endTime <= startTime) {
      return res.status(400).json({
        error: {
          message: 'End time must be after start time'
        }
      });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...updateData,
        startTime: updateData.startTime ? startTime : undefined,
        endTime: updateData.endTime ? endTime : undefined,
      },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true, role: true }
        },
        category: true,
        _count: {
          select: { comments: true, likes: true }
        },
        likes: {
          where: { userId },
          select: { id: true }
        }
      }
    });

    res.json({
      message: 'Activity updated successfully',
      activity: {
        ...activity,
        isLiked: activity.likes.length > 0,
        likes: undefined
      }
    });
  } catch (error: any) {
    console.error('Update activity error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to update activity'
      }
    });
  }
});

// Delete activity
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find existing activity
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!existingActivity) {
      return res.status(404).json({
        error: {
          message: 'Activity not found'
        }
      });
    }

    // Check permissions
    if (existingActivity.authorId !== userId && !['STUDENT_SENATE', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to delete this activity'
        }
      });
    }

    await prisma.activity.delete({
      where: { id }
    });

    res.json({
      message: 'Activity deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete activity'
      }
    });
  }
});

// Like/Unlike activity
router.post('/:id/like', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;
    const userId = req.user.id;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({
        error: {
          message: 'Activity not found'
        }
      });
    }

    // Check if user already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        activityId: id,
        userId
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ message: 'Activity unliked', isLiked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          activityId: id,
          userId
        }
      });
      res.json({ message: 'Activity liked', isLiked: true });
    }
  } catch (error: any) {
    console.error('Like activity error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to like/unlike activity'
      }
    });
  }
});

// Add comment to activity
router.post('/:id/comments', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content } = validateRequest(createCommentSchema, { ...req.body, activityId: id });
    const prisma = req.prisma;
    const userId = req.user.id;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!activity) {
      return res.status(404).json({
        error: {
          message: 'Activity not found'
        }
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        activityId: id,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to add comment'
      }
    });
  }
});

export default router; 