/**
 * Feed Formulation Calculation Engine
 * Implements Pearson's Square Method for feed formulation
 */

class CalculationEngine {
  constructor() {
    // Constants
    this.TOTAL_PARTS = 100;
    this.SLACK_SPACE = 10; // Reserved for supplements
    this.FIXED_INGREDIENT_PARTS = 10; // For rice polish or other fixed ingredients
    
    // Supplement nutritional values (constants)
    this.SUPPLEMENTS = {
      L_LYSINE: {
        name: 'L-Lysine HCl',
        lysine: 78, // 78% pure lysine
        category: 'amino_acid'
      },
      DL_METHIONINE: {
        name: 'DL-Methionine',
        methionine: 99, // 99% pure
        category: 'amino_acid'
      },
      DCP: {
        name: 'Dicalcium Phosphate (DCP)',
        availablePhosphorus: 20, // 20% available P
        calcium: 21, // 21% Ca
        category: 'mineral'
      },
      CALCIUM_CARBONATE: {
        name: 'Calcium Carbonate (CaCO₃)',
        calcium: 40, // 40% Ca
        category: 'mineral'
      },
      PALM_OIL: {
        name: 'Palm Oil',
        energy: 7200, // 7200 Kcal/kg
        category: 'energy_supplement'
      },
      SALT_PREMIX: {
        name: 'Salt + Trace Minerals + Vitamins',
        category: 'additive'
      }
    };
  }

  /**
   * Main calculation method
   * @param {Object} params - Calculation parameters
   * @returns {Object} - Calculated formulation
   */
  async calculate(params) {
    const {
      feedBatchWeight,
      species,
      subspecies,
      animalType,
      phase,
      nutritionalRequirements, // From Phase model
      availableIngredients = [] // Selected by user
    } = params;

    // Step 1: Validate inputs
    this.validateInputs(params);

    // Step 2: Categorize ingredients
    const categorized = this.categorizeIngredients(availableIngredients);

    // Step 3: Handle fixed ingredients (hardcoded Rice Polish for v1)
    const fixedIngredient = this.getFixedIngredient(categorized);
    
    // Step 4: Calculate remaining needs after fixed ingredients
    const remainingNeeds = this.calculateRemainingNeeds(
      nutritionalRequirements,
      fixedIngredient
    );

    // Step 5: Apply Pearson's Square Method
    const mainIngredients = this.applyPearsonsSquare(
      categorized,
      remainingNeeds,
      fixedIngredient
    );

    // Step 6: Combine all main ingredients
    const allMainIngredients = fixedIngredient 
      ? [fixedIngredient, ...mainIngredients]
      : mainIngredients;

    // Step 7: Calculate total nutrients provided
    const nutrientTotals = this.calculateNutrientTotals(allMainIngredients);

    // Step 8: Calculate deficits
    const deficits = this.calculateDeficits(
      nutritionalRequirements,
      nutrientTotals
    );

    // Step 9: Add supplements to fill deficits
    const supplements = this.addSupplements(deficits);

    // Step 10: Combine everything for final formulation
    const finalFormulation = [
      ...allMainIngredients,
      ...supplements
    ];

    // Step 11: Calculate final totals and cost
    const finalNutrients = this.calculateNutrientTotals(finalFormulation);
    const totalCost = this.calculateTotalCost(finalFormulation, feedBatchWeight);

    // Step 12: Prepare detailed result matching the UI requirements
    const feedMixResult = this.prepareFeedMixResult(finalFormulation, feedBatchWeight);
    const nutrientSummary = this.prepareNutrientSummary(nutritionalRequirements, finalNutrients);
    const costAnalysis = this.prepareCostAnalysis(finalFormulation, feedBatchWeight);

    return {
      success: true,
      formulation: {
        feedBatchWeight,
        species,
        subspecies,
        animalType,
        phase,
        ingredients: finalFormulation,
        nutritionalAnalysis: {
          provided: finalNutrients,
          required: nutritionalRequirements,
          deficits: this.calculateDeficits(nutritionalRequirements, finalNutrients)
        },
        costAnalysis: totalCost,
        calculatedAt: new Date().toISOString()
      },
      // Enhanced output for UI display
      feedMixResult,
      nutrientSummary,
      costAnalysis
    };
  }

