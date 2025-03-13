import { readdirSync, writeFileSync, readFileSync } from "fs";
import Papa from "papaparse";

/**
 * Reads the contents of a directory and returns a list of filenames.
 * 
 * @param {string} dirPath - The path to the directory to be read.
 * @returns {string[]} - An array of filenames in the directory, or an empty array if an error occurs.
 */
export function readDataDir(dirPath) {
  try {
    return readdirSync(dirPath);
  } catch (err) {
    console.error("An error occurred while reading the folder:", err);
    return [];
  }
}

/**
 * Saves an array of JSON data into a CSV file.
 * 
 * @param {string} filename - The path where the CSV file will be saved.
 * @param {Array|Object} jsonData - The data to be converted into CSV format.
 */
export function saveToCSV(filename, jsonData) {
  // Flatten the data if it contains nested arrays
  const flatData = Array.isArray(jsonData) && jsonData.some(Array.isArray) ? jsonData.flat() : jsonData;
  
  // Convert JSON to CSV format
  const csv = Papa.unparse(flatData);

  // Write the CSV content to the specified file
  writeFileSync(filename, csv, "utf8");

  console.log(`✅ CSV saved: ${filename}`);
}

/**
 * Filters an array of objects based on specified criteria.
 * 
 * @param {Array<Object>} data - The array of objects to be filtered.
 * @param {Object} criteria - An object where keys represent properties to filter by and values are the expected values.
 * @returns {Array<Object>} - The filtered array of objects.
 */
export function dataSelectionFilter(data, criteria) {
  return data.filter((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
}

/**
 * Loads and parses a CSV file into an array of objects.
 * 
 * @param {string} filePath - The path to the CSV file.
 * @returns {Array<Object>} - An array of objects containing the parsed CSV data.
 */
export function loadRawCSV(filePath) {
  try {
    // Read file contents
    const file = readFileSync(filePath, "utf8");

    // Parse CSV data into an array of objects
    return Papa.parse(file, {
      header: true, // Treats the first row as column headers
      skipEmptyLines: true, // Ignores empty rows in the CSV file
    }).data;
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${filePath}`, error);
    return [];
  }
}

/**
 * Calculates the average reaction time (RT) from an array of data objects.
 * 
 * @param {Array<Object>} data - An array of objects where each object contains an `RT` value.
 * @returns {number|null} - The computed average RT, rounded to three decimal places, or `null` if no valid RT values exist.
 */
export function calculateAverage(data) {
  // Ensure data is an array and contains valid elements
  if (!Array.isArray(data) || data.length === 0) return null;
  
  // Extract and filter valid RT values
  const validRTs = data.map(item => Number(item.RT)).filter(rt => !isNaN(rt));
  
  // If no valid RT values exist, return null
  if (validRTs.length === 0) return null;

  // Compute the average RT and round to 3 decimal places
  return parseFloat((validRTs.reduce((sum, val) => sum + val, 0) / validRTs.length).toFixed(3));
}
