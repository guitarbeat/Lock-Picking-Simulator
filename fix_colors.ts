import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

// Change main container
code = code.replace(
  'className="relative w-screen h-screen bg-stone-50 flex flex-col items-center justify-center overflow-hidden text-stone-900 selection:bg-blue-500/30"',
  'className="relative w-screen h-screen bg-stone-950 flex flex-col items-center justify-center overflow-hidden text-stone-100 selection:bg-blue-500/30"'
);

code = code.replace(
  'className="relative w-full h-full bg-stone-50 overflow-hidden touch-none"',
  'className="relative w-full h-full bg-stone-950 overflow-hidden touch-none"'
);

// Change menu
code = code.replace(
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-stone-50">',
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-stone-950/80 backdrop-blur-sm">'
);

// Level select items
code = code.replace(
  'className="bg-white border border-stone-200 p-6 rounded-xl w-full mb-8 text-left shadow-sm"',
  'className="bg-stone-900 border border-stone-800 p-6 rounded-xl w-full mb-8 text-left shadow-2xl"'
);

// Camera feed
code = code.replace(
  '<div className={`absolute bottom-4 left-4 w-56 bg-white rounded-lg shadow-xl border border-stone-200',
  '<div className={`absolute bottom-4 left-4 w-56 bg-stone-900 rounded-lg shadow-2xl border border-stone-800'
);
code = code.replace(
  '<div className="bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600',
  '<div className="bg-stone-950 px-3 py-2 text-xs font-bold text-stone-400'
);

// Level text colors
code = code.replace(
  /text-stone-900/g,
  'text-stone-100'
);
code = code.replace(
  /text-stone-600/g,
  'text-stone-300'
);
code = code.replace(
  /text-stone-500/g,
  'text-stone-400'
);

// Input method buttons
code = code.replace(
  'border-orange-500 bg-orange-50/50',
  'border-orange-500 bg-orange-950/50'
);
code = code.replace(
  'bg-orange-100 text-orange-600',
  'bg-orange-900 text-orange-400'
);

code = code.replace(
  'border-stone-200 hover:bg-stone-50',
  'border-stone-800 hover:bg-stone-800/50'
);
code = code.replace(
  'bg-stone-100 text-stone-400', // Note text-stone-400 here because of above replace
  'bg-stone-800 text-stone-400'
);

// Start button
code = code.replace(
  'bg-stone-900 text-white rounded-xl font-sans font-bold hover:bg-stone-800',
  'bg-stone-100 text-stone-900 rounded-xl font-sans font-bold hover:bg-white'
);

// Corner status chips
code = code.replace(
  /bg-white\/90 px-3 py-2 rounded-lg border border-stone-200/g,
  'bg-stone-900/90 px-3 py-2 rounded-lg border border-stone-800'
);

code = code.replace(
  'bg-white/90 border border-stone-200 px-4 py-2 rounded-lg text-stone-300 hover:text-stone-100 hover:bg-white',
  'bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800'
);
code = code.replace(
  'bg-white/90 border border-stone-200 px-4 py-2 rounded-lg text-stone-300 hover:text-stone-100 hover:bg-white',
  'bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800'
);

fs.writeFileSync("src/App.tsx", code);
