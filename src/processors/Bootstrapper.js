import crypto from "crypto";

/**
 * The Bootstrapper class performs bootstrap resampling on reaction time data.
 * It generates resampled datasets for both congruent and incongruent conditions.
 */
export class Bootstrapper {
    /**
     * Initializes a Bootstrapper instance.
     * 
     * @param {Array} reactionTimeData - Array of reaction time data objects.
     * @param {number} [iteration=5000] - Number of bootstrap iterations to perform.
     */
    constructor(reactionTimeData, iteration = 5000) {
      this.reactionTimeData = reactionTimeData;
      this.iteration = iteration;
      this.bootstrapResults = { congruent: [], incongruent: [] };
    }
  
    /**
     * Selects a random element from an array using `Math.random()`.
     * 
     * @param {Array} array - The array to select from.
     * @returns {*} - A randomly selected element from the array.
     */
    getRandomElement(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Selects a highly randomized element from an array using `crypto.randomInt()`.
     * 
     * @param {Array} array - The array to select from.
     * @returns {*} - A randomly selected element from the array, or null if the array is empty.
     */
    getUltraRandomElement(array) {
      if (array.length === 0) return null;
      return array[crypto.randomInt(0, array.length)];
    }
  
    /**
     * Runs the bootstrap resampling process.
     * 
     * - Iterates `this.iteration` times.
     * - Selects random reaction time samples for each distance (1-8).
     * - Stores resampled congruent and incongruent reaction times.
     */
    runBootstrap() {
      for (let i = 0; i < this.iteration; i++) {
        let bootstrappedSampleCongruent = [];
        let bootstrappedSampleIncongruent = [];
  
        for (let distance = 1; distance <= 8; distance++) {
          // Filter reaction time data based on distance
          let candidates = this.reactionTimeData.filter((item) => item.distance === distance);
  
          if (candidates.length > 0) {
            // Select a random candidate for bootstrap resampling
            let randomChoice = this.getUltraRandomElement(candidates);
  
            bootstrappedSampleCongruent.push({
              distance,
              pair: randomChoice.pair.split(" && ")[0], // Extract first element of the pair
              congruent_RT: randomChoice.congruent_RT, // Store original congruent RT values
              value: randomChoice.congruent_RT_AVERAGE, // Store average congruent RT value
            });
  
            bootstrappedSampleIncongruent.push({
              distance,
              pair: randomChoice.pair.split(" && ")[1], // Extract second element of the pair
              incongruent_RT: randomChoice.incongruent_RT, // Store original incongruent RT values
              value: randomChoice.incongruent_RT_AVERAGE, // Store average incongruent RT value
            });
          }
        }
  
        // Store the generated bootstrap samples for this iteration
        this.bootstrapResults.congruent.push(bootstrappedSampleCongruent);
        this.bootstrapResults.incongruent.push(bootstrappedSampleIncongruent);
      }
    }
  
    /**
     * Retrieves the final bootstrap results.
     * 
     * @returns {object} - An object containing congruent and incongruent bootstrap results.
     */
    getResults() {
      return this.bootstrapResults;
    }
}
