import { readDataDir, saveToCSV, dataSelectionFilter, loadRawCSV, calculateAverage } from "../src/utils/utils.js";
import { ReactionTimeProcessor } from "../src/processors/ReactionTimeProcessor.js";
import { Bootstrapper } from "../src/processors/Bootstrapper.js";
import { writeFileSync } from "fs";
import path from "path";

/**
 * Processes all CSV files in a given directory, applies bootstrap resampling,
 * and saves the results in JSON and CSV formats.
 *
 * @param {string} dataFilesDirectory - The directory containing participant data files.
 * @param {string} fileRecordName - The base filename for saving the results.
 * @param {number} [bootstrapIterations=5000] - The number of bootstrap iterations.
 */
function processFiles(dataFilesDirectory, fileRecordName, bootstrapIterations = 5000) {
  const participantDataFiles = readDataDir(dataFilesDirectory);
  console.log(`📂 Processing ${participantDataFiles.length} files from: ${dataFilesDirectory}`);

  const finalResults = participantDataFiles
    .map(file => processFile(dataFilesDirectory, file, bootstrapIterations))
    .filter(Boolean); // Remove null results

  saveResults(finalResults, fileRecordName);
}

/**
 * Processes a single file, runs bootstrap resampling, and extracts participant data.
 *
 * @param {string} dataFilesDirectory - The directory containing the file.
 * @param {string} file - The filename to process.
 * @param {number} bootstrapIterations - The number of bootstrap iterations.
 * @returns {object|null} - Processed participant data or null if an error occurs.
 */
