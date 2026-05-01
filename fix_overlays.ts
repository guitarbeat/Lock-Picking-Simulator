import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

code = code.replace(
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-100/90 backdrop-blur-md text-stone-100">',
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-950/80 backdrop-blur-md text-stone-100">'
);
code = code.replace(
  '<div className="bg-white p-8 rounded-xl border border-stone-200 shadow-2xl',
  '<div className="bg-stone-900 p-8 rounded-xl border border-stone-800 shadow-2xl'
);
code = code.replace(
  'bg-stone-100 text-stone-300 font-bold text-sm rounded shadow mt-4 hover:bg-stone-800',
  'bg-stone-100 text-stone-900 font-bold text-sm rounded shadow mt-4 hover:bg-white'
);

code = code.replace(
  '<p className="mb-8  text-xs text-stone-300   bg-white p-4 border border-stone-200 text-center">',
  '<p className="mb-8  text-xs text-stone-400   bg-stone-900 p-4 border border-stone-800 text-center rounded-lg">'
);

fs.writeFileSync("src/App.tsx", code);
