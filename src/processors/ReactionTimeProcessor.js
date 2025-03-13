import Papa from "papaparse";
import { readFileSync } from "fs";

/**
 * The `ReactionTimeProcessor` class is responsible for:
 * - Loading and parsing CSV reaction time data.
 * - Processing reaction times based on distance pairs.
 * - Calculating average reaction times for congruent and incongruent conditions.
 */
export class ReactionTimeProcessor {
  /**
   * Initializes the `ReactionTimeProcessor` instance.
   * 
   * @param {string} filePath - The path to the CSV file containing reaction time data.
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.loadCSV();
    this.reactionTimes = [];
  }

  /**
   * Loads and parses the CSV file.
   * 
   * @returns {Array} - An array of objects representing the parsed CSV data.
   */
  loadCSV() {
    const file = readFileSync(this.filePath, "utf8");
    return Papa.parse(file, {
      header: true, // Treats the first row as column headers.
      skipEmptyLines: true, // Ignores empty rows.
    }).data;
  }

  /**
   * Generates an array of distance pairs based on the given distance.
   * 
   * @param {number} distance - The distance between numbers in the pair.
   * @returns {Array} - An array of paired values representing valid distances.
   */
  generateDistancePairs(distance) {
    return Array.from({ length: 9 - distance }, (_, i) => [
      `${i + 1}_${i + 1 + distance}`,
      `${i + 1 + distance}_${i + 1}`,
    ]);
  }

  /**
   * Calculates the average value of an array.
   * 
   * @param {Array<number>} arr - The array of numerical values.
   * @returns {number|null} - The computed average, rounded to three decimal places, or `null` if empty.
   */
  calculateAverage(arr) {
    return arr.length > 0
      ? +((arr.reduce((sum, val) => sum + val, 0) / arr.length).toFixed(3))
      : null;
  }

  /**
   * Processes reaction times by:
   * - Iterating over distances from `1` to `8`.
   * - Generating distance pairs for each distance.
   * - Extracting reaction times from CSV data.
   * - Categorizing them as `congruent` or `incongruent`.
   * - Calculating average reaction times for each category.
   */
  processReactionTimes() {
    for (let i = 1; i < 9; i++) {
      let distanceData = this.generateDistancePairs(i);

      for (let pair of distanceData) {
        let timesObj = {
          distance: i,
          pair: `${pair[0]} && ${pair[1]}`, // Pair stored as a string
          congruent_RT: [], // Holds reaction times for congruent condition
          incongruent_RT: [], // Holds reaction times for incongruent condition
        };

        for (let row of this.data) {
          if (row.pairs === pair[0]) {
            timesObj.congruent_RT.push(parseFloat(row.RT)); // Add congruent reaction time
          } else if (row.pairs === pair[1]) {
            timesObj.incongruent_RT.push(parseFloat(row.RT)); // Add incongruent reaction time
          }
        }

        // Compute average reaction times for each condition
        timesObj.congruent_RT_AVERAGE = this.calculateAverage(timesObj.congruent_RT);
        timesObj.incongruent_RT_AVERAGE = this.calculateAverage(timesObj.incongruent_RT);
        
        // Store the processed reaction time object
        this.reactionTimes.push(timesObj);
      }
    }
  }

  /**
   * Returns the processed reaction times.
   * 
   * @returns {Array} - An array containing reaction time objects for each distance.
   */
  getReactionTimes() {
    return this.reactionTimes;
  }
}
