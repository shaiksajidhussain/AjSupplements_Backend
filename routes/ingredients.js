const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ ingredients });
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ingredient categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.ingredient.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    const categoryList = categories.map(cat => cat.category);
    
    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get ingredient categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific ingredient
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json({ ingredient });
  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new ingredient (Admin only - for now, no auth check)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      speciesId,
      crudeProtein,
      protein,  // Frontend sends 'protein' instead of 'crudeProtein'
      energy,
      tdn,      // TDN for non-poultry species
      cost,
      fiber,    // Frontend sends 'fiber' field
      lysine,
      methionine,
      calcium,
      phosphorus,
      salt,
      premix,
      maxInclusion,
      minInclusion,
      description
    } = req.body;

    // Validation
    if (!name || !category || !speciesId) {
      return res.status(400).json({ 
        error: 'Name, category, and species are required' 
      });
    }

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name }
    });

    if (existingIngredient) {
      return res.status(400).json({ 
        error: 'Ingredient with this name already exists' 
      });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category,
        speciesId,
        crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
        energy: energy ? parseFloat(energy) : null,
        tdn: tdn ? parseFloat(tdn) : null,
        cost: cost ? parseFloat(cost) : null,
        fiber: fiber ? parseFloat(fiber) : null,  // Add fiber field
        lysine: lysine ? parseFloat(lysine) : null,
        methionine: methionine ? parseFloat(methionine) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        phosphorus: phosphorus ? parseFloat(phosphorus) : null,
        salt: salt ? parseFloat(salt) : 0.3,  // Default to 0.3 if not provided
        premix: premix ? parseFloat(premix) : 1,  // Default to 1 if not provided
        maxInclusion: maxInclusion ? parseFloat(maxInclusion) : null,
        minInclusion: minInclusion ? parseFloat(minInclusion) : null,
        description: description || null
      }
    });

    res.status(201).json({
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an ingredient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      speciesId,
      crudeProtein,
      protein,  // Frontend sends 'protein' instead of 'crudeProtein'
      energy,
      tdn,      // TDN for non-poultry species
      cost,
      fiber,    // Frontend sends 'fiber' field
      lysine,
      methionine,
      calcium,
      phosphorus,
      salt,
      premix,
      maxInclusion,
      minInclusion,
      description
    } = req.body;

    // Check if ingredient exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!existingIngredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingIngredient.name) {
      const nameExists = await prisma.ingredient.findUnique({
        where: { name }
      });

      if (nameExists) {
        return res.status(400).json({ 
          error: 'Ingredient with this name already exists' 
        });
      }
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: name || undefined,
        category: category || undefined,
        speciesId: speciesId || undefined,
        crudeProtein: crudeProtein !== undefined ? parseFloat(crudeProtein) : undefined,
        energy: energy !== undefined ? parseFloat(energy) : undefined,
        tdn: tdn !== undefined ? parseFloat(tdn) : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        fiber: fiber !== undefined ? parseFloat(fiber) : undefined,  // Add fiber field
        lysine: lysine !== undefined ? parseFloat(lysine) : undefined,
        methionine: methionine !== undefined ? parseFloat(methionine) : undefined,
        calcium: calcium !== undefined ? parseFloat(calcium) : undefined,
        phosphorus: phosphorus !== undefined ? parseFloat(phosphorus) : undefined,
        salt: salt !== undefined ? parseFloat(salt) : undefined,
        premix: premix !== undefined ? parseFloat(premix) : undefined,
        maxInclusion: maxInclusion !== undefined ? parseFloat(maxInclusion) : undefined,
        minInclusion: minInclusion !== undefined ? parseFloat(minInclusion) : undefined,
        description: description !== undefined ? description : undefined
      }
    });

    res.json({
      message: 'Ingredient updated successfully',
      ingredient
    });
  } catch (error) {
    console.error('Update ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Check if ingredient is used in any formulations
    const formulationsUsingIngredient = await prisma.feedFormulationIngredient.findFirst({
      where: { ingredientId: id }
    });

    if (formulationsUsingIngredient) {
      return res.status(400).json({ 
        error: 'Cannot delete ingredient that is used in feed formulations' 
      });
    }

    await prisma.ingredient.delete({
      where: { id }
    });

    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Delete ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed ingredients with sample data
router.post('/seed', async (req, res) => {
  try {
    const sampleIngredients = [
      // Energy sources
      { name: 'Corn', category: 'Energy Sources', crudeProtein: 8.5, energy: 3350, cost: 0.25, lysine: 0.25, methionine: 0.18, calcium: 0.02, phosphorus: 0.25, salt: 0.3, premix: 1, maxInclusion: 70 },
      { name: 'Wheat', category: 'Energy Sources', crudeProtein: 12.0, energy: 3300, cost: 0.28, lysine: 0.35, methionine: 0.20, calcium: 0.04, phosphorus: 0.35, salt: 0.3, premix: 1, maxInclusion: 60 },
      { name: 'Rice Bran', category: 'Energy Sources', crudeProtein: 13.0, energy: 3000, cost: 0.22, lysine: 0.55, methionine: 0.25, calcium: 0.08, phosphorus: 1.20, salt: 0.3, premix: 1, maxInclusion: 25 },
      
      // Protein sources
      { name: 'Soybean Meal', category: 'Protein Sources', crudeProtein: 48.0, energy: 2450, cost: 0.45, lysine: 2.90, methionine: 0.65, calcium: 0.30, phosphorus: 0.70, salt: 0.3, premix: 1, maxInclusion: 30 },
      { name: 'Fish Meal', category: 'Protein Sources', crudeProtein: 65.0, energy: 2900, cost: 1.20, lysine: 4.80, methionine: 1.50, calcium: 7.00, phosphorus: 3.50, salt: 0.3, premix: 1, maxInclusion: 10 },
      { name: 'Sunflower Meal', category: 'Protein Sources', crudeProtein: 32.0, energy: 2100, cost: 0.35, lysine: 1.20, methionine: 0.60, calcium: 0.40, phosphorus: 1.00, salt: 0.3, premix: 1, maxInclusion: 20 },
      
      // Minerals
      { name: 'Calcium Carbonate', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.15, lysine: 0, methionine: 0, calcium: 38.0, phosphorus: 0, salt: 0.3, premix: 1, maxInclusion: 3 },
      { name: 'Dicalcium Phosphate', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.85, lysine: 0, methionine: 0, calcium: 22.0, phosphorus: 18.0, salt: 0.3, premix: 1, maxInclusion: 2 },
      { name: 'Salt', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.10, lysine: 0, methionine: 0, calcium: 0, phosphorus: 0, salt: 99.0, premix: 1, maxInclusion: 0.5 },
      
      // Vitamins
      { name: 'Vitamin Premix', category: 'Vitamins', crudeProtein: 0, energy: 0, cost: 2.50, lysine: 0, methionine: 0, calcium: 0, phosphorus: 0, salt: 0.3, premix: 1, maxInclusion: 1 },
      { name: 'Mineral Premix', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 1.80, lysine: 0, methionine: 0, calcium: 0, phosphorus: 0, salt: 0.3, premix: 1, maxInclusion: 1 }
    ];

    // Clear existing ingredients (optional - remove this if you want to keep existing data)
    // await prisma.ingredient.deleteMany({});

    // Create ingredients
    const createdIngredients = [];
    for (const ingredient of sampleIngredients) {
      try {
        const created = await prisma.ingredient.create({
          data: ingredient
        });
        createdIngredients.push(created);
      } catch (error) {
        // Skip if ingredient already exists
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }

    res.status(201).json({
      message: `Successfully seeded ${createdIngredients.length} ingredients`,
      ingredients: createdIngredients
    });
  } catch (error) {
    console.error('Seed ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
