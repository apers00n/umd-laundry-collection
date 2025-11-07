import {
  getRooms,
  getRoomSummaries,
  getMachines,
  sortRoomsByLabel,
} from "./getInfo.js";
import { printLaundry } from "./getLaundry.js";

const rooms = sortRoomsByLabel(await getRooms("Prince Frederick"));

for (const room of rooms) {
  console.log(room.label);
  console.log("---------------------------");
  const machines = await getMachines(room.roomId);
  printLaundry(machines);
  console.log("\n\n");
}
