import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

code = code.replace(
  'className={`p-4 border rounded-xl font-sans text-sm text-left transition-colors flex items-center gap-4 ${inputMethod === \'CAMERA\' ? \'border-orange-500 bg-orange-50/50\' : \'border-stone-200 hover:bg-stone-50\'}`}',
  'className={`p-4 border rounded-xl font-sans text-sm text-left transition-colors flex items-center gap-4 ${inputMethod === \'CAMERA\' ? \'border-orange-500 bg-orange-950/50\' : \'border-stone-800 hover:bg-stone-800/50\'}`}'
);

code = code.replace(
  '<div className={`p-2 rounded-lg ${inputMethod === \'CAMERA\' ? \'bg-orange-100 text-orange-600\' : \'bg-stone-100 text-stone-400\'}`}>',
  '<div className={`p-2 rounded-lg ${inputMethod === \'CAMERA\' ? \'bg-orange-900 text-orange-400\' : \'bg-stone-800 text-stone-400\'}`}>'
);

code = code.replace(
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-100/90 backdrop-blur-md text-stone-100">',
  '<div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-950/80 backdrop-blur-md text-stone-100">'
);

code = code.replace(
  'bg-stone-100 text-stone-300 font-bold text-sm rounded shadow hover:bg-stone-200',
  'bg-stone-800 text-stone-300 font-bold text-sm rounded shadow hover:bg-stone-700'
);

code = code.replace(
  'bg-stone-100/90 backdrop-blur-sm',
  'bg-stone-950/80 backdrop-blur-sm'
);

fs.writeFileSync("src/App.tsx", code);
