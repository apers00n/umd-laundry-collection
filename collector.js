import fs from "fs";
import path from "path";
import { getRooms, getRoomSummaries } from "./getInfo.js";

// Directory for daily files
const DATA_DIR = "./data";

/**
 * Ensure the data directory exists
 */
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Generate file path for a given floor and today's date
 */
function getDailyFile(floorLabel) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const safeLabel = floorLabel
    ? floorLabel.toLowerCase().replace(/\s+/g, "_")
    : "all_prince_frederick";
  return path.join(DATA_DIR, `${safeLabel}_${today}.json`);
}

/**
 * Append new data to a JSON file
 */
function appendToFile(filePath, data) {
  let existing = [];
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  const updated = [...existing, ...data];
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
}

/**
 * Fetch summaries for rooms with optional label filter
 */
async function fetchAndSave(floorLabel = "") {
  try {
    const rooms = await getRooms(floorLabel);
    if (rooms.length === 0) {
      console.warn("No rooms found for label:", floorLabel);
      return;
    }

    const summaries = await getRoomSummaries(rooms);

    const timestampedData = summaries.map((room) => ({
      timestamp: new Date().toISOString(),
      ...room,
    }));

    const outputFile = getDailyFile(floorLabel);
    appendToFile(outputFile, timestampedData);

    console.log(
      `${new Date().toISOString()} | Saved ${timestampedData.length} records for "${
        floorLabel || "all floors"
      }" to ${outputFile}`,
    );
  } catch (err) {
    console.error("Error fetching/saving data:", err);
  }
}

/**
 * Run the collector
 */
async function runCollector() {
  await fetchAndSave("Prince Frederick"); // all floors with Prince Frederick
  await fetchAndSave("Prince Frederick FL7"); // your floor
}

// Run only if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCollector();
}

export { runCollector };
