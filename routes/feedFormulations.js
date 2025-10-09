const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all feed formulations for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const feedFormulations = await prisma.feedFormulation.findMany({
      where: { userId: req.user.userId },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ feedFormulations });
  } catch (error) {
    console.error('Get feed formulations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific feed formulation
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const feedFormulation = await prisma.feedFormulation.findFirst({
      where: { 
        id,
        userId: req.user.userId 
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    if (!feedFormulation) {
      return res.status(404).json({ error: 'Feed formulation not found' });
    }

    res.json({ feedFormulation });
  } catch (error) {
    console.error('Get feed formulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new feed formulation
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      feedBatchWeight,
      species,
      subspecies,
      animalType,
      phase,
      crudeProtein,
      energy,
      includePremix,
      ingredients = []
    } = req.body;

    // Validation
    if (!feedBatchWeight || !species || !phase) {
      return res.status(400).json({ 
        error: 'Feed batch weight, species, and phase are required' 
      });
    }

    // Create feed formulation with ingredients
    const feedFormulation = await prisma.feedFormulation.create({
      data: {
        feedBatchWeight: parseFloat(feedBatchWeight),
        species,
        subspecies: subspecies || null,
        animalType: animalType || null,
        phase,
        crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
        energy: energy ? parseFloat(energy) : null,
        includePremix: includePremix !== undefined ? includePremix : true,
        userId: req.user.userId,
        ingredients: {
          create: ingredients.map(ingredient => ({
            percentage: parseFloat(ingredient.percentage),
            cost: ingredient.cost ? parseFloat(ingredient.cost) : null,
            ingredientId: ingredient.ingredientId
          }))
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Feed formulation created successfully',
      feedFormulation
    });
  } catch (error) {
    console.error('Create feed formulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a feed formulation
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      feedBatchWeight,
      species,
      subspecies,
      animalType,
      phase,
      crudeProtein,
      energy,
      includePremix,
      ingredients = []
    } = req.body;

    // Check if feed formulation exists and belongs to user
    const existingFormulation = await prisma.feedFormulation.findFirst({
      where: { 
        id,
        userId: req.user.userId 
      }
    });

    if (!existingFormulation) {
      return res.status(404).json({ error: 'Feed formulation not found' });
    }

    // Update feed formulation
    const feedFormulation = await prisma.feedFormulation.update({
      where: { id },
      data: {
        feedBatchWeight: feedBatchWeight ? parseFloat(feedBatchWeight) : undefined,
        species,
        subspecies: subspecies || null,
        animalType: animalType || null,
        phase,
        crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
        energy: energy ? parseFloat(energy) : null,
        includePremix: includePremix !== undefined ? includePremix : undefined
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    // Update ingredients if provided
    if (ingredients.length > 0) {
      // Delete existing ingredients
      await prisma.feedFormulationIngredient.deleteMany({
        where: { feedFormulationId: id }
      });

      // Create new ingredients
      await prisma.feedFormulationIngredient.createMany({
        data: ingredients.map(ingredient => ({
          percentage: parseFloat(ingredient.percentage),
          cost: ingredient.cost ? parseFloat(ingredient.cost) : null,
          ingredientId: ingredient.ingredientId,
          feedFormulationId: id
        }))
      });

      // Fetch updated formulation with ingredients
      const updatedFormulation = await prisma.feedFormulation.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });

      return res.json({
        message: 'Feed formulation updated successfully',
        feedFormulation: updatedFormulation
      });
    }

    res.json({
      message: 'Feed formulation updated successfully',
      feedFormulation
    });
  } catch (error) {
    console.error('Update feed formulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a feed formulation
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if feed formulation exists and belongs to user
    const feedFormulation = await prisma.feedFormulation.findFirst({
      where: { 
        id,
        userId: req.user.userId 
      }
    });

    if (!feedFormulation) {
      return res.status(404).json({ error: 'Feed formulation not found' });
    }

    // Delete feed formulation (ingredients will be deleted automatically due to cascade)
    await prisma.feedFormulation.delete({
      where: { id }
    });

    res.json({ message: 'Feed formulation deleted successfully' });
  } catch (error) {
    console.error('Delete feed formulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate feed formulation (placeholder for calculation logic)
router.post('/calculate', verifyToken, async (req, res) => {
  try {
    const {
      feedBatchWeight,
      species,
      subspecies,
      animalType,
      phase,
      crudeProtein,
      energy,
      includePremix,
      availableIngredients = []
    } = req.body;

    // Basic validation
    if (!feedBatchWeight || !species || !phase) {
      return res.status(400).json({ 
        error: 'Feed batch weight, species, and phase are required' 
      });
    }

    // TODO: Implement actual feed formulation calculation algorithm
    // This is a placeholder response
    const calculatedFormulation = {
      feedBatchWeight: parseFloat(feedBatchWeight),
      species,
      subspecies,
      animalType,
      phase,
      crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
      energy: energy ? parseFloat(energy) : null,
      includePremix,
      calculatedIngredients: availableIngredients.map(ingredient => ({
        ingredientId: ingredient.id,
        name: ingredient.name,
        percentage: Math.random() * 20, // Placeholder calculation
        cost: ingredient.cost ? parseFloat(ingredient.cost) : 0
      })),
      totalCost: availableIngredients.reduce((sum, ing) => sum + (ing.cost || 0), 0),
      calculatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Feed formulation calculated successfully',
      formulation: calculatedFormulation
    });
  } catch (error) {
    console.error('Calculate feed formulation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
