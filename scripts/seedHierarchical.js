const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedHierarchicalSpecies() {
  console.log('🌱 Seeding hierarchical species data...');
  
  try {
    // Create Species
    const poultry = await prisma.species.upsert({
      where: { name: 'Poultry' },
      update: {},
      create: {
        name: 'Poultry',
        description: 'Domesticated birds raised for meat, eggs, or feathers'
      }
    });

    const cattle = await prisma.species.upsert({
      where: { name: 'Cattle' },
      update: {},
      create: {
        name: 'Cattle',
        description: 'Large ruminant animals raised for meat, milk, or draft'
      }
    });

    const buffalo = await prisma.species.upsert({
      where: { name: 'Buffalo' },
      update: {},
      create: {
        name: 'Buffalo',
        description: 'Large ruminant animals similar to cattle'
      }
    });

    const sheep = await prisma.species.upsert({
      where: { name: 'Sheep' },
      update: {},
      create: {
        name: 'Sheep',
        description: 'Domesticated ruminant animals raised for wool, meat, and milk'
      }
    });

    const goat = await prisma.species.upsert({
      where: { name: 'Goat' },
      update: {},
      create: {
        name: 'Goat',
        description: 'Domesticated ruminant animals raised for meat, milk, and fiber'
      }
    });

    const swine = await prisma.species.upsert({
      where: { name: 'Swine' },
      update: {},
      create: {
        name: 'Swine',
        description: 'Domesticated pigs raised for meat'
      }
    });

    console.log('✅ Created species');

    // Create Subspecies for Poultry
    const chicken = await prisma.subspecies.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Chicken'
        }
      },
      update: {},
      create: {
        name: 'Chicken',
        description: 'Domestic fowl raised for meat and eggs',
        speciesId: poultry.id
      }
    });

    const quails = await prisma.subspecies.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Quails'
        }
      },
      update: {},
      create: {
        name: 'Quails',
        description: 'Small game birds raised for meat and eggs',
        speciesId: poultry.id
      }
    });

    // Create Animal Types for Chicken
    const broiler = await prisma.animalType.upsert({
      where: { 
        subspeciesId_name: {
          subspeciesId: chicken.id,
          name: 'Broilers'
        }
      },
      update: {},
      create: {
        name: 'Broilers',
        description: 'Chickens raised for meat production',
        subspeciesId: chicken.id
      }
    });

    const layer = await prisma.animalType.upsert({
      where: { 
        subspeciesId_name: {
          subspeciesId: chicken.id,
          name: 'Layers'
        }
      },
      update: {},
      create: {
        name: 'Layers',
        description: 'Chickens raised for egg production',
        subspeciesId: chicken.id
      }
    });

    // Create Phases for Broilers
    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: broiler.id,
          name: 'Starter'
        }
      },
      update: {},
      create: {
        name: 'Starter',
        description: 'Early growth phase (0-3 weeks)',
        minProtein: 22,
        maxProtein: 24,
        minEnergy: 3000,
        maxEnergy: 3200,
        animalTypeId: broiler.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: broiler.id,
          name: 'Grower'
        }
      },
      update: {},
      create: {
        name: 'Grower',
        description: 'Growth phase (3-6 weeks)',
        minProtein: 20,
        maxProtein: 22,
        minEnergy: 3100,
        maxEnergy: 3300,
        animalTypeId: broiler.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: broiler.id,
          name: 'Finisher'
        }
      },
      update: {},
      create: {
        name: 'Finisher',
        description: 'Final growth phase (6+ weeks)',
        minProtein: 18,
        maxProtein: 20,
        minEnergy: 3200,
        maxEnergy: 3400,
        animalTypeId: broiler.id
      }
    });

    // Create Phases for Layers
    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: layer.id,
          name: 'Chick'
        }
      },
      update: {},
      create: {
        name: 'Chick',
        description: 'Early growth phase (0-6 weeks)',
        minProtein: 20,
        maxProtein: 22,
        minEnergy: 2900,
        maxEnergy: 3100,
        animalTypeId: layer.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: layer.id,
          name: 'Grower'
        }
      },
      update: {},
      create: {
        name: 'Grower',
        description: 'Growth phase (6-18 weeks)',
        minProtein: 16,
        maxProtein: 18,
        minEnergy: 2800,
        maxEnergy: 3000,
        animalTypeId: layer.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: layer.id,
          name: 'Layer'
        }
      },
      update: {},
      create: {
        name: 'Layer',
        description: 'Egg production phase (18+ weeks)',
        minProtein: 16,
        maxProtein: 18,
        minEnergy: 2750,
        maxEnergy: 2950,
        animalTypeId: layer.id
      }
    });

    // Create Subspecies and Animal Types for Cattle
    const dairyCattle = await prisma.subspecies.upsert({
      where: { 
        speciesId_name: {
          speciesId: cattle.id,
          name: 'Dairy Cattle'
        }
      },
      update: {},
      create: {
        name: 'Dairy Cattle',
        description: 'Cattle bred for milk production',
        speciesId: cattle.id
      }
    });

    const dairyCattleType = await prisma.animalType.upsert({
      where: { 
        subspeciesId_name: {
          subspeciesId: dairyCattle.id,
          name: 'Dairy'
        }
      },
      update: {},
      create: {
        name: 'Dairy',
        description: 'Milk-producing cattle',
        subspeciesId: dairyCattle.id
      }
    });

    // Create Phases for Dairy Cattle
    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: dairyCattleType.id,
          name: 'Calf Starter'
        }
      },
      update: {},
      create: {
        name: 'Calf Starter',
        description: 'Young calf nutrition (0-3 months)',
        minProtein: 20,
        maxProtein: 22,
        minEnergy: 3000,
        maxEnergy: 3200,
        animalTypeId: dairyCattleType.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: dairyCattleType.id,
          name: 'High Yielding'
        }
      },
      update: {},
      create: {
        name: 'High Yielding',
        description: 'High milk production phase',
        minProtein: 16,
        maxProtein: 18,
        minEnergy: 2600,
        maxEnergy: 2800,
        animalTypeId: dairyCattleType.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        animalTypeId_name: {
          animalTypeId: dairyCattleType.id,
          name: 'Lactating'
        }
      },
      update: {},
      create: {
        name: 'Lactating',
        description: 'Active lactation phase',
        minProtein: 16,
        maxProtein: 18,
        minEnergy: 2600,
        maxEnergy: 2800,
        animalTypeId: dairyCattleType.id
      }
    });

    console.log('🎉 Successfully seeded hierarchical species data!');
    console.log('\n📝 Summary:');
    console.log('- Created 6 species (Poultry, Cattle, Buffalo, Sheep, Goat, Swine)');
    console.log('- Created subspecies (Chicken, Quails, Dairy Cattle)');
    console.log('- Created animal types (Broilers, Layers, Dairy)');
    console.log('- Created phases with nutritional requirements');
    console.log('\n🔗 You can now access the admin panel at /admin to manage species data');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting hierarchical species seeding...\n');
  
  try {
    await seedHierarchicalSpecies();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
