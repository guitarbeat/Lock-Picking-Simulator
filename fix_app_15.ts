import * as fs from "fs";

let lines = fs.readFileSync("src/App.tsx", "utf-8").split("\n");

// delete lines 161 to 165 (index 161 to 165)
lines.splice(161, 5);

fs.writeFileSync("src/App.tsx", lines.join("\n"));