function processFile(dataFilesDirectory, file, bootstrapIterations) {
  try {
    const filePath = path.join(dataFilesDirectory, file);
    const partNo = path.basename(file, ".csv");
    console.log(`📂 Processing file: ${filePath}`);

    const processor = new ReactionTimeProcessor(filePath);
    processor.processReactionTimes();

    const bootstrapResults = runBootstrapProcessing(processor.getReactionTimes(), bootstrapIterations);

    saveBootstrapResults(partNo, bootstrapResults);
    return extractParticipantData(partNo, processor, bootstrapResults);
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
function runBootstrapProcessing(reactionTimes, iterations) {
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
function saveBootstrapResults(partNo, results) {
  saveToCSV(path.join("analysis_result", "bootstrap_detail", "congruent", `${partNo}_congruent_detail.csv`), results.congruent);
  saveToCSV(path.join("analysis_result", "bootstrap_detail", "incongruent", `${partNo}_incongruent_detail.csv`), results.incongruent);
}

/**
 * Extracts participant data and calculates average reaction times.
 *
 * @param {string} partNo - Participant identifier.
 * @param {ReactionTimeProcessor} processor - The processor handling reaction time calculations.
 * @param {object} results - The bootstrap results.
 * @returns {object} - The processed participant data.
 */
function extractParticipantData(partNo, processor, results) {
  const MAX_DISTANCE = 8;

  /**
   * Helper function to calculate the average reaction time for a given distance.
   *
   * @param {Array} data - The dataset to filter.
   * @param {number} distance - The specific distance to filter for.
   * @returns {number|null} - The average reaction time or null if no data.
   */
  const extractAverage = (data, distance) =>
    processor.calculateAverage(dataSelectionFilter(data.flat(), { distance }).map(item => item.value));

  return {
    partNo,
    ...Object.fromEntries(
      Array.from({ length: MAX_DISTANCE }, (_, i) => {
        const distance = i + 1;
        return [
          [`comp_${distance}`, extractAverage(results.congruent, distance)],
          [`incomp_${distance}`, extractAverage(results.incongruent, distance)]
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
function saveResults(finalResults, fileRecordName) {
  const jsonPath = path.join("analysis_result", "compatibility", `${fileRecordName}.json`);
  const csvPath = path.join("analysis_result", "compatibility", `${fileRecordName}.csv`);

  writeFileSync(jsonPath, JSON.stringify(finalResults, null, 2), "utf8");
  saveToCSV(csvPath, finalResults);
  console.log(`✅ Process completed: Results saved to ${jsonPath} and ${csvPath}`);
}

/**
 * Processes all files in a directory and calculates reaction time averages
 * based on the size of the stimulus pairs (small/large).
 *
 * @param {string} dataFilesDirectory - The directory containing the files.
 * @param {string} fileRecordName - The base filename for saving results.
 */
function calculationToSize(dataFilesDirectory, fileRecordName) {
  const participantDataFiles = readDataDir(dataFilesDirectory);

  const resultData = participantDataFiles.map(file => {
    const filePath = path.join(dataFilesDirectory, file);
    const partNo = path.basename(file, ".csv");
    const data = loadRawCSV(filePath);

    return calculateSizeAverages(partNo, data);
  });

  saveToCSV(path.join("analysis_result", "by_size", `${fileRecordName}.csv`), resultData);
}

/**
 * Computes average reaction times for small and large stimulus pairs.
 *
 * @param {string} partNo - Participant identifier.
 * @param {Array} data - The dataset containing reaction time information.
 * @returns {object} - Processed data containing reaction time averages.
 */
function calculateSizeAverages(partNo, data) {
  const conditions = [
    { key: 'small_and_left', response: 'left', size: 'small pairs' },
    { key: 'small_and_right', response: 'right', size: 'small pairs' },
    { key: 'large_and_left', response: 'left', size: 'large pairs' },
    { key: 'large_and_right', response: 'right', size: 'large pairs' }
  ];

  return {
    partNo,
    ...Object.fromEntries(
      conditions.map(cond => [cond.key, calculateAverage(data.filter(item => item.Response === cond.response && item.size === cond.size))])
    ),
  };
}

// 📌 Start processing
// processFiles("participant_data/large/", "large_results", 100000);
// processFiles("participant_data/small/", "small_results", 100000);
// calculationToSize("participant_data/large/", "large");
// calculationToSize("participant_data/small/", "small");


/**
 * Computes the percentage of correct responses (Error_Code = 'C')
 * for each distance and congruency type and logs all steps.
 */
function calculationAccuracy() {
  const dataFilesDirectory = "participant_data/raw_data/";
  const participantDataFiles = readDataDir(dataFilesDirectory);

  console.log(`📂 Processing accuracy for ${participantDataFiles.length} files from: ${dataFilesDirectory}`);

  let detailedLog = []; // JSON için detaylı logları buraya ekleyeceğiz

  const resultData = participantDataFiles.map(file => {
    const filePath = path.join(dataFilesDirectory, file);
    const partNo = path.basename(file, ".csv");
    const data = loadRawCSV(filePath);

    console.log(`🔎 Processing participant: ${partNo}, Total rows: ${data.length}`);
    
    const result = calculateAccuracyPercentages(partNo, data);
    
    detailedLog.push(result); // JSON loguna ekliyoruz
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
function calculateAccuracyPercentages(partNo, data) {
  const MAX_DISTANCE = 8;
  const result = { partNo, details: {} }; // JSON için detaylar ekleniyor

  /**
   * Calculates the percentage of correct responses for a given distance and congruency.
   * Logs each step of filtering and calculation.
   *
   * @param {string} congruency - Either "congruent" or "incongruent".
   * @param {number} distance - Distance value.
   * @returns {number|null} - Percentage of correct responses within this distance or null if no data.
   */
  const calculatePercentage = (congruency, distance) => {
    const filteredData = data.filter(item => 
      Number(item.distance) === distance && item.congruency === congruency
    );

    console.log(`📌 Distance ${distance} - ${congruency.toUpperCase()}`);
    console.log(`   🔹 Total trials in this distance: ${filteredData.length}`);

    if (filteredData.length === 0) {
      console.log(`   ⚠️ No trials found for distance ${distance} (${congruency})`);
      return null; // No trials for this distance
    }

    const correctCount = filteredData.filter(item => item.Error_Code === "C").length;
    const percentage = parseFloat(((correctCount / filteredData.length) * 100).toFixed(2));

    console.log(`   ✅ Correct responses: ${correctCount}`);
    console.log(`   🔹 Accuracy: ${percentage}%`);

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

calculationAccuracy();
