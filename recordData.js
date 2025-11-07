import fs from "fs";
import { getRooms, getRoomSummaries } from "./getInfo.js";

const OUTPUT_FILE = "./data/usage_data.json";
const INTERVAL_MINUTES = 30; // wash takes 30 and dry takes 60 so 45 could be more reliable?

/**
 * Fetch data for rooms (all or specific floor)
 * @param {string} floorLabel - optional, e.g., "Prince Frederick FL7"
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

    let existing = [];
    if (fs.existsSync(OUTPUT_FILE)) {
      existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    }

    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify([...existing, ...timestampedData], null, 2),
    );

    console.log(
      `${new Date().toISOString()} | Saved ${timestampedData.length} records for "${floorLabel || "all floors"}"`,
    );
  } catch (err) {
    console.error("Error fetching/saving data:", err);
  }
}

// Run immediately
fetchAndSave(); // all floors
// fetchAndSave("Prince Frederick"); // your floor

// Schedule repeated fetch every INTERVAL_MINUTES
// setInterval(() => fetchAndSave(), INTERVAL_MINUTES * 60 * 1000);
// setInterval(
//   () => fetchAndSave("Prince Frederick FL7"),
//   INTERVAL_MINUTES * 60 * 1000,
// );
