import { readdirSync, writeFileSync } from "fs";
import Papa from "papaparse";

export function readDataDir(dirPath) {
  try {
    return readdirSync(dirPath);
  } catch (err) {
    console.error("An error occurred while reading the folder:", err);
    return [];
  }
}

export function saveToCSV(filename, jsonData) {
  const flatData = Array.isArray(jsonData) && jsonData.some(Array.isArray) ? jsonData.flat() : jsonData;
  const csv = Papa.unparse(flatData);
  writeFileSync(filename, csv, "utf8");
  console.log(`✅ CSV saved: ${filename}`);
}

export function dataSelectionFilter(data, criteria) {
  return data.filter((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
}
