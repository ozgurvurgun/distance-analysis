import { readdirSync, writeFileSync } from "fs";
import Papa from "papaparse";

export function readDataDir(dirPath) {
  try {
    return readdirSync(dirPath);
  } catch (err) {
    console.error("Klasör okunurken hata oluştu:", err);
    return [];
  }
}

export function saveToCSV(filename, jsonData) {
  const flatData = Array.isArray(jsonData) && jsonData.some(Array.isArray) ? jsonData.flat() : jsonData;
  const csv = Papa.unparse(flatData);
  writeFileSync(filename, csv, "utf8");
  console.log(`✅ CSV kaydedildi: ${filename}`);
}

export function dataSelectionFilter(data, criteria) {
  return data.filter((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
}

/**
 * Bir nesnenin her öğesine belirli bir key-value ekler.
 * @param {Object} data - Güncellenecek nesne
 * @param {string} key - Eklenecek anahtar
 * @param {any} value - Eklenecek değer
 * @returns {Object} - Güncellenmiş nesne
 */
export function addKeyValueToObject(data, key, value) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      { ...v, [key]: value }
    ])
  );
}

