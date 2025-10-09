const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedIngredients() {
  console.log('🌱 Seeding ingredients...');
  
  const sampleIngredients = [
    // Energy sources
    { name: 'Corn', category: 'Energy Sources', crudeProtein: 8.5, energy: 3350, cost: 0.25, maxInclusion: 70 },
    { name: 'Wheat', category: 'Energy Sources', crudeProtein: 12.0, energy: 3300, cost: 0.28, maxInclusion: 60 },
    { name: 'Rice Bran', category: 'Energy Sources', crudeProtein: 13.0, energy: 3000, cost: 0.22, maxInclusion: 25 },
    { name: 'Barley', category: 'Energy Sources', crudeProtein: 11.5, energy: 3100, cost: 0.26, maxInclusion: 40 },
    
    // Protein sources
    { name: 'Soybean Meal', category: 'Protein Sources', crudeProtein: 48.0, energy: 2450, cost: 0.45, maxInclusion: 30 },
    { name: 'Fish Meal', category: 'Protein Sources', crudeProtein: 65.0, energy: 2900, cost: 1.20, maxInclusion: 10 },
    { name: 'Sunflower Meal', category: 'Protein Sources', crudeProtein: 32.0, energy: 2100, cost: 0.35, maxInclusion: 20 },
    { name: 'Cottonseed Meal', category: 'Protein Sources', crudeProtein: 42.0, energy: 2200, cost: 0.38, maxInclusion: 15 },
    { name: 'Canola Meal', category: 'Protein Sources', crudeProtein: 38.0, energy: 2400, cost: 0.42, maxInclusion: 25 },
    
    // Minerals
    { name: 'Calcium Carbonate', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.15, maxInclusion: 3 },
    { name: 'Dicalcium Phosphate', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.85, maxInclusion: 2 },
    { name: 'Salt', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.10, maxInclusion: 0.5 },
    { name: 'Limestone', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 0.12, maxInclusion: 5 },
    
    // Vitamins and Additives
    { name: 'Vitamin Premix', category: 'Vitamins', crudeProtein: 0, energy: 0, cost: 2.50, maxInclusion: 1 },
    { name: 'Mineral Premix', category: 'Minerals', crudeProtein: 0, energy: 0, cost: 1.80, maxInclusion: 1 },
    { name: 'Lysine', category: 'Amino Acids', crudeProtein: 78.5, energy: 0, cost: 3.50, maxInclusion: 0.5 },
    { name: 'Methionine', category: 'Amino Acids', crudeProtein: 99.0, energy: 0, cost: 4.20, maxInclusion: 0.3 }
  ];

  let createdCount = 0;
  for (const ingredient of sampleIngredients) {
    try {
      await prisma.ingredient.create({
        data: ingredient
      });
      createdCount++;
      console.log(`✅ Created ingredient: ${ingredient.name}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Ingredient already exists: ${ingredient.name}`);
      } else {
        console.error(`❌ Error creating ingredient ${ingredient.name}:`, error.message);
      }
    }
  }

  console.log(`🎉 Successfully seeded ${createdCount} new ingredients`);
}

