
import { writeFileSync } from "fs";
import {readDataDir, saveToCSV, loadRawCSV} from "../utils/utils.js";
import path from "path";

export class AccuracyCalculator {
  /**
   * Processes all participant data files in the directory, calculates accuracy percentages,
   * and saves the results both as a CSV and a JSON file.
   */
  calculationAccuracy() {
    const dataFilesDirectory = "participant_data/raw_data/";
    const participantDataFiles = readDataDir(dataFilesDirectory);

    console.log(`📂 Processing accuracy for ${participantDataFiles.length} files from: ${dataFilesDirectory}`);

    let detailedLog = [];
    const resultData = participantDataFiles.map((file) => {
      const filePath = path.join(dataFilesDirectory, file);
      const partNo = path.basename(file, ".csv");
      const data = loadRawCSV(filePath);

      console.log(`🔎 Processing participant: ${partNo}, Total rows: ${data.length}`);

      const result = this.calculateAccuracyPercentages(partNo, data);

      detailedLog.push(result);
      return result;
    });

    // Save results as CSV
    const csvOutputPath = path.join("analysis_result", "accuracy", "accuracy_results.csv");
    saveToCSV(csvOutputPath, resultData);
    console.log(`✅ Accuracy results saved to ${csvOutputPath}`);

    // Save detailed logs as JSON
    const jsonOutputPath = path.join("analysis_result", "accuracy", "detail_accuracy_results.json");
    writeFileSync(jsonOutputPath, JSON.stringify(detailedLog, null, 2), "utf8");
    console.log(`✅ Detailed accuracy logs saved to ${jsonOutputPath}`);
  }

  /**
   * Computes the accuracy percentages for each distance and congruency type, with logging.
   *
   * @param {string} partNo - Participant identifier.
   * @param {Array} data - The dataset containing reaction time information.
   * @returns {object} - Processed data containing accuracy percentages.
   */
  calculateAccuracyPercentages(partNo, data) {
    const MAX_DISTANCE = 8;
    const result = { partNo, details: {} };

    /**
     * Calculates the percentage of correct responses for a given distance and congruency.
     * Logs each step of filtering and calculation.
     *
     * @param {string} congruency - Either "congruent" or "incongruent".
     * @param {number} distance - Distance value.
     * @returns {number|null} - Percentage of correct responses within this distance or null if no data.
     */
    const calculatePercentage = (congruency, distance) => {
      const filteredData = data.filter(
        (item) =>
          Number(item.distance) === distance && item.congruency === congruency
      );

      console.log(`📌 Distance ${distance} - ${congruency.toUpperCase()}`);
      console.log(`🔹 Total trials in this distance: ${filteredData.length}`);

      if (filteredData.length === 0) {
        console.log(`⚠️ No trials found for distance ${distance} (${congruency})`);
        return null; // No trials for this distance
      }

      const correctCount = filteredData.filter((item) => item.Error_Code === "C").length;
      const percentage = parseFloat(
        ((correctCount / filteredData.length) * 100).toFixed(2)
      );

      console.log(`✅ Correct responses: ${correctCount}`);
      console.log(`🔹 Accuracy: ${percentage}%`);

      // Log details for JSON output
      result.details[`distance${distance}_${congruency}`] = {
        total_trials: filteredData.length,
        correct_trials: correctCount,
        accuracy_percentage: percentage,
      };

      return percentage;
    };

    for (let distance = 1; distance <= MAX_DISTANCE; distance++) {
      result[`distance${distance}_congruent_accuracy`] = calculatePercentage("congruent", distance);
      result[`distance${distance}_incongruent_accuracy`] = calculatePercentage("incongruent", distance);
    }

    console.log(`📊 Final result for ${partNo}:`, result);
    return result;
  }
}
