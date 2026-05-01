import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

code = code.replace(
  /\s*return currentTime;\n\s*\};\n/,
  ""
);

code = code.replace(
  /\} \/\/ Check for success/,
  "//" // Check for success
);

code = code.replace(
  /\}\);\s*\/\/ Delay/g,
  "\/\/ Delay"
);

fs.writeFileSync("src/App.tsx", code);
