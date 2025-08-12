import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { page = 1, limit = 20, search = '', role } = req.query;

    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch users'
      }
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Users can only view their own profile unless they're admin/student senate
    if (id !== currentUserId && !['ADMIN', 'STUDENT_SENATE'].includes(currentUserRole)) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to view this profile'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        activities: {
          select: {
            id: true,
            title: true,
            startTime: true,
            status: true,
            category: {
              select: { name: true, color: true }
            },
            _count: {
              select: { likes: true, comments: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            activities: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found'
        }
      });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user'
      }
    });
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, requireRole(['ADMIN']), async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'STUDENT_SENATE', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: {
          message: 'Invalid role'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found'
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update user role'
      }
    });
  }
});

// Deactivate user (Admin only)
router.patch('/:id/deactivate', authenticateToken, requireRole(['ADMIN']), async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found'
        }
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        error: {
          message: 'User is already deactivated'
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      message: 'User deactivated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to deactivate user'
      }
    });
  }
});

// Reactivate user (Admin only)
router.patch('/:id/activate', authenticateToken, requireRole(['ADMIN']), async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found'
        }
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        error: {
          message: 'User is already active'
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      message: 'User activated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Activate user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to activate user'
      }
    });
  }
});

export default router; 