  /**
   * Validate calculation inputs
   */
  validateInputs(params) {
    const { nutritionalRequirements, availableIngredients } = params;

    if (!nutritionalRequirements) {
      throw new Error('Nutritional requirements not provided for this phase');
    }

    if (!availableIngredients || availableIngredients.length === 0) {
      throw new Error('No ingredients selected. Please select at least one ingredient.');
    }

    // Check for required nutritional values
    const required = ['crudeProtein', 'meKcalPerKg'];
    for (const field of required) {
      if (!nutritionalRequirements[field]) {
        throw new Error(`Missing required nutritional value: ${field}`);
      }
    }
  }

  /**
   * Categorize ingredients by type
   */
  categorizeIngredients(ingredients) {
    const energySources = ingredients.filter(ing => 
      ing.category === 'Energy Source'
    );
    const proteinSources = ingredients.filter(ing => 
      ing.category === 'Protein Source'
    );
    const mediumSources = ingredients.filter(ing => 
      ing.category === 'Medium Source'
    );

    return {
      energySources,
      proteinSources,
      mediumSources,
      all: ingredients
    };
  }

  /**
   * Get fixed ingredient (any Medium Source ingredient)
   */
  getFixedIngredient(categorized) {
    // Check for any Medium Source ingredient and fix it at 10 parts
    const mediumSource = categorized.all.find(ing => 
      ing.category === 'Medium Source'
    );

    if (mediumSource) {
      return {
        ingredientId: mediumSource.id,
        name: mediumSource.name,
        parts: this.FIXED_INGREDIENT_PARTS,
        crudeProtein: mediumSource.crudeProtein || 0,
        energy: mediumSource.energy || 0,
        calcium: mediumSource.calcium || 0,
        phosphorus: mediumSource.phosphorus || 0,
        lysine: mediumSource.lysine || 0,
        methionine: mediumSource.methionine || 0,
        cost: mediumSource.cost || 0,
        isFixed: true
      };
    }

    return null;
  }

  /**
   * Calculate remaining needs after fixed ingredients
   */
  calculateRemainingNeeds(requirements, fixedIngredient) {
    const remainingParts = this.TOTAL_PARTS - this.SLACK_SPACE -  
      (fixedIngredient ? fixedIngredient.parts : 0);

    if (!fixedIngredient) {
      return {
        remainingParts,
        crudeProtein: requirements.crudeProtein,
        energy: requirements.meKcalPerKg,
        calcium: requirements.calcium || 0,
        phosphorus: requirements.availablePhosphorus || 0,
        lysine: requirements.lysine || 0,
        methionine: requirements.methionine || 0
      };
    }

    // Calculate contribution from fixed ingredient
    const contribution = {
      crudeProtein: (fixedIngredient.parts * fixedIngredient.crudeProtein) / 100,
      energy: (fixedIngredient.parts * fixedIngredient.energy) / 100,
      calcium: (fixedIngredient.parts * fixedIngredient.calcium) / 100,
      phosphorus: (fixedIngredient.parts * fixedIngredient.phosphorus) / 100,
      lysine: (fixedIngredient.parts * fixedIngredient.lysine) / 100,
      methionine: (fixedIngredient.parts * fixedIngredient.methionine) / 100
    };

    return {
      remainingParts,
      crudeProtein: requirements.crudeProtein - contribution.crudeProtein,
      energy: requirements.meKcalPerKg - contribution.energy,
      calcium: (requirements.calcium || 0) - contribution.calcium,
      phosphorus: (requirements.availablePhosphorus || 0) - contribution.phosphorus,
      lysine: (requirements.lysine || 0) - contribution.lysine,
      methionine: (requirements.methionine || 0) - contribution.methionine
    };
  }

