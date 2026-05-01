import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

code = code.replace(
  `className="relative w-screen h-screen bg-stone-950 flex flex-col items-center justify-center overflow-hidden text-stone-100 selection:bg-blue-500/30"`,
  `className="relative w-screen h-screen bg-stone-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black flex flex-col items-center justify-center overflow-hidden text-stone-100 selection:bg-blue-500/30"`
);

fs.writeFileSync("src/App.tsx", code);
