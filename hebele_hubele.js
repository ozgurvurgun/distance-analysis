import { readFileSync } from "fs";

function loadFile() {
  const file = readFileSync("analysis_result/final_results.json", "utf8");
  return JSON.parse(file);
}

const data = loadFile();

let resultOne = data
  .filter((item) => item.comp_8 > item.comp_7)
  .map((item) => ({
    Participant: item.partNo,
    "comp-7": item.comp_7,
    "comp-8": item.comp_8,
  }));

console.log("comp-8' nin comp-7' dan büyük olduğu durumlar;");
console.table(resultOne);

let resultTwo = data
  .filter((item) => item.comp_7 > item.comp_8)
  .map((item) => ({
    Participant: item.partNo,
    "comp-7": item.comp_7,
    "comp-8": item.comp_8,
  }));

console.log("comp-7' nin comp-8' dan büyük olduğu durumlar;");
console.table(resultTwo);
