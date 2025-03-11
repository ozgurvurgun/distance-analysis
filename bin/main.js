import { readDataDir, saveToCSV, dataSelectionFilter } from "../src/utils.js";
import { ReactionTimeProcessor } from "../src/ReactionTimeProcessor.js";
import { Bootstrapper } from "../src/Bootstrapper.js";
import { writeFileSync } from "fs";

function main(dataFilesDirectory, fileRecordName) {
  const participantDataFiles = readDataDir(dataFilesDirectory);
  const finalResults = [];

  for (let file of participantDataFiles) {
    const filePath = `${dataFilesDirectory}${file}`;
    const partNo = file.replace(".csv", ""); // Partipant Number
    console.log(`📂 Processing: ${filePath}`);

    const processor = new ReactionTimeProcessor(filePath);
    processor.processReactionTimes();
    const reactionTimes = processor.getReactionTimes();
    const bootstrapper = new Bootstrapper(reactionTimes, 100);
    bootstrapper.runBootstrap();
    const results = bootstrapper.getResults();
    const participantJSON = { partNo };

    const combinedResults = [...results.congruent, ...results.incongruent];   
    saveToCSV(`analysis_result/detail/${partNo}_detail.csv`, combinedResults); 

    for (let distance = 1; distance <= 8; distance++) {
      participantJSON[`comp_${distance}`] = processor.calculateAverage(
        dataSelectionFilter(results.congruent.flat(), { distance }).map(
          (item) => item.value
        )
      );
      participantJSON[`incomp_${distance}`] = processor.calculateAverage(
        dataSelectionFilter(results.incongruent.flat(), { distance }).map(
          (item) => item.value
        )
      );
    }

    finalResults.push(participantJSON);
  }

  writeFileSync(`analysis_result/${fileRecordName}.json`, JSON.stringify(finalResults, null, 2),"utf8");
  saveToCSV(`analysis_result/${fileRecordName}.csv`, finalResults);
  console.log("✅ Process completed");
}

main("participant_data/large/", "large_results");
main("participant_data/small/", "small_results");
