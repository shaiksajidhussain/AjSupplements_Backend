/**
 * Seed Script: Minimal Feed Ingredients - Only Required Ingredients
 * 
 * This script adds only the ingredients needed for the feed formulation:
 * - Rice Polish (Medium Source)
 * - Maize (Energy Source)
 * - Jowar (Energy Source)
 * - Soybean Meal (Protein Source)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMinimalIngredients() {
  console.log('🌾 Starting to seed minimal feed ingredients...\n');

  try {
    // Clear existing ingredients
    await prisma.ingredient.deleteMany({});
    console.log('🗑️  Cleared existing ingredients');

    // ========================================================================
    // MEDIUM SOURCES (Rice Polish)
    // ========================================================================
    console.log('📊 Seeding Medium Sources...');

    const mediumSources = [
      {
        name: 'Rice Polish',
        category: 'Medium Source',
        crudeProtein: 11.0,
        energy: 2750,
        calcium: 0.06,
        phosphorus: 0.18,
        lysine: 0.50,
        methionine: 0.21,
        fiber: 8.0,
        cost: 22
      }
    ];

    for (const ingredient of mediumSources) {
      await prisma.ingredient.create({
        data: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // ENERGY SOURCES (LPS - Low Protein Sources)
    // ========================================================================
    console.log('\n📊 Seeding Energy Sources (LPS)...');

    const energySources = [
      {
        name: 'Maize (Corn)',
        category: 'Energy Source',
        crudeProtein: 8.5,
        energy: 3300,
        calcium: 0.01,
        phosphorus: 0.13,
        lysine: 0.20,
        methionine: 0.20,
        fiber: 2.2,
        cost: 20
      },
      {
        name: 'Jowar (Sorghum)',
        category: 'Energy Source',
        crudeProtein: 10.0,
        energy: 2650,
        calcium: 0.18,
        phosphorus: 0.32,
        lysine: 0.32,
        methionine: 0.28,
        fiber: 2.5,
        cost: 18
      }
    ];

    for (const ingredient of energySources) {
      await prisma.ingredient.create({
        data: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // PROTEIN SOURCES (HPS - High Protein Sources)
    // ========================================================================
    console.log('\n🥩 Seeding Protein Sources (HPS)...');

    const proteinSources = [
      {
        name: 'Soybean Meal (44% CP)',
        category: 'Protein Source',
        crudeProtein: 44.0,
        energy: 2600,
        calcium: 0.20,
        phosphorus: 0.37,
        lysine: 0.87,
        methionine: 0.72,
        fiber: 7.0,
        cost: 45
      }
    ];

    for (const ingredient of proteinSources) {
      await prisma.ingredient.create({
        data: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    console.log('\n================================================================================');
    console.log('✅ MINIMAL INGREDIENT SEEDING COMPLETED!');
    console.log('================================================================================');
    console.log('\n📊 Total ingredients in database: 4');
    console.log('\n📋 Categories:');
    console.log('   🌾 Medium Sources: 1 (Rice Polish)');
    console.log('   🔋 Energy Sources: 2 (Maize, Jowar)');
    console.log('   🥩 Protein Sources: 1 (Soybean Meal)');
    console.log('\n✨ Only the required ingredients for feed formulation!');
    console.log('🎯 Perfect for testing with your handwritten calculations!');

  } catch (error) {
    console.error('❌ Error seeding ingredients:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedMinimalIngredients()
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
