import { Bootstrapper } from "../processors/Bootstrapper.js";
import { ReactionTimeProcessor } from "../processors/ReactionTimeProcessor.js";
import { readDataDir, saveToCSV, dataSelectionFilter } from "../utils/utils.js";
import { writeFileSync } from "fs";
import path from "path";

export class BootstrapCalcultor {
  /**
   * Processes all CSV files in a given directory, applies bootstrap resampling,
   * and saves the results in JSON and CSV formats.
   *
   * @param {string} dataFilesDirectory - The directory containing participant data files.
   * @param {string} fileRecordName - The base filename for saving the results.
   * @param {number} [bootstrapIterations=5000] - The number of bootstrap iterations.
   */
  processFiles(dataFilesDirectory, fileRecordName, bootstrapIterations = 5000) {
    const participantDataFiles = readDataDir(dataFilesDirectory);
    console.log(
      `📂 Processing ${participantDataFiles.length} files from: ${dataFilesDirectory}`
    );

    const finalResults = participantDataFiles
      .map((file) => this.processFile(dataFilesDirectory, file, bootstrapIterations))
      .filter(Boolean); // Remove null results

    this.saveResults(finalResults, fileRecordName);
  }

  /**
   * Processes a single file, runs bootstrap resampling, and extracts participant data.
   *
   * @param {string} dataFilesDirectory - The directory containing the file.
   * @param {string} file - The filename to process.
   * @param {number} bootstrapIterations - The number of bootstrap iterations.
   * @returns {object|null} - Processed participant data or null if an error occurs.
   */
  processFile(dataFilesDirectory, file, bootstrapIterations) {
    try {
      const filePath = path.join(dataFilesDirectory, file);
      const partNo = path.basename(file, ".csv");
      console.log(`📂 Processing file: ${filePath}`);

      const processor = new ReactionTimeProcessor(filePath);
      processor.processReactionTimes();

      const bootstrapResults = this.runBootstrapProcessing(
        processor.getReactionTimes(),
        bootstrapIterations
      );

      this.saveBootstrapResults(partNo, bootstrapResults);
      return this.extractParticipantData(partNo, processor, bootstrapResults);
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error);
      return null;
    }
  }

  /**
   * Runs bootstrap resampling on reaction time data.
   *
   * @param {Array} reactionTimes - Processed reaction time data.
   * @param {number} iterations - Number of bootstrap iterations.
   * @returns {object} - The bootstrap results.
   */
  runBootstrapProcessing(reactionTimes, iterations) {
    const bootstrapper = new Bootstrapper(reactionTimes, iterations);
    bootstrapper.runBootstrap();
    return bootstrapper.getResults();
  }

  /**
   * Saves bootstrap results for a participant into CSV files.
   *
   * @param {string} partNo - Participant identifier.
   * @param {object} results - Bootstrap results containing congruent and incongruent data.
   */
  saveBootstrapResults(partNo, results) {
    saveToCSV(path.join("analysis_result", "bootstrap_detail", "congruent", `${partNo}_congruent_detail.csv`), results.congruent);
    saveToCSV(path.join("analysis_result", "bootstrap_detail", "incongruent", `${partNo}_incongruent_detail.csv`),results.incongruent);
  }

  /**
   * Extracts participant data and calculates average reaction times.
   *
   * @param {string} partNo - Participant identifier.
   * @param {ReactionTimeProcessor} processor - The processor handling reaction time calculations.
   * @param {object} results - The bootstrap results.
   * @returns {object} - The processed participant data.
   */
  extractParticipantData(partNo, processor, results) {
    const MAX_DISTANCE = 8;

    /**
     * Helper function to calculate the average reaction time for a given distance.
     *
     * @param {Array} data - The dataset to filter.
     * @param {number} distance - The specific distance to filter for.
     * @returns {number|null} - The average reaction time or null if no data.
     */
    const extractAverage = (data, distance) =>
      processor.calculateAverage(
        dataSelectionFilter(data.flat(), { distance }).map((item) => item.value)
      );

    return {
      partNo,
      ...Object.fromEntries(
        Array.from({ length: MAX_DISTANCE }, (_, i) => {
          const distance = i + 1;
          return [
            [`comp_${distance}`, extractAverage(results.congruent, distance)],
            [`incomp_${distance}`, extractAverage(results.incongruent, distance)],
          ];
        }).flat()
      ),
    };
  }

  /**
   * Saves processed results in JSON and CSV formats.
   *
   * @param {Array} finalResults - The final processed data.
   * @param {string} fileRecordName - The base filename for saving results.
   */
  saveResults(finalResults, fileRecordName) {
    const jsonPath = path.join("analysis_result", "compatibility", `${fileRecordName}.json`);
    const csvPath = path.join("analysis_result", "compatibility", `${fileRecordName}.csv`);

    writeFileSync(jsonPath, JSON.stringify(finalResults, null, 2), "utf8");
    saveToCSV(csvPath, finalResults);
    console.log(
      `✅ Process completed: Results saved to ${jsonPath} and ${csvPath}`
    );
  }
}
