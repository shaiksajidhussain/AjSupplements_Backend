/**
 * Seed Script: Realistic Feed Ingredients with Industry-Standard Nutritional Values
 * 
 * This script adds comprehensive ingredient data with accurate nutritional values
 * commonly used in animal feed formulation.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRealIngredients() {
  console.log('🌾 Starting to seed realistic feed ingredients...\n');

  try {
    // ========================================================================
    // ENERGY SOURCES (Low Protein Sources - LPS)
    // ========================================================================
    console.log('📊 Seeding Energy Sources (LPS)...');

    const energySources = [
      {
        name: 'Maize (Corn)',
        category: 'Energy Source',
        crudeProtein: 8.5,
        energy: 3300,          // ME kcal/kg
        calcium: 0.01,
        phosphorus: 0.13,      // Available phosphorus
        lysine: 0.20,
        methionine: 0.20,
        fiber: 2.2,
        cost: 20
      },
      {
        name: 'Wheat',
        category: 'Energy Source',
        crudeProtein: 12.0,
        energy: 3200,
        calcium: 0.05,
        phosphorus: 0.36,
        // availablePhosphorus: 0.12,
        lysine: 0.35,
        methionine: 0.18,
        fiber: 2.8,
        cost: 22
      },
      {
        name: 'Barley',
        category: 'Energy Source',
        crudeProtein: 11.5,
        energy: 2900,
        calcium: 0.05,
        phosphorus: 0.34,
        // availablePhosphorus: 0.14,
        lysine: 0.38,
        methionine: 0.16,
        fiber: 5.0,
        cost: 18
      },
      {
        name: 'Jowar (Sorghum)',
        category: 'Energy Source',
        crudeProtein: 10.0,
        energy: 2650,
        calcium: 0.18,
        phosphorus: 0.32,
        // availablePhosphorus: 0.32,
        lysine: 0.32,
        methionine: 0.28,
        fiber: 2.5,
        cost: 18
      },
      {
        name: 'Bajra (Pearl Millet)',
        category: 'Energy Source',
        crudeProtein: 11.0,
        energy: 3100,
        calcium: 0.04,  
        phosphorus: 0.35,
        // availablePhosphorus: 0.11,
        lysine: 0.28,
        methionine: 0.19,
        fiber: 1.8,
        cost: 19
      },
      {
        name: 'Broken Rice',
        category: 'Energy Source',
        crudeProtein: 7.5,
        energy: 3300,
        calcium: 0.01,
        phosphorus: 0.10,
        // availablePhosphorus: 0.03,
        lysine: 0.28,
        methionine: 0.15,
        fiber: 0.8,
        cost: 21
      },
      {
        name: 'Rice Polish',
        category: 'Energy Source',
        crudeProtein: 11.0,
        energy: 2750,
        calcium: 0.06,
        phosphorus: 1.50,
        // availablePhosphorus: 0.18,
        lysine: 0.50,
        methionine: 0.21,
        fiber: 8.0,
        cost: 22
      },
      {
        name: 'Tapioca (Cassava)',
        category: 'Energy Source',
        crudeProtein: 2.0,
        energy: 3400,
        calcium: 0.02,
        phosphorus: 0.08,
        // availablePhosphorus: 0.02,
        lysine: 0.05,
        methionine: 0.03,
        fiber: 2.0,
        cost: 16
      }
    ];

    for (const ingredient of energySources) {
      await prisma.ingredient.upsert({
        where: { name: ingredient.name },
        update: ingredient,
        create: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // PROTEIN SOURCES (High Protein Sources - HPS)
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
        // availablePhosphorus: 0.37,
        lysine: 0.87,
        methionine: 0.72,
        fiber: 7.0,
        cost: 45
      },
      {
        name: 'Soybean Meal (48% CP)',
        category: 'Protein Source',
        crudeProtein: 48.0,
        energy: 2380,
        calcium: 0.29,
        phosphorus: 0.68,
        // availablePhosphorus: 0.27,
        lysine: 3.00,
        methionine: 0.68,
        fiber: 3.5,
        cost: 48
      },
      {
        name: 'Groundnut Cake (Peanut Meal)',
        category: 'Protein Source',
        crudeProtein: 45.0,
        energy: 2150,
        calcium: 0.15,
        phosphorus: 0.60,
        // availablePhosphorus: 0.18,
        lysine: 1.60,
        methionine: 0.50,
        fiber: 11.0,
        cost: 40
      },
      {
        name: 'Cottonseed Cake',
        category: 'Protein Source',
        crudeProtein: 40.0,
        energy: 2100,
        calcium: 0.18,
        phosphorus: 1.10,
        // availablePhosphorus: 0.33,
        lysine: 1.70,
        methionine: 0.60,
        fiber: 12.0,
        cost: 35
      },
      {
        name: 'Sunflower Meal',
        category: 'Protein Source',
        crudeProtein: 38.0,
        energy: 2100,
        calcium: 0.35,
        phosphorus: 0.95,
        // availablePhosphorus: 0.29,
        lysine: 1.35,
        methionine: 0.75,
        fiber: 13.0,
        cost: 32
      },
      {
        name: 'Rapeseed Meal (Canola)',
        category: 'Protein Source',
        crudeProtein: 38.0,
        energy: 2000,
        calcium: 0.68,
        phosphorus: 1.10,
        // availablePhosphorus: 0.33,
        lysine: 2.00,
        methionine: 0.75,
        fiber: 12.0,
        cost: 38
      },
      {
        name: 'Fish Meal',
        category: 'Protein Source',
        crudeProtein: 60.0,
        energy: 2800,
        calcium: 5.50,
        phosphorus: 3.00,
        // availablePhosphorus: 2.40,
        lysine: 4.80,
        methionine: 1.80,
        fiber: 1.0,
        cost: 80
      },
      {
        name: 'Meat and Bone Meal',
        category: 'Protein Source',
        crudeProtein: 50.0,
        energy: 2300,
        calcium: 10.0,
        phosphorus: 5.00,
        // availablePhosphorus: 4.00,
        lysine: 2.50,
        methionine: 0.70,
        fiber: 2.5,
        cost: 55
      },
      {
        name: 'Blood Meal',
        category: 'Protein Source',
        crudeProtein: 80.0,
        energy: 2700,
        calcium: 0.30,
        phosphorus: 0.35,
        // availablePhosphorus: 0.11,
        lysine: 7.00,
        methionine: 1.00,
        fiber: 1.0,
        cost: 90
      }
    ];

    for (const ingredient of proteinSources) {
      await prisma.ingredient.upsert({
        where: { name: ingredient.name },
        update: ingredient,
        create: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // MEDIUM SOURCES (Balanced CP - Between Energy & Protein)
    // ========================================================================
    console.log('\n⚖️  Seeding Medium Sources (Balanced)...');

    const mediumSources = [
      {
        name: 'Rice Bran',
        category: 'Medium Source',
        crudeProtein: 13.0,
        energy: 2750,
        calcium: 0.06,
        phosphorus: 1.50,
        // availablePhosphorus: 0.18,
        lysine: 0.55,
        methionine: 0.21,
        fiber: 11.0,
        cost: 22
      },
      {
        name: 'Wheat Bran',
        category: 'Medium Source',
        crudeProtein: 15.5,
        energy: 2050,
        calcium: 0.13,
        phosphorus: 1.18,
        // availablePhosphorus: 0.12,
        lysine: 0.65,
        methionine: 0.19,
        fiber: 10.0,
        cost: 18
      },
      {
        name: 'De-Oiled Rice Bran (DORB)',
        category: 'Medium Source',
        crudeProtein: 16.0,
        energy: 2400,
        calcium: 0.08,
        phosphorus: 1.80,
        // availablePhosphorus: 0.22,
        lysine: 0.70,
        methionine: 0.25,
        fiber: 12.0,
        cost: 20
      },
      {
        name: 'Maize Gluten Meal',
        category: 'Medium Source',
        crudeProtein: 60.0,
        energy: 3800,
        calcium: 0.05,
        phosphorus: 0.50,
        // availablePhosphorus: 0.15,
        lysine: 1.00,
        methionine: 1.80,
        fiber: 2.0,
        cost: 55
      },
      {
        name: 'Copra Cake (Coconut Cake)',
        category: 'Medium Source',
        crudeProtein: 21.0,
        energy: 2000,
        calcium: 0.20,
        phosphorus: 0.60,
        // availablePhosphorus: 0.18,
        lysine: 0.70,
        methionine: 0.35,
        fiber: 14.0,
        cost: 25
      }
    ];

    for (const ingredient of mediumSources) {
      await prisma.ingredient.upsert({
        where: { name: ingredient.name },
        update: ingredient,
        create: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // FAT SOURCES (For Energy Supplementation)
    // ========================================================================
    console.log('\n🧈 Seeding Fat Sources...');

    const fatSources = [
      {
        name: 'Soybean Oil',
        category: 'Energy Source',
        crudeProtein: 0.0,
        energy: 8800,
        calcium: 0.0,
        phosphorus: 0.0,
        // availablePhosphorus: 0.0,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 120
      },
      {
        name: 'Palm Oil',
        category: 'Energy Source',
        crudeProtein: 0.0,
        energy: 7200,
        calcium: 0.0,
        phosphorus: 0.0,
        // availablePhosphorus: 0.0,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 100
      },
      {
        name: 'Animal Fat (Tallow)',
        category: 'Energy Source',
        crudeProtein: 0.0,
        energy: 7500,
        calcium: 0.0,
        phosphorus: 0.0,
        // availablePhosphorus: 0.0,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 95
      }
    ];

    for (const ingredient of fatSources) {
      await prisma.ingredient.upsert({
        where: { name: ingredient.name },
        update: ingredient,
        create: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // MINERAL SOURCES
    // ========================================================================
    console.log('\n💎 Seeding Mineral Sources...');

    const mineralSources = [
      {
        name: 'Dicalcium Phosphate (DCP)',
        category: 'Mineral Source',
        crudeProtein: 0.0,
        energy: 0,
        calcium: 21.0,
        phosphorus: 18.5,
        // availablePhosphorus: 18.5,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 60
      },
      {
        name: 'Limestone (Calcium Carbonate)',
        category: 'Mineral Source',
        crudeProtein: 0.0,
        energy: 0,
        calcium: 38.0,
        phosphorus: 0.0,
        // availablePhosphorus: 0.0,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 8
      },
      {
        name: 'Rock Phosphate',
        category: 'Mineral Source',
        crudeProtein: 0.0,
        energy: 0,
        calcium: 30.0,
        phosphorus: 14.0,
        // availablePhosphorus: 0.5,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 25
      },
      {
        name: 'Salt (Sodium Chloride)',
        category: 'Mineral Source',
        crudeProtein: 0.0,
        energy: 0,
        calcium: 0.0,
        phosphorus: 0.0,
        // availablePhosphorus: 0.0,
        lysine: 0.0,
        methionine: 0.0,
        fiber: 0.0,
        cost: 5
      }
    ];

    for (const ingredient of mineralSources) {
      await prisma.ingredient.upsert({
        where: { name: ingredient.name },
        update: ingredient,
        create: ingredient
      });
      console.log(`   ✅ ${ingredient.name}`);
    }

    // ========================================================================
    // Summary
    // ========================================================================
    const totalCount = await prisma.ingredient.count();

    console.log('\n' + '='.repeat(80));
    console.log('✅ INGREDIENT SEEDING COMPLETED!');
    console.log('='.repeat(80));
    console.log(`\n📊 Total ingredients in database: ${totalCount}`);
    console.log('\n📋 Categories:');
    console.log(`   🌾 Energy Sources: ${energySources.length + fatSources.length}`);
    console.log(`   🥩 Protein Sources: ${proteinSources.length}`);
    console.log(`   ⚖️  Medium Sources: ${mediumSources.length}`);
    console.log(`   💎 Mineral Sources: ${mineralSources.length}`);
    console.log('\n✨ All ingredients have realistic, industry-standard nutritional values!');
    console.log('🎯 You can now test the feed formulation system with proper data!\n');

  } catch (error) {
    console.error('❌ Error seeding ingredients:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedRealIngredients()
  .catch(console.error);

