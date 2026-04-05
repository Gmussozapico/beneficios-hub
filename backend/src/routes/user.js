const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/user/providers
router.get('/providers', async (req, res) => {
  try {
    const userProviders = await prisma.userProvider.findMany({
      where: { userId: req.userId },
      include: {
        provider: {
          include: {
            category: true,
            _count: { select: { benefits: { where: { isActive: true } } } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    const providers = userProviders.map((up) => up.provider);
    res.json(providers);
  } catch (error) {
    console.error('Get user providers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/providers
router.post('/providers', async (req, res) => {
  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({ error: 'providerId is required' });
    }

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const existing = await prisma.userProvider.findUnique({
      where: { userId_providerId: { userId: req.userId, providerId } },
    });

    if (existing) {
      return res.status(409).json({ error: 'Provider already added' });
    }

    await prisma.userProvider.create({
      data: { userId: req.userId, providerId },
    });

    res.status(201).json({ message: 'Provider added successfully' });
  } catch (error) {
    console.error('Add provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/user/providers/:providerId
router.delete('/providers/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;

    const existing = await prisma.userProvider.findUnique({
      where: { userId_providerId: { userId: req.userId, providerId } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Provider not in your list' });
    }

    await prisma.userProvider.delete({
      where: { userId_providerId: { userId: req.userId, providerId } },
    });

    res.json({ message: 'Provider removed successfully' });
  } catch (error) {
    console.error('Remove provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/benefits
router.get('/benefits', async (req, res) => {
  try {
    const { category, type, search, dayOfWeek } = req.query;

    // Get user's provider IDs
    const userProviders = await prisma.userProvider.findMany({
      where: { userId: req.userId },
      select: { providerId: true },
    });

    const providerIds = userProviders.map((up) => up.providerId);

    if (providerIds.length === 0) {
      return res.json([]);
    }

    const where = {
      isActive: true,
      providerId: { in: providerIds },
    };

    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let benefits = await prisma.benefit.findMany({
      where,
      include: {
        provider: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dayOfWeek !== undefined && dayOfWeek !== '') {
      const day = parseInt(dayOfWeek, 10);
      benefits = benefits.filter(b => b.validDays.length === 0 || b.validDays.includes(day));
    }

    res.json(benefits);
  } catch (error) {
    console.error('Get user benefits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/stats
router.get('/stats', async (req, res) => {
  try {
    const userProviders = await prisma.userProvider.findMany({
      where: { userId: req.userId },
      select: { providerId: true },
    });

    const providerIds = userProviders.map((up) => up.providerId);
    const totalProviders = providerIds.length;

    let totalBenefits = 0;
    let categoriesCount = 0;

    if (providerIds.length > 0) {
      totalBenefits = await prisma.benefit.count({
        where: { isActive: true, providerId: { in: providerIds } },
      });

      const categoriesResult = await prisma.benefit.groupBy({
        by: ['category'],
        where: { isActive: true, providerId: { in: providerIds } },
      });
      categoriesCount = categoriesResult.length;
    }

    res.json({ totalBenefits, totalProviders, categoriesCount });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
