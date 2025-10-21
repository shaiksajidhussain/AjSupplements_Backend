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
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Broilers'
        }
      },
      update: {},
      create: {
        name: 'Broilers',
        description: 'Chickens raised for meat production',
        subspeciesId: chicken.id,
        speciesId: poultry.id
      }
    });

    const layer = await prisma.animalType.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Layers'
        }
      },
      update: {},
      create: {
        name: 'Layers',
        description: 'Chickens raised for egg production',
        subspeciesId: chicken.id,
        speciesId: poultry.id
      }
    });

    // Create Phases for Broilers
    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Starter'
        }
      },
      update: {},
      create: {
        name: 'Starter',
        description: 'Early growth phase (0-3 weeks)',
        crudeProtein: 23,
        meKcalPerKg: 3100,
        calcium: 1.0,
        availablePhosphorus: 0.46,
        lysine: 1.2,
        methionine: 0.5,
        animalTypeId: broiler.id,
        speciesId: poultry.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Grower'
        }
      },
      update: {},
      create: {
        name: 'Grower',
        description: 'Growth phase (3-6 weeks)',
        crudeProtein: 21,
        meKcalPerKg: 3200,
        calcium: 1.0,
        availablePhosphorus: 0.46,
        lysine: 1.2,
        methionine: 0.5,
        animalTypeId: broiler.id,
        speciesId: poultry.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Finisher'
        }
      },
      update: {},
      create: {
        name: 'Finisher',
        description: 'Final growth phase (6+ weeks)',
        crudeProtein: 19,
        meKcalPerKg: 3300,
        calcium: 1.0,
        availablePhosphorus: 0.46,
        lysine: 1.2,
        methionine: 0.5,
        animalTypeId: broiler.id,
        speciesId: poultry.id
      }
    });

    // Create Phases for Layers
    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Layer Chick'
        }
      },
      update: {},
      create: {
        name: 'Layer Chick',
        description: 'Early growth phase (0-6 weeks)',
        crudeProtein: 21,
        meKcalPerKg: 3000,
        calcium: 1.0,
        availablePhosphorus: 0.46,
        lysine: 1.2,
        methionine: 0.5,
        animalTypeId: layer.id,
        speciesId: poultry.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Layer Grower'
        }
      },
      update: {},
      create: {
        name: 'Layer Grower',
        description: 'Growth phase (6-18 weeks)',
        crudeProtein: 16,        // Slightly lower for growing phase
        meKcalPerKg: 2700,       // Moderate energy for growth
        calcium: 1.2,            // Moderate calcium for growing birds
        availablePhosphorus: 0.45, // Standard phosphorus
        lysine: 0.8,             // Adequate lysine for growth
        methionine: 0.4,         // Standard methionine
        animalTypeId: layer.id,
        speciesId: poultry.id
      }
    });

    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: poultry.id,
          name: 'Layer Production'
        }
      },
      update: {},
      create: {
        name: 'Layer Production',
        description: 'Egg production phase (18+ weeks)',
        crudeProtein: 18,        // Updated from your specification
        meKcalPerKg: 2600,       // Updated from your specification
        calcium: 3.0,            // Updated from your specification
        availablePhosphorus: 0.4, // Updated from your specification
        lysine: 0.7,             // Updated from your specification
        methionine: 0.35,        // Updated from your specification
        animalTypeId: layer.id,
        speciesId: poultry.id
      }
    });

    // For now, just create basic cattle phases without subspecies
    await prisma.phase.upsert({
      where: { 
        speciesId_name: {
          speciesId: cattle.id,
          name: 'Calf Starter'
        }
      },
      update: {},
      create: {
        name: 'Calf Starter',
        description: 'Young calf nutrition (0-3 months)',
        crudeProtein: 21,
        meKcalPerKg: 3100,
        calcium: 1.0,
        availablePhosphorus: 0.46,
        lysine: 1.2,
        methionine: 0.5,
        speciesId: cattle.id
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
