import { getRooms, getRoomSummaries, getMachines } from "./getInfo.js";

const rooms = await getRooms("Prince Frederick FL7");
const machines = await getMachines(rooms[0].roomId);

const washingMachine = [" ✅  ", "╔═══╗", "╔═══╗", "║🫧 ║", "╚═══╝"];

const dryingMachine = [" ✅  ", "╔═══╗", "╔═══╗", "║🔥 ║", "╚═══╝"];

function addHeader(machine, header) {
  if (header.includes("✅") && machine[0].includes("✅")) {
    return machine;
  }

  const block = [...machine];

  const blockWidth = block[1].length;

  const headerStr = header.toString();
  const headerLength = headerStr.length;

  const totalPadding = blockWidth - headerLength;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  block[0] = " ".repeat(leftPadding) + headerStr + " ".repeat(rightPadding);

  return block;
}

function combineBlocks(...blocks) {
  const lines = Array(blocks[0].length).fill("");

  for (const block of blocks) {
    block.forEach((part, i) => {
      lines[i] += part;
    });
  }

  return lines;
}

let washingMachines = [];
let dryingMachines = [];

machines.forEach((machine) => {
  let text = addHeader(
    machine.type === "washer" ? washingMachine : dryingMachine,
    machine.available ? "✅" : machine.timeRemaining + "m",
  );
  if (machine.type === "washer") {
    washingMachines.push(text);
  } else {
    dryingMachines.push(text);
  }
});

console.log(combineBlocks(...washingMachines).join("\n"));

console.log(combineBlocks(...dryingMachines).join("\n"));