  /**
   * Apply Pearson's Square Method
   */
  applyPearsonsSquare(categorized, remainingNeeds, fixedIngredient = null) {
    const { energySources, proteinSources, mediumSources } = categorized;
    const { remainingParts, crudeProtein: targetCP } = remainingNeeds;

    // Filter out fixed ingredient from regular ingredients to avoid duplication
    const filterOutFixed = (ingredients) => {
      if (!fixedIngredient) return ingredients;
      return ingredients.filter(ing => 
        ing.category !== 'Medium Source'
      );
    };

    // Combine energy and medium sources for LPS, excluding fixed ingredient
    const lpsIngredients = filterOutFixed([...energySources, ...mediumSources]);
    
    if (lpsIngredients.length === 0) {
      throw new Error('No energy/medium sources selected. Please select at least one energy source.');
    }

    // Filter protein sources to exclude fixed ingredient
    const filteredProteinSources = filterOutFixed(proteinSources);
    
    if (filteredProteinSources.length === 0) {
      throw new Error('No protein sources selected. Please select at least one protein source.');
    }

    // Calculate LPS average CP (equal mixing)
    const lpsAvgCP = lpsIngredients.reduce((sum, ing) => 
      sum + (ing.crudeProtein || 0), 0
    ) / lpsIngredients.length;

    // Get HPS with highest CP from filtered protein sources
    const hps = filteredProteinSources.reduce((max, ing) => 
      (ing.crudeProtein || 0) > (max.crudeProtein || 0) ? ing : max
    );
    const hpsCP = hps.crudeProtein || 0;

    // Adjust target for remaining parts
    const adjustedTarget = (targetCP / remainingParts) * 100;

    // Pearson's Square calculation
    const hpsDiff = Math.abs(adjustedTarget - lpsAvgCP);
    const lpsDiff = Math.abs(hpsCP - adjustedTarget);
    const totalRatio = hpsDiff + lpsDiff;

    // Calculate parts for HPS and LPS
    const hpsParts = (hpsDiff / totalRatio) * remainingParts;
    const lpsParts = (lpsDiff / totalRatio) * remainingParts;

    // Create ingredient list
    const ingredients = [];

    // Add HPS
    ingredients.push({
      ingredientId: hps.id,
      name: hps.name,
      parts: parseFloat(hpsParts.toFixed(2)),
      crudeProtein: hps.crudeProtein || 0,
      energy: hps.energy || 0,
      calcium: hps.calcium || 0,
      phosphorus: hps.phosphorus || 0,
      lysine: hps.lysine || 0,
      methionine: hps.methionine || 0,
      cost: hps.cost || 0,
      isFixed: false
    });

    // Distribute LPS parts equally among LPS ingredients
    const lpsPartsEach = lpsParts / lpsIngredients.length;
    lpsIngredients.forEach(ing => {
      ingredients.push({
        ingredientId: ing.id,
        name: ing.name,
        parts: parseFloat(lpsPartsEach.toFixed(2)),
        crudeProtein: ing.crudeProtein || 0,
        energy: ing.energy || 0,
        calcium: ing.calcium || 0,
        phosphorus: ing.phosphorus || 0,
        lysine: ing.lysine || 0,
        methionine: ing.methionine || 0,
        cost: ing.cost || 0,
        isFixed: false
      });
    });

    return ingredients;
  }

  /**
   * Calculate total nutrients provided by ingredients
   */
  calculateNutrientTotals(ingredients) {
    let totals = {
      crudeProtein: 0,
      energy: 0,
      calcium: 0,
      phosphorus: 0,
      lysine: 0,
      methionine: 0
    };

    ingredients.forEach(ing => {
      totals.crudeProtein += (ing.parts * ing.crudeProtein) / 100;
      totals.energy += (ing.parts * ing.energy) / 100;
      totals.calcium += (ing.parts * (ing.calcium || 0)) / 100;
      totals.phosphorus += (ing.parts * (ing.phosphorus || 0)) / 100;
      totals.lysine += (ing.parts * (ing.lysine || 0)) / 100;
      totals.methionine += (ing.parts * (ing.methionine || 0)) / 100;
    });

    // Round to 2 decimal places
    Object.keys(totals).forEach(key => {
      totals[key] = parseFloat(totals[key].toFixed(2));
    });

    return totals;
  }

  /**
   * Calculate nutrient deficits
   */
  calculateDeficits(requirements, provided) {
    return {
      crudeProtein: parseFloat((requirements.crudeProtein - provided.crudeProtein).toFixed(3)),
      energy: parseFloat((requirements.meKcalPerKg - provided.energy).toFixed(2)),
      calcium: parseFloat(((requirements.calcium || 0) - provided.calcium).toFixed(3)),
      phosphorus: parseFloat(((requirements.availablePhosphorus || 0) - provided.phosphorus).toFixed(3)),
      lysine: parseFloat(((requirements.lysine || 0) - provided.lysine).toFixed(3)),
      methionine: parseFloat(((requirements.methionine || 0) - provided.methionine).toFixed(3))
    };
  }

