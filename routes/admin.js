const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Species endpoints - using database
router.get('/species', async (req, res) => {
  try {
    const species = await prisma.species.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ species });
  } catch (error) {
    console.error('Get species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/species', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      notIncluded, 
      includeSubspecies, 
      includeAnimalTypes, 
      includePhases 
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if species already exists
    const existingSpecies = await prisma.species.findUnique({
      where: { name }
    });

    if (existingSpecies) {
      return res.status(400).json({ error: 'Species with this name already exists' });
    }

    const newSpecies = await prisma.species.create({
      data: {
    name,
        description: description || `${name} species`,
        notIncluded: notIncluded || false,
        includeSubspecies: includeSubspecies !== undefined ? includeSubspecies : true,
        includeAnimalTypes: includeAnimalTypes !== undefined ? includeAnimalTypes : true,
        includePhases: includePhases !== undefined ? includePhases : true
      }
    });

    console.log('POST /species - Created species:', newSpecies);
  res.json({ species: newSpecies });
  } catch (error) {
    console.error('Create species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/species/:id', async (req, res) => {
  try {
  const { id } = req.params;
    const { 
      name, 
      description, 
      notIncluded, 
      includeSubspecies, 
      includeAnimalTypes, 
      includePhases 
    } = req.body;
    
    // Check if species exists
    const existingSpecies = await prisma.species.findUnique({
      where: { id }
    });

    if (!existingSpecies) {
    return res.status(404).json({ error: 'Species not found' });
  }
  
    // Check if new name conflicts with existing species
    if (name && name !== existingSpecies.name) {
      const nameConflict = await prisma.species.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Species with this name already exists' });
      }
    }

    const updatedSpecies = await prisma.species.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        notIncluded: notIncluded !== undefined ? notIncluded : undefined,
        includeSubspecies: includeSubspecies !== undefined ? includeSubspecies : undefined,
        includeAnimalTypes: includeAnimalTypes !== undefined ? includeAnimalTypes : undefined,
        includePhases: includePhases !== undefined ? includePhases : undefined
      }
    });

    console.log('PUT /species/:id - Updated species:', updatedSpecies);
    res.json({ species: updatedSpecies });
  } catch (error) {
    console.error('Update species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/species/:id', async (req, res) => {
  try {
  const { id } = req.params;
    
    // Check if species exists
    const existingSpecies = await prisma.species.findUnique({
      where: { id }
    });

    if (!existingSpecies) {
    return res.status(404).json({ error: 'Species not found' });
  }
  
    // Delete species (this will cascade delete subspecies, animal types, and phases)
    await prisma.species.delete({
      where: { id }
    });

    console.log('DELETE /species/:id - Deleted species:', existingSpecies);
  res.json({ message: 'Species deleted successfully' });
  } catch (error) {
    console.error('Delete species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subspecies endpoints - using database
router.get('/species/:speciesId/subspecies', async (req, res) => {
  try {
  const { speciesId } = req.params;
    
    const subspecies = await prisma.subspecies.findMany({
      where: { speciesId },
      orderBy: { name: 'asc' }
    });

    console.log(`GET /species/${speciesId}/subspecies - Found ${subspecies.length} subspecies`);
  res.json({ subspecies });
  } catch (error) {
    console.error('Get subspecies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/species/:speciesId/subspecies', async (req, res) => {
  try {
  const { speciesId } = req.params;
  const { name, description } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if species exists
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    // Check if subspecies already exists for this species
    const existingSubspecies = await prisma.subspecies.findFirst({
      where: {
        speciesId,
        name
      }
    });

    if (existingSubspecies) {
      return res.status(400).json({ error: 'Subspecies with this name already exists for this species' });
    }

    const newSubspecies = await prisma.subspecies.create({
      data: {
    name,
        description: description || `${name} subspecies`,
        speciesId
      }
    });

    console.log(`POST /species/${speciesId}/subspecies - Created subspecies:`, newSubspecies);
  res.json({ subspecies: newSubspecies });
  } catch (error) {
    console.error('Create subspecies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/subspecies/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const { name, description } = req.body;
  
    // Check if subspecies exists
    const existingSubspecies = await prisma.subspecies.findUnique({
      where: { id }
    });

    if (!existingSubspecies) {
      return res.status(404).json({ error: 'Subspecies not found' });
    }

    // Check if new name conflicts with existing subspecies in the same species
    if (name && name !== existingSubspecies.name) {
      const nameConflict = await prisma.subspecies.findFirst({
        where: {
          speciesId: existingSubspecies.speciesId,
          name
        }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Subspecies with this name already exists for this species' });
      }
    }

    const updatedSubspecies = await prisma.subspecies.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined
      }
    });

    console.log(`PUT /subspecies/:id - Updated subspecies:`, updatedSubspecies);
    res.json({ subspecies: updatedSubspecies });
  } catch (error) {
    console.error('Update subspecies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/subspecies/:id', async (req, res) => {
  try {
  const { id } = req.params;
  
    // Check if subspecies exists
    const existingSubspecies = await prisma.subspecies.findUnique({
      where: { id }
    });

    if (!existingSubspecies) {
      return res.status(404).json({ error: 'Subspecies not found' });
    }

    // Delete subspecies (this will cascade delete animal types and phases)
    await prisma.subspecies.delete({
      where: { id }
    });

    console.log('DELETE /subspecies/:id - Deleted subspecies:', existingSubspecies);
    res.json({ message: 'Subspecies deleted successfully' });
  } catch (error) {
    console.error('Delete subspecies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Animal Types endpoints - using database
router.get('/subspecies/:subspeciesId/animal-types', async (req, res) => {
  try {
    const { subspeciesId } = req.params;
    
    const animalTypes = await prisma.animalType.findMany({
      where: { subspeciesId },
      orderBy: { name: 'asc' }
    });

    console.log(`GET /subspecies/${subspeciesId}/animal-types - Found ${animalTypes.length} animal types`);
    res.json({ animalTypes });
  } catch (error) {
    console.error('Get animal types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/subspecies/:subspeciesId/animal-types', async (req, res) => {
  try {
    const { subspeciesId } = req.params;
  const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if subspecies exists
    const subspecies = await prisma.subspecies.findUnique({
      where: { id: subspeciesId }
    });

    if (!subspecies) {
      return res.status(404).json({ error: 'Subspecies not found' });
    }

    // Check if animal type already exists for this subspecies
    const existingAnimalType = await prisma.animalType.findFirst({
      where: {
        subspeciesId,
        name
      }
    });

    if (existingAnimalType) {
      return res.status(400).json({ error: 'Animal type with this name already exists for this subspecies' });
    }

    const newAnimalType = await prisma.animalType.create({
      data: {
        name,
        description: description || `${name} animal type`,
        subspeciesId,
        speciesId: subspecies.speciesId
      }
    });

    console.log(`POST /subspecies/${subspeciesId}/animal-types - Created animal type:`, newAnimalType);
  res.json({ animalType: newAnimalType });
  } catch (error) {
    console.error('Create animal type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/animal-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
  const { name, description } = req.body;
    
    // Check if animal type exists
    const existingAnimalType = await prisma.animalType.findUnique({
      where: { id }
    });

    if (!existingAnimalType) {
      return res.status(404).json({ error: 'Animal type not found' });
    }

    // Check if new name conflicts with existing animal type in the same subspecies
    if (name && name !== existingAnimalType.name) {
      const nameConflict = await prisma.animalType.findFirst({
        where: {
          subspeciesId: existingAnimalType.subspeciesId,
          name
        }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Animal type with this name already exists for this subspecies' });
      }
    }

    const updatedAnimalType = await prisma.animalType.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined
      }
    });

    console.log(`PUT /animal-types/:id - Updated animal type:`, updatedAnimalType);
  res.json({ animalType: updatedAnimalType });
  } catch (error) {
    console.error('Update animal type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/animal-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if animal type exists
    const existingAnimalType = await prisma.animalType.findUnique({
      where: { id }
    });

    if (!existingAnimalType) {
      return res.status(404).json({ error: 'Animal type not found' });
    }

    // Delete animal type (this will cascade delete phases)
    await prisma.animalType.delete({
      where: { id }
    });

    console.log('DELETE /animal-types/:id - Deleted animal type:', existingAnimalType);
  res.json({ message: 'Animal type deleted successfully' });
  } catch (error) {
    console.error('Delete animal type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Phases endpoints - using database
router.get('/animal-types/:animalTypeId/phases', async (req, res) => {
  try {
    const { animalTypeId } = req.params;
    
    const phases = await prisma.phase.findMany({
      where: { animalTypeId },
      orderBy: { name: 'asc' }
    });

    console.log(`GET /animal-types/${animalTypeId}/phases - Found ${phases.length} phases`);
    res.json({ phases });
  } catch (error) {
    console.error('Get phases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/animal-types/:animalTypeId/phases', async (req, res) => {
  try {
    const { animalTypeId } = req.params;
    const {
      name,
      description,
      crudeProtein,
      meKcalPerKg,
      calcium,
      availablePhosphorus,
      lysine,
      methionine
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if animal type exists
    const animalType = await prisma.animalType.findUnique({
      where: { id: animalTypeId },
      include: {
        subspecies: true
      }
    });

    if (!animalType) {
      return res.status(404).json({ error: 'Animal type not found' });
    }

    // Check if phase already exists for this animal type
    const existingPhase = await prisma.phase.findFirst({
      where: {
        animalTypeId,
        name
      }
    });

    if (existingPhase) {
      return res.status(400).json({ error: 'Phase with this name already exists for this animal type' });
    }

    const newPhase = await prisma.phase.create({
      data: {
        name,
        description: description || `${name} phase`,
        crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
        meKcalPerKg: meKcalPerKg ? parseFloat(meKcalPerKg) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        availablePhosphorus: availablePhosphorus ? parseFloat(availablePhosphorus) : null,
        lysine: lysine ? parseFloat(lysine) : null,
        methionine: methionine ? parseFloat(methionine) : null,
        animalTypeId,
        speciesId: animalType.speciesId
      }
    });

    console.log(`POST /animal-types/${animalTypeId}/phases - Created phase:`, newPhase);
  res.json({ phase: newPhase });
  } catch (error) {
    console.error('Create phase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/phases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      crudeProtein,
      meKcalPerKg,
      calcium,
      availablePhosphorus,
      lysine,
      methionine
    } = req.body;
    
    // Check if phase exists
    const existingPhase = await prisma.phase.findUnique({
      where: { id }
    });

    if (!existingPhase) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    // Check if new name conflicts with existing phase in the same animal type
    if (name && name !== existingPhase.name) {
      const nameConflict = await prisma.phase.findFirst({
        where: {
          animalTypeId: existingPhase.animalTypeId,
          name
        }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'Phase with this name already exists for this animal type' });
      }
    }

    const updatedPhase = await prisma.phase.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        crudeProtein: crudeProtein !== undefined ? (crudeProtein ? parseFloat(crudeProtein) : null) : undefined,
        meKcalPerKg: meKcalPerKg !== undefined ? (meKcalPerKg ? parseFloat(meKcalPerKg) : null) : undefined,
        calcium: calcium !== undefined ? (calcium ? parseFloat(calcium) : null) : undefined,
        availablePhosphorus: availablePhosphorus !== undefined ? (availablePhosphorus ? parseFloat(availablePhosphorus) : null) : undefined,
        lysine: lysine !== undefined ? (lysine ? parseFloat(lysine) : null) : undefined,
        methionine: methionine !== undefined ? (methionine ? parseFloat(methionine) : null) : undefined
      }
    });

    console.log(`PUT /phases/:id - Updated phase:`, updatedPhase);
  res.json({ phase: updatedPhase });
  } catch (error) {
    console.error('Update phase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/phases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if phase exists
    const existingPhase = await prisma.phase.findUnique({
      where: { id }
    });

    if (!existingPhase) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    // Delete phase
    await prisma.phase.delete({
      where: { id }
    });

    console.log('DELETE /phases/:id - Deleted phase:', existingPhase);
  res.json({ message: 'Phase deleted successfully' });
  } catch (error) {
    console.error('Delete phase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import and use ingredients routes
// Create animal types directly under a species (when includeSubspecies: false)
router.post('/species/:speciesId/animal-types', async (req, res) => {
  try {
    const { speciesId } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if species exists
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    // Check if animal type already exists for this species
    const existingAnimalType = await prisma.animalType.findFirst({
      where: {
        speciesId,
        name
      }
    });

    if (existingAnimalType) {
      return res.status(400).json({ error: 'Animal type with this name already exists for this species' });
    }

    const newAnimalType = await prisma.animalType.create({
      data: {
        name,
        description: description || `${name} animal type`,
        speciesId: speciesId
        // subspeciesId is now optional and will be null
      }
    });

    console.log(`POST /species/${speciesId}/animal-types - Created animal type:`, newAnimalType);
    res.json({ animalType: newAnimalType });
  } catch (error) {
    console.error('Create animal type under species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create phases directly under a species (when includeSubspecies: false and includeAnimalTypes: false)
router.post('/species/:speciesId/phases', async (req, res) => {
  try {
    const { speciesId } = req.params;
    const { name, description, crudeProtein, meKcalPerKg, calcium, availablePhosphorus, lysine, methionine } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if species exists
    const species = await prisma.species.findUnique({
      where: { id: speciesId }
    });

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    // Check if phase already exists for this species
    const existingPhase = await prisma.phase.findFirst({
      where: {
        speciesId,
        name
      }
    });

    if (existingPhase) {
      return res.status(400).json({ error: 'Phase with this name already exists for this species' });
    }

    const newPhase = await prisma.phase.create({
      data: {
        name,
        description: description || `${name} phase`,
        crudeProtein: crudeProtein ? parseFloat(crudeProtein) : null,
        meKcalPerKg: meKcalPerKg ? parseFloat(meKcalPerKg) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        availablePhosphorus: availablePhosphorus ? parseFloat(availablePhosphorus) : null,
        lysine: lysine ? parseFloat(lysine) : null,
        methionine: methionine ? parseFloat(methionine) : null,
        speciesId: speciesId
        // animalTypeId is now optional and will be null
      }
    });

    console.log(`POST /species/${speciesId}/phases - Created phase:`, newPhase);
    res.json({ phase: newPhase });
  } catch (error) {
    console.error('Create phase under species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all animal types for a species (direct access)
router.get('/species/:speciesId/animal-types', async (req, res) => {
  try {
    const { speciesId } = req.params;
    
    const animalTypes = await prisma.animalType.findMany({
      where: { speciesId },
      include: {
        subspecies: true,
        phases: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`GET /species/${speciesId}/animal-types - Found ${animalTypes.length} animal types`);
    res.json({ animalTypes });
  } catch (error) {
    console.error('Get animal types by species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all phases for a species (direct access)
router.get('/species/:speciesId/phases', async (req, res) => {
  try {
    const { speciesId } = req.params;
    
    const phases = await prisma.phase.findMany({
      where: { speciesId },
      include: {
        animalType: {
          include: {
            subspecies: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`GET /species/${speciesId}/phases - Found ${phases.length} phases`);
    res.json({ phases });
  } catch (error) {
    console.error('Get phases by species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const ingredientsRouter = require('./ingredients');
router.use('/ingredients', ingredientsRouter);

module.exports = router;