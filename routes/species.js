const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// No more mock data - everything uses database

// Get species configurations
router.get('/configs', async (req, res) => {
  try {
    const { species, subspecies, animalType, phase } = req.query;
    
    const where = {};
    
    if (species) where.species = species;
    if (subspecies) where.subspecies = subspecies;
    if (animalType) where.animalType = animalType;
    if (phase) where.phase = phase;

    const configs = await prisma.speciesConfig.findMany({
      where,
      orderBy: [
        { species: 'asc' },
        { subspecies: 'asc' },
        { animalType: 'asc' },
        { phase: 'asc' }
      ]
    });

    res.json({ configs });
  } catch (error) {
    console.error('Get species configs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hierarchical species data for frontend forms
router.get('/hierarchy', async (req, res) => {
  try {
    // Get complete hierarchy from database
    const species = await prisma.species.findMany({
      include: {
        subspecies: {
          include: {
            animalTypes: {
              include: {
                phases: true
              }
            }
          }
        },
        animalTypes: {
          where: {
            subspeciesId: null  // Only get animal types directly under species
          },
          include: {
            phases: true
          }
        },
        phases: {
          where: {
            animalTypeId: null  // Only get phases directly under species
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data for frontend consumption
    const hierarchyData = species.map(species => ({
      id: species.id,
      name: species.name,
      description: species.description,
      notIncluded: species.notIncluded,
      includeSubspecies: species.includeSubspecies,
      includeAnimalTypes: species.includeAnimalTypes,
      includePhases: species.includePhases,
      subspecies: species.subspecies.map(subspecies => ({
        id: subspecies.id,
        name: subspecies.name,
        description: subspecies.description,
        animalTypes: subspecies.animalTypes.map(animalType => ({
          id: animalType.id,
          name: animalType.name,
          description: animalType.description,
          speciesId: animalType.speciesId,
          phases: animalType.phases.map(phase => ({
            id: phase.id,
            name: phase.name,
            description: phase.description,
            speciesId: phase.speciesId,
            animalTypeId: animalType.id,
            crudeProtein: phase.crudeProtein,
            meKcalPerKg: phase.meKcalPerKg,
            calcium: phase.calcium,
            availablePhosphorus: phase.availablePhosphorus,
            lysine: phase.lysine,
            methionine: phase.methionine
          }))
        }))
      })),
      // Add direct animal types (without subspecies)
      directAnimalTypes: species.animalTypes.map(animalType => ({
        id: animalType.id,
        name: animalType.name,
        description: animalType.description,
        speciesId: animalType.speciesId,
        phases: animalType.phases.map(phase => ({
          id: phase.id,
          name: phase.name,
          description: phase.description,
          speciesId: phase.speciesId,
          animalTypeId: animalType.id,
          crudeProtein: phase.crudeProtein,
          meKcalPerKg: phase.meKcalPerKg,
          calcium: phase.calcium,
          availablePhosphorus: phase.availablePhosphorus,
          lysine: phase.lysine,
          methionine: phase.methionine
        }))
      })),
      // Add direct phases (without animal types)
      directPhases: species.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        speciesId: phase.speciesId,
        crudeProtein: phase.crudeProtein,
        meKcalPerKg: phase.meKcalPerKg,
        calcium: phase.calcium,
        availablePhosphorus: phase.availablePhosphorus,
        lysine: phase.lysine,
        methionine: phase.methionine
      }))
    }));

    res.json({ hierarchy: hierarchyData });
  } catch (error) {
    console.error('Get species hierarchy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get species options - using database data
router.get('/options', async (req, res) => {
  try {
    // Get species from database
    const species = await prisma.species.findMany({
      include: {
        subspecies: true
      },
      orderBy: { name: 'asc' }
    });

    // Convert to options format
    const speciesOptions = species.map(species => ({
      id: species.id,
      value: species.name.toLowerCase(),
      label: species.name
    }));

    // Convert subspecies to options format
    const subspeciesOptions = {};
    species.forEach(species => {
      const key = species.name.toLowerCase();
      subspeciesOptions[key] = species.subspecies.map(subspecies => ({
        id: subspecies.id,
        value: subspecies.name.toLowerCase().replace(/\s+/g, '_'),
        label: subspecies.name
      }));
    });

    console.log('GET /api/species/options - Returning species:', speciesOptions.length);
    console.log('GET /api/species/options - Returning subspecies keys:', Object.keys(subspeciesOptions));

    res.json({
      speciesOptions,
      subspeciesOptions
    });
  } catch (error) {
    console.error('Get species options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update species configuration
router.post('/configs', async (req, res) => {
  try {
    const {
      species,
      subspecies,
      animalType,
      phase,
      minProtein,
      maxProtein,
      minEnergy,
      maxEnergy
    } = req.body;

    // Validation
    if (!species || !phase) {
      return res.status(400).json({ 
        error: 'Species and phase are required' 
      });
    }

    const config = await prisma.speciesConfig.upsert({
      where: {
        species_subspecies_animalType_phase: {
          species,
          subspecies: subspecies || '',
          animalType: animalType || '',
          phase
        }
      },
      update: {
        minProtein: minProtein ? parseFloat(minProtein) : null,
        maxProtein: maxProtein ? parseFloat(maxProtein) : null,
        minEnergy: minEnergy ? parseFloat(minEnergy) : null,
        maxEnergy: maxEnergy ? parseFloat(maxEnergy) : null
      },
      create: {
        species,
        subspecies: subspecies || null,
        animalType: animalType || null,
        phase,
        minProtein: minProtein ? parseFloat(minProtein) : null,
        maxProtein: maxProtein ? parseFloat(maxProtein) : null,
        minEnergy: minEnergy ? parseFloat(minEnergy) : null,
        maxEnergy: maxEnergy ? parseFloat(maxEnergy) : null
      }
    });

    res.status(201).json({
      message: 'Species configuration saved successfully',
      config
    });
  } catch (error) {
    console.error('Create/update species config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed species configurations with sample data
router.post('/seed-configs', async (req, res) => {
  try {
    const sampleConfigs = [
      // Poultry configurations
      { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'starter', minProtein: 22, maxProtein: 24, minEnergy: 3000, maxEnergy: 3200 },
      { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'grower', minProtein: 20, maxProtein: 22, minEnergy: 3100, maxEnergy: 3300 },
      { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'finisher', minProtein: 18, maxProtein: 20, minEnergy: 3200, maxEnergy: 3400 },
      
      { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'chick', minProtein: 20, maxProtein: 22, minEnergy: 2900, maxEnergy: 3100 },
      { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'grower', minProtein: 16, maxProtein: 18, minEnergy: 2800, maxEnergy: 3000 },
      { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'layer', minProtein: 16, maxProtein: 18, minEnergy: 2750, maxEnergy: 2950 },
      
      // Cattle configurations
      { species: 'cattle', subspecies: null, animalType: null, phase: 'calf_starter', minProtein: 20, maxProtein: 22, minEnergy: 3000, maxEnergy: 3200 },
      { species: 'cattle', subspecies: null, animalType: null, phase: 'type1_high_yielding', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
      { species: 'cattle', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
      
      // Buffalo configurations
      { species: 'buffalo', subspecies: null, animalType: null, phase: 'calf_starter', minProtein: 20, maxProtein: 22, minEnergy: 3000, maxEnergy: 3200 },
      { species: 'buffalo', subspecies: null, animalType: null, phase: 'type1_high_yielding', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
      { species: 'buffalo', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
      
      // Sheep configurations
      { species: 'sheep', subspecies: null, animalType: null, phase: 'growing_lambs', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
      { species: 'sheep', subspecies: null, animalType: null, phase: 'pregnant', minProtein: 14, maxProtein: 16, minEnergy: 2500, maxEnergy: 2700 },
      { species: 'sheep', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
      
      // Goat configurations
      { species: 'goat', subspecies: null, animalType: null, phase: 'growing_lambs', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
      { species: 'goat', subspecies: null, animalType: null, phase: 'pregnant', minProtein: 14, maxProtein: 16, minEnergy: 2500, maxEnergy: 2700 },
      { species: 'goat', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
      
      // Swine configurations
      { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'starter_creep', minProtein: 20, maxProtein: 22, minEnergy: 3400, maxEnergy: 3600 },
      { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'growers_feed', minProtein: 16, maxProtein: 18, minEnergy: 3200, maxEnergy: 3400 },
      { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'finishing_feed', minProtein: 14, maxProtein: 16, minEnergy: 3200, maxEnergy: 3400 }
    ];

    // Clear existing configs (optional)
    // await prisma.speciesConfig.deleteMany({});

    // Create configs
    const createdConfigs = [];
    for (const config of sampleConfigs) {
      try {
        const created = await prisma.speciesConfig.create({
          data: config
        });
        createdConfigs.push(created);
      } catch (error) {
        // Skip if config already exists
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }

    res.status(201).json({
      message: `Successfully seeded ${createdConfigs.length} species configurations`,
      configs: createdConfigs
    });
  } catch (error) {
    console.error('Seed species configs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