  /**
   * Add supplements to fill deficits
   */
  addSupplements(deficits) {
    const supplements = [];
    let usedSlackSpace = 0;

    // 1. Add Lysine if deficit
    if (deficits.lysine > 0.001) {
      const lysParts = deficits.lysine / (this.SUPPLEMENTS.L_LYSINE.lysine / 100);
      supplements.push({
        ingredientId: 'supplement_lysine',
        name: this.SUPPLEMENTS.L_LYSINE.name,
        parts: parseFloat(lysParts.toFixed(3)),
        crudeProtein: 0,
        energy: 0,
        calcium: 0,
        phosphorus: 0,
        lysine: this.SUPPLEMENTS.L_LYSINE.lysine,
        methionine: 0,
        cost: 0,
        isSupplement: true
      });
      usedSlackSpace += lysParts;
    }

    // 2. Add Methionine if deficit
    if (deficits.methionine > 0.001) {
      const methParts = deficits.methionine / (this.SUPPLEMENTS.DL_METHIONINE.methionine / 100);
      supplements.push({
        ingredientId: 'supplement_methionine',
        name: this.SUPPLEMENTS.DL_METHIONINE.name,
        parts: parseFloat(methParts.toFixed(3)),
        crudeProtein: 0,
        energy: 0,
        calcium: 0,
        phosphorus: 0,
        lysine: 0,
        methionine: this.SUPPLEMENTS.DL_METHIONINE.methionine,
        cost: 0,
        isSupplement: true
      });
      usedSlackSpace += methParts;
    }

    // 3. Add DCP if phosphorus deficit
    let dcpCalciumContribution = 0;
    if (deficits.phosphorus > 0.001) {
      const dcpParts = deficits.phosphorus / (this.SUPPLEMENTS.DCP.availablePhosphorus / 100);
      dcpCalciumContribution = (dcpParts * this.SUPPLEMENTS.DCP.calcium) / 100;
      
      supplements.push({
        ingredientId: 'supplement_dcp',
        name: this.SUPPLEMENTS.DCP.name,
        parts: parseFloat(dcpParts.toFixed(3)),
        crudeProtein: 0,
        energy: 0,
        calcium: this.SUPPLEMENTS.DCP.calcium,
        phosphorus: this.SUPPLEMENTS.DCP.availablePhosphorus,
        lysine: 0,
        methionine: 0,
        cost: 0,
        isSupplement: true
      });
      usedSlackSpace += dcpParts;
    }

    // 4. Add Calcium Carbonate if calcium deficit (after DCP contribution)
    const remainingCalciumDeficit = deficits.calcium - dcpCalciumContribution;
    if (remainingCalciumDeficit > 0.001) {
      const cacoParts = remainingCalciumDeficit / (this.SUPPLEMENTS.CALCIUM_CARBONATE.calcium / 100);
      supplements.push({
        ingredientId: 'supplement_caco3',
        name: this.SUPPLEMENTS.CALCIUM_CARBONATE.name,
        parts: parseFloat(cacoParts.toFixed(3)),
        crudeProtein: 0,
        energy: 0,
        calcium: this.SUPPLEMENTS.CALCIUM_CARBONATE.calcium,
        phosphorus: 0,
        lysine: 0,
        methionine: 0,
        cost: 0,
        isSupplement: true
      });
      usedSlackSpace += cacoParts;
    }

    // 5. Add Palm Oil if energy deficit
    if (deficits.energy > 1) {
      const oilParts = deficits.energy / (this.SUPPLEMENTS.PALM_OIL.energy / 100);
      supplements.push({
        ingredientId: 'supplement_oil',
        name: this.SUPPLEMENTS.PALM_OIL.name,
        parts: parseFloat(oilParts.toFixed(3)),
        crudeProtein: 0,
        energy: this.SUPPLEMENTS.PALM_OIL.energy,
        calcium: 0,
        phosphorus: 0,
        lysine: 0,
        methionine: 0,
        cost: 0,
        isSupplement: true
      });
      usedSlackSpace += oilParts;
    }

    // 6. Fill remaining slack space with salt + premix
    const remainingSlack = this.SLACK_SPACE - usedSlackSpace;
    if (remainingSlack > 0.001) {
      supplements.push({
        ingredientId: 'supplement_premix',
        name: this.SUPPLEMENTS.SALT_PREMIX.name,
        parts: parseFloat(remainingSlack.toFixed(3)),
        crudeProtein: 0,
        energy: 0,
        calcium: 0,
        phosphorus: 0,
        lysine: 0,
        methionine: 0,
        cost: 0,
        isSupplement: true
      });
    }

    return supplements;
  }

