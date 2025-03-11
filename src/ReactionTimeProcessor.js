import Papa from "papaparse";
import { readFileSync } from "fs";

export class ReactionTimeProcessor {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.loadCSV();
    this.reactionTimes = [];
  }

  loadCSV() {
    const file = readFileSync(this.filePath, "utf8");
    return Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
    }).data;
  }

  generateDistancePairs(distance) {
    return Array.from({ length: 9 - distance }, (_, i) => [
      `${i + 1}_${i + 1 + distance}`,
      `${i + 1 + distance}_${i + 1}`,
    ]);
  }

  calculateAverage(arr) {
    return arr.length > 0
      ? +((arr.reduce((sum, val) => sum + val, 0) / arr.length).toFixed(3))
      : null;
  }

  processReactionTimes() {
    for (let i = 1; i < 9; i++) {
      let distanceData = this.generateDistancePairs(i);

      for (let pair of distanceData) {
        let timesObj = {
          distance: i,
          pair: `${pair[0]} && ${pair[1]}`,
          congruent_RT: [],
          incongruent_RT: [],
        };

        for (let row of this.data) {
          if (row.pairs === pair[0]) {
            timesObj.congruent_RT.push(parseFloat(row.RT));
          } else if (row.pairs === pair[1]) {
            timesObj.incongruent_RT.push(parseFloat(row.RT));
          }
        }

        timesObj.congruent_RT_AVERAGE = this.calculateAverage(timesObj.congruent_RT);
        timesObj.incongruent_RT_AVERAGE = this.calculateAverage(timesObj.incongruent_RT);
        this.reactionTimes.push(timesObj);
      }
    }
  }

  getReactionTimes() {
    return this.reactionTimes;
  }
}
