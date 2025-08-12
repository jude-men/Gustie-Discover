import express from 'express';
import { createCategorySchema, updateCategorySchema, validateRequest } from '../utils/validation';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all categories
router.get('/', async (req: any, res) => {
  try {
    const prisma = req.prisma;

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { activities: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch categories'
      }
    });
  }
});

// Get single category by ID
router.get('/:id', async (req: any, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { activities: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        error: {
          message: 'Category not found'
        }
      });
    }

    res.json({ category });
  } catch (error: any) {
    console.error('Get category error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch category'
      }
    });
  }
});

// Create new category (Student Senate/Admin only)
router.post('/', authenticateToken, requireRole(['STUDENT_SENATE', 'ADMIN']), async (req: any, res) => {
  try {
    const categoryData = validateRequest(createCategorySchema, req.body);
    const prisma = req.prisma;

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name }
    });

    if (existingCategory) {
      return res.status(400).json({
        error: {
          message: 'Category name already exists'
        }
      });
    }

    const category = await prisma.category.create({
      data: categoryData
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to create category'
      }
    });
  }
});

// Update category (Student Senate/Admin only)
router.put('/:id', authenticateToken, requireRole(['STUDENT_SENATE', 'ADMIN']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = validateRequest(updateCategorySchema, req.body);
    const prisma = req.prisma;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: {
          message: 'Category not found'
        }
      });
    }

    // Check if new name conflicts with existing category
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: updateData.name }
      });

      if (nameConflict) {
        return res.status(400).json({
          error: {
            message: 'Category name already exists'
          }
        });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Failed to update category'
      }
    });
  }
});

// Delete category (Student Senate/Admin only)
router.delete('/:id', authenticateToken, requireRole(['STUDENT_SENATE', 'ADMIN']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { activities: true }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        error: {
          message: 'Category not found'
        }
      });
    }

    // Check if category has activities
    if (existingCategory._count.activities > 0) {
      return res.status(400).json({
        error: {
          message: 'Cannot delete category with existing activities'
        }
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete category'
      }
    });
  }
});

export default router; 