  /**
   * Calculate total cost
   */
  calculateTotalCost(ingredients, feedBatchWeight) {
    const costPer100Parts = ingredients.reduce((sum, ing) => {
      return sum + (ing.parts * (ing.cost || 0));
    }, 0);

    const costPerKg = costPer100Parts / 100;
    const totalCost = costPerKg * feedBatchWeight;

    return {
      costPer100Parts: parseFloat(costPer100Parts.toFixed(2)),
      costPerKg: parseFloat(costPerKg.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      feedBatchWeight
    };
  }

  /**
   * Prepare Feed Mix Result table for UI display
   */
  prepareFeedMixResult(ingredients, feedBatchWeight) {
    return ingredients.map(ingredient => {
      const percentage = parseFloat(ingredient.parts.toFixed(2));
      const amountKg = parseFloat(((percentage / 100) * feedBatchWeight).toFixed(2));
      const pricePerKg = parseFloat((ingredient.cost || 0).toFixed(2));
      const totalCost = parseFloat((amountKg * pricePerKg).toFixed(2));

      return {
        ingredient: ingredient.name,
        percentage: percentage,
        amountKg: amountKg,
        pricePerKg: pricePerKg,
        totalCost: totalCost,
        isSupplement: ingredient.isSupplement || false,
        isFixed: ingredient.isFixed || false
      };
    });
  }

  /**
   * Prepare Nutrient Summary table for UI display
   */
  prepareNutrientSummary(required, achieved) {
    const nutrients = [
      {
        name: 'Crude Protein (%)',
        required: parseFloat((required.crudeProtein || 0).toFixed(1)),
        achieved: parseFloat((achieved.crudeProtein || 0).toFixed(2))
      },
      {
        name: 'ME (kcal/kg)',
        required: parseFloat((required.meKcalPerKg || 0).toFixed(1)),
        achieved: parseFloat((achieved.energy || 0).toFixed(2))
      },
      {
        name: 'Calcium (%)',
        required: parseFloat((required.calcium || 0).toFixed(1)),
        achieved: parseFloat((achieved.calcium || 0).toFixed(2))
      },
      {
        name: 'Phosphorus (%)',
        required: parseFloat((required.availablePhosphorus || 0).toFixed(2)),
        achieved: parseFloat((achieved.phosphorus || 0).toFixed(2))
      },
      {
        name: 'Lysine (%)',
        required: parseFloat((required.lysine || 0).toFixed(1)),
        achieved: parseFloat((achieved.lysine || 0).toFixed(2))
      },
      {
        name: 'Methionine (%)',
        required: parseFloat((required.methionine || 0).toFixed(1)),
        achieved: parseFloat((achieved.methionine || 0).toFixed(2))
      },
      {
        name: 'Salt (%)',
        required: parseFloat((0.3).toFixed(1)), // Default salt requirement
        achieved: parseFloat((0.3).toFixed(1)) // Fixed salt addition
      }
    ];

    return nutrients;
  }

  /**
   * Prepare Cost Analysis for UI display
   */
  prepareCostAnalysis(ingredients, feedBatchWeight) {
    const totalFeedCost = ingredients.reduce((sum, ing) => {
      const percentage = ing.parts;
      const amountKg = (percentage / 100) * feedBatchWeight;
      const totalCost = amountKg * (ing.cost || 0);
      return sum + totalCost;
    }, 0);

    const costPerKg = totalFeedCost / feedBatchWeight;

    return {
      totalFeedCost: parseFloat(totalFeedCost.toFixed(2)),
      costPerKg: parseFloat(costPerKg.toFixed(2)),
      feedBatchWeight: feedBatchWeight
    };
  }
}

module.exports = new CalculationEngine();

