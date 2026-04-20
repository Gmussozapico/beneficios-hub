const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// ─── Providers ────────────────────────────────────────────────────────────────

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
    if (!providerId) return res.status(400).json({ error: 'providerId is required' });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const existing = await prisma.userProvider.findUnique({
      where: { userId_providerId: { userId: req.userId, providerId } },
    });
    if (existing) return res.status(409).json({ error: 'Provider already added' });

    await prisma.userProvider.create({ data: { userId: req.userId, providerId } });
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
    if (!existing) return res.status(404).json({ error: 'Provider not in your list' });

    await prisma.userProvider.delete({
      where: { userId_providerId: { userId: req.userId, providerId } },
    });
    res.json({ message: 'Provider removed successfully' });
  } catch (error) {
    console.error('Remove provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Benefits ─────────────────────────────────────────────────────────────────

// GET /api/user/benefits
router.get('/benefits', async (req, res) => {
  try {
    const { category, type, search, dayOfWeek } = req.query;

    const userProviders = await prisma.userProvider.findMany({
      where: { userId: req.userId },
      select: { providerId: true },
    });
    const providerIds = userProviders.map((up) => up.providerId);
    if (providerIds.length === 0) return res.json([]);

    const where = { isActive: true, providerId: { in: providerIds } };
    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      const q = search;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { merchant: { contains: q, mode: 'insensitive' } },
      ];
    }

    let benefits = await prisma.benefit.findMany({
      where,
      include: { provider: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (dayOfWeek !== undefined && dayOfWeek !== '') {
      const day = parseInt(dayOfWeek, 10);
      benefits = benefits.filter((b) => b.validDays.length === 0 || b.validDays.includes(day));
    }

    res.json(benefits);
  } catch (error) {
    console.error('Get user benefits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

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
      const cats = await prisma.benefit.groupBy({
        by: ['category'],
        where: { isActive: true, providerId: { in: providerIds } },
      });
      categoriesCount = cats.length;
    }

    // Total saved from usages
    const savingsResult = await prisma.benefitUsage.aggregate({
      where: { userId: req.userId },
      _sum: { savedAmount: true },
      _count: { id: true },
    });
    const totalSaved = savingsResult._sum.savedAmount || 0;
    const totalUsages = savingsResult._count.id || 0;

    res.json({ totalBenefits, totalProviders, categoriesCount, totalSaved, totalUsages });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Usages ───────────────────────────────────────────────────────────────────

// POST /api/user/benefits/:benefitId/use
router.post('/benefits/:benefitId/use', async (req, res) => {
  try {
    const { benefitId } = req.params;
    const { savedAmount } = req.body; // optional, in CLP

    // Verify the benefit belongs to one of the user's providers
    const userProviders = await prisma.userProvider.findMany({
      where: { userId: req.userId },
      select: { providerId: true },
    });
    const providerIds = userProviders.map((up) => up.providerId);

    const benefit = await prisma.benefit.findFirst({
      where: { id: benefitId, providerId: { in: providerIds } },
    });
    if (!benefit) return res.status(404).json({ error: 'Benefit not found' });

    const usage = await prisma.benefitUsage.create({
      data: {
        userId: req.userId,
        benefitId,
        savedAmount: savedAmount ? parseInt(savedAmount, 10) : null,
      },
    });
    res.status(201).json(usage);
  } catch (error) {
    console.error('Record usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/usages
router.get('/usages', async (req, res) => {
  try {
    const usages = await prisma.benefitUsage.findMany({
      where: { userId: req.userId },
      include: {
        benefit: {
          include: { provider: { include: { category: true } } },
        },
      },
      orderBy: { usedAt: 'desc' },
      take: 20,
    });
    res.json(usages);
  } catch (error) {
    console.error('Get usages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Favorites ────────────────────────────────────────────────────────────────

// GET /api/user/favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: req.userId },
      include: {
        benefit: {
          include: { provider: { include: { category: true } } },
        },
      },
      orderBy: { addedAt: 'desc' },
    });
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/favorites/:benefitId
router.post('/favorites/:benefitId', async (req, res) => {
  try {
    const { benefitId } = req.params;

    const benefit = await prisma.benefit.findUnique({ where: { id: benefitId } });
    if (!benefit) return res.status(404).json({ error: 'Benefit not found' });

    const existing = await prisma.userFavorite.findUnique({
      where: { userId_benefitId: { userId: req.userId, benefitId } },
    });
    if (existing) return res.status(409).json({ error: 'Already in favorites' });

    const fav = await prisma.userFavorite.create({
      data: { userId: req.userId, benefitId },
    });
    res.status(201).json(fav);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/user/favorites/:benefitId
router.delete('/favorites/:benefitId', async (req, res) => {
  try {
    const { benefitId } = req.params;

    const existing = await prisma.userFavorite.findUnique({
      where: { userId_benefitId: { userId: req.userId, benefitId } },
    });
    if (!existing) return res.status(404).json({ error: 'Not in favorites' });

    await prisma.userFavorite.delete({
      where: { userId_benefitId: { userId: req.userId, benefitId } },
    });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
