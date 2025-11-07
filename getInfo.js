const UMD_LOCATION_ID = "fc5cd0de-25c6-4d33-afc4-c420156e9a3e";
const BASE_URL = "https://mycscgo.com/api/v3/location/" + UMD_LOCATION_ID;

/**
 * Fetch all rooms and return only those with optional label
 */
export async function getRooms(label = "") {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Error fetching location: ${res.status}`);
  const data = await res.json();

  return data.rooms
    .filter((room) => room.label.includes(label))
    .map((room) => ({ label: room.label, roomId: room.roomId }));
}

/**
 * Fetch summaries for each room and return structured data
 * @param {Array} rooms - Array of objects with {label, roomId}
 */
export async function getRoomSummaries(rooms) {
  const results = await Promise.all(
    rooms.map(async (room) => {
      const summaryRes = await fetch(`${BASE_URL}/room/${room.roomId}/summary`);
      if (!summaryRes.ok) throw new Error(`Error fetching room ${room.roomId}`);
      const summary = await summaryRes.json();

      return {
        label: summary.roomLabel,
        roomId: summary.roomId,
        washers: {
          available: summary.washers.available,
          total: summary.washers.total,
        },
        dryers: {
          available: summary.dryers.available,
          total: summary.dryers.total,
        },
      };
    }),
  );

  return results;
}

/**
 * Sort a list of rooms by ascending label
 * @param {Array} rooms - Array of room objects with a 'label' property
 */
export function sortRoomsByLabel(rooms) {
  return rooms.slice().sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Sort rooms by washers:
 * 1. Available washers (descending)
 * 2. Total washers (descending)
 * 3. Label (ascending)
 */
export function sortRoomsByWashers(rooms) {
  return rooms.slice().sort((a, b) => {
    if (b.washers.available !== a.washers.available) {
      return b.washers.available - a.washers.available; // most available first
    }
    if (b.washers.total !== a.washers.total) {
      return b.washers.total - a.washers.total; // then most total first
    }
    return a.label.localeCompare(b.label); // then alphabetical
  });
}

/**
 * Sort rooms by dryers:
 * 1. Available dryers (descending)
 * 2. Total dryers (descending)
 * 3. Label (ascending)
 */
export function sortRoomsByDryers(rooms) {
  return rooms.slice().sort((a, b) => {
    if (b.dryers.available !== a.dryers.available) {
      return b.dryers.available - a.dryers.available; // most available first
    }
    if (b.dryers.total !== a.dryers.total) {
      return b.dryers.total - a.dryers.total; // then most total first
    }
    return a.label.localeCompare(b.label); // then alphabetical
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Example usage:
  (async () => {
    try {
      const filteredRooms = await getRooms("Prince Frederick");
      const summaries = await getRoomSummaries(filteredRooms);
      const sortedLabel = sortRoomsByLabel(summaries);
      const sortedDryer = sortRoomsByDryers(sortedLabel);
      const sortedWasher = sortRoomsByWashers(sortedLabel);

      console.log("LABEL: ");
      console.log(JSON.stringify(sortedLabel, null, 2));
      console.log("DRYER: ");
      console.log(JSON.stringify(sortedDryer, null, 2));

      console.log("WASHER: ");
      console.log(JSON.stringify(sortedWasher, null, 2));
    } catch (err) {
      console.error("Error:", err);
    }
  })();
}
