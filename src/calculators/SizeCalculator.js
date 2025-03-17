import {readDataDir, saveToCSV, loadRawCSV, calculateAverage} from "../utils/utils.js";
import path from "path";

export class SizeCalculator {
  /**
   * Processes all files in a directory and calculates reaction time averages
   * based on the size of the stimulus pairs (small/large).
   *
   * @param {string} dataFilesDirectory - The directory containing the files.
   * @param {string} fileRecordName - The base filename for saving results.
   */
  calculationToSize(dataFilesDirectory, fileRecordName) {
    const participantDataFiles = readDataDir(dataFilesDirectory);

    const resultData = participantDataFiles.map((file) => {
      const filePath = path.join(dataFilesDirectory, file);
      const partNo = path.basename(file, ".csv");
      const data = loadRawCSV(filePath);
      return this.calculateSizeAverages(partNo, data);
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
  calculateSizeAverages(partNo, data) {
    const conditions = [
      { key: "small_and_left", response: "left", size: "small pairs" },
      { key: "small_and_right", response: "right", size: "small pairs" },
      { key: "large_and_left", response: "left", size: "large pairs" },
      { key: "large_and_right", response: "right", size: "large pairs" },
    ];

    return {
      partNo,
      ...Object.fromEntries(
        conditions.map((cond) => [
          cond.key,
          calculateAverage(
            data.filter(
              (item) =>
                item.Response === cond.response && item.size === cond.size
            )
          ),
        ])
      ),
    };
  }
}