async function seedSpeciesConfigs() {
  console.log('🌱 Seeding species configurations...');
  
  const sampleConfigs = [
    // Poultry configurations
    { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'starter', minProtein: 22, maxProtein: 24, minEnergy: 3000, maxEnergy: 3200 },
    { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'grower', minProtein: 20, maxProtein: 22, minEnergy: 3100, maxEnergy: 3300 },
    { species: 'poultry', subspecies: 'chicken', animalType: 'broiler', phase: 'finisher', minProtein: 18, maxProtein: 20, minEnergy: 3200, maxEnergy: 3400 },
    
    { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'chick', minProtein: 20, maxProtein: 22, minEnergy: 2900, maxEnergy: 3100 },
    { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'grower', minProtein: 16, maxProtein: 18, minEnergy: 2800, maxEnergy: 3000 },
    { species: 'poultry', subspecies: 'chicken', animalType: 'layer', phase: 'layer', minProtein: 16, maxProtein: 18, minEnergy: 2750, maxEnergy: 2950 },
    
    { species: 'poultry', subspecies: 'quails', animalType: 'broiler', phase: 'starter', minProtein: 24, maxProtein: 26, minEnergy: 3100, maxEnergy: 3300 },
    { species: 'poultry', subspecies: 'quails', animalType: 'broiler', phase: 'finisher', minProtein: 20, maxProtein: 22, minEnergy: 3200, maxEnergy: 3400 },
    
    // Cattle configurations
    { species: 'cattle', subspecies: null, animalType: null, phase: 'calf_starter', minProtein: 20, maxProtein: 22, minEnergy: 3000, maxEnergy: 3200 },
    { species: 'cattle', subspecies: null, animalType: null, phase: 'type1_high_yielding', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
    { species: 'cattle', subspecies: null, animalType: null, phase: 'type2_medium_yielding', minProtein: 14, maxProtein: 16, minEnergy: 2500, maxEnergy: 2700 },
    { species: 'cattle', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
    { species: 'cattle', subspecies: null, animalType: null, phase: 'gestating', minProtein: 12, maxProtein: 14, minEnergy: 2400, maxEnergy: 2600 },
    
    // Buffalo configurations
    { species: 'buffalo', subspecies: null, animalType: null, phase: 'calf_starter', minProtein: 20, maxProtein: 22, minEnergy: 3000, maxEnergy: 3200 },
    { species: 'buffalo', subspecies: null, animalType: null, phase: 'calf_growth', minProtein: 18, maxProtein: 20, minEnergy: 2800, maxEnergy: 3000 },
    { species: 'buffalo', subspecies: null, animalType: null, phase: 'type1_high_yielding', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
    { species: 'buffalo', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2600, maxEnergy: 2800 },
    
    // Sheep configurations
    { species: 'sheep', subspecies: null, animalType: null, phase: 'growing_lambs', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
    { species: 'sheep', subspecies: null, animalType: null, phase: 'pregnant', minProtein: 14, maxProtein: 16, minEnergy: 2500, maxEnergy: 2700 },
    { species: 'sheep', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
    { species: 'sheep', subspecies: null, animalType: null, phase: 'breeding_male', minProtein: 12, maxProtein: 14, minEnergy: 2400, maxEnergy: 2600 },
    
    // Goat configurations
    { species: 'goat', subspecies: null, animalType: null, phase: 'growing_lambs', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
    { species: 'goat', subspecies: null, animalType: null, phase: 'pregnant', minProtein: 14, maxProtein: 16, minEnergy: 2500, maxEnergy: 2700 },
    { species: 'goat', subspecies: null, animalType: null, phase: 'lactating', minProtein: 16, maxProtein: 18, minEnergy: 2700, maxEnergy: 2900 },
    { species: 'goat', subspecies: null, animalType: null, phase: 'breeding_male', minProtein: 12, maxProtein: 14, minEnergy: 2400, maxEnergy: 2600 },
    
    // Swine configurations
    { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'starter_creep', minProtein: 20, maxProtein: 22, minEnergy: 3400, maxEnergy: 3600 },
    { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'growers_feed', minProtein: 16, maxProtein: 18, minEnergy: 3200, maxEnergy: 3400 },
    { species: 'swine', subspecies: null, animalType: 'marketing_pigs', phase: 'finishing_feed', minProtein: 14, maxProtein: 16, minEnergy: 3200, maxEnergy: 3400 },
    { species: 'swine', subspecies: null, animalType: 'no_marketing_pigs', phase: 'gestating_pigs', minProtein: 12, maxProtein: 14, minEnergy: 3000, maxEnergy: 3200 },
    { species: 'swine', subspecies: null, animalType: 'no_marketing_pigs', phase: 'nursing_sow', minProtein: 16, maxProtein: 18, minEnergy: 3300, maxEnergy: 3500 }
  ];

  let createdCount = 0;
  for (const config of sampleConfigs) {
    try {
      await prisma.speciesConfig.create({
        data: config
      });
      createdCount++;
      console.log(`✅ Created config: ${config.species} - ${config.phase}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Config already exists: ${config.species} - ${config.phase}`);
      } else {
        console.error(`❌ Error creating config ${config.species} - ${config.phase}:`, error.message);
      }
    }
  }

  console.log(`🎉 Successfully seeded ${createdCount} new species configurations`);
}

async function seedSampleUser() {
  console.log('🌱 Seeding sample user...');
  
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  try {
    await prisma.user.create({
      data: {
        email: 'admin@ajsuppliments.com',
        password: hashedPassword,
        name: 'Admin User'
      }
    });
    console.log('✅ Created sample user: admin@ajsuppliments.com (password: password123)');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⏭️  Sample user already exists');
    } else {
      console.error('❌ Error creating sample user:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    await seedIngredients();
    console.log('');
    await seedSpeciesConfigs();
    console.log('');
    await seedSampleUser();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Sample ingredients added');
    console.log('- Species configurations added');
    console.log('- Sample user created: admin@ajsuppliments.com / password123');
    console.log('\n🔗 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
