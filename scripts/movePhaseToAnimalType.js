const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function movePhaseToAnimalType() {
  try {
    console.log('Starting phase migration...');
    
    // Find the Cattle species
    const cattleSpecies = await prisma.species.findFirst({
      where: { name: 'Cattle' }
    });
    
    if (!cattleSpecies) {
      throw new Error('Cattle species not found');
    }
    
    console.log('Found Cattle species:', cattleSpecies.id);
    
    // Find the animal type for Cattle
    const animalType = await prisma.animalType.findFirst({
      where: { 
        speciesId: cattleSpecies.id,
        name: 'test animal type'
      }
    });
    
    if (!animalType) {
      throw new Error('Animal type "test animal type" not found for Cattle');
    }
    
    console.log('Found animal type:', animalType.id);
    
    // Find the phase that needs to be moved
    const phase = await prisma.phase.findFirst({
      where: { 
        speciesId: cattleSpecies.id,
        name: 'sd',
        animalTypeId: null // Only phases not already assigned to animal type
      }
    });
    
    if (!phase) {
      throw new Error('Phase "sd" not found or already assigned to animal type');
    }
    
    console.log('Found phase to move:', phase.id);
    
    // Update the phase to assign it to the animal type
    const updatedPhase = await prisma.phase.update({
      where: { id: phase.id },
      data: { animalTypeId: animalType.id }
    });
    
    console.log('Successfully moved phase to animal type:', updatedPhase);
    
    // Verify the change
    const phasesUnderAnimalType = await prisma.phase.findMany({
      where: { animalTypeId: animalType.id }
    });
    
    console.log('Phases now under animal type:', phasesUnderAnimalType);
    
    // Check direct phases (should be empty now)
    const directPhases = await prisma.phase.findMany({
      where: { 
        speciesId: cattleSpecies.id,
        animalTypeId: null
      }
    });
    
    console.log('Direct phases remaining:', directPhases);
    
  } catch (error) {
    console.error('Error moving phase:', error);
  } finally {
    await prisma.$disconnect();
  }
}

movePhaseToAnimalType();
