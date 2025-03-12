import { readDataDir, saveToCSV, dataSelectionFilter } from "../src/utils.js";
import { ReactionTimeProcessor } from "../src/ReactionTimeProcessor.js";
import { Bootstrapper } from "../src/Bootstrapper.js";
import { writeFileSync } from "fs";
import path from "path";

function processFiles(dataFilesDirectory, fileRecordName, bootstrapIterations = 10000) {
  const participantDataFiles = readDataDir(dataFilesDirectory);
  const finalResults = [];

  for (let file of participantDataFiles) {
    try {
      const result = processFile(dataFilesDirectory, file, bootstrapIterations);
      finalResults.push(result);
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error);
    }
  }

  saveResults(finalResults, fileRecordName);
}

function processFile(dataFilesDirectory, file, bootstrapIterations) {
  const filePath = path.join(dataFilesDirectory, file);
  const partNo = path.basename(file, ".csv");
  console.log(`📂 Processing: ${filePath}`);

  const processor = new ReactionTimeProcessor(filePath);
  processor.processReactionTimes();
  const reactionTimes = processor.getReactionTimes();

  const bootstrapper = new Bootstrapper(reactionTimes, bootstrapIterations);
  bootstrapper.runBootstrap();
  const results = bootstrapper.getResults();

  saveBootstrapResults(partNo, results);
  return extractParticipantData(partNo, processor, results);
}

function saveBootstrapResults(partNo, results) {
  saveToCSV(path.join("analysis_result", "bootstrap_detail", "congruent", `${partNo}_congruent_detail.csv`), results.congruent);
  saveToCSV(path.join("analysis_result", "bootstrap_detail", "incongruent", `${partNo}_incongruent_detail.csv`), results.incongruent);
}

function extractParticipantData(partNo, processor, results) {
  const participantJSON = { partNo };
  for (let distance = 1; distance <= 8; distance++) {
    participantJSON[`comp_${distance}`] = processor.calculateAverage(
      dataSelectionFilter(results.congruent.flat(), { distance }).map((item) => item.value)
    );
    participantJSON[`incomp_${distance}`] = processor.calculateAverage(
      dataSelectionFilter(results.incongruent.flat(), { distance }).map((item) => item.value)
    );
  }
  return participantJSON;
}

function saveResults(finalResults, fileRecordName) {
  const jsonPath = path.join("analysis_result", `${fileRecordName}.json`);
  const csvPath = path.join("analysis_result", `${fileRecordName}.csv`);

  writeFileSync(jsonPath, JSON.stringify(finalResults, null, 2), "utf8");
  saveToCSV(csvPath, finalResults);
  console.log(`✅ Process completed: Results saved to ${jsonPath} and ${csvPath}`);
}

// Usage
processFiles("participant_data/large/", "large_results");
processFiles("participant_data/small/", "small_results");
