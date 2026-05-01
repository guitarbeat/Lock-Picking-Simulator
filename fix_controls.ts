import * as fs from "fs";

let appCode = fs.readFileSync("src/App.tsx", "utf-8");

// 1. Add import for EducationalTip
appCode = appCode.replace(
  "import GameCanvas from './components/GameCanvas';",
  "import GameCanvas from './components/GameCanvas';\nimport EducationalTip from './components/EducationalTip';"
);

// 2. Add the EducationalTip inside the PLAYING state wrapper
// Look for where GameCanvas is rendered and insert the Tip over it.
const playingStateStart = `{gameState === GameState.PLAYING && (
            <div className="absolute inset-0 z-10 pointer-events-none">`;

const playingStateReplacement = `{gameState === GameState.PLAYING && (
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Educational Tip */}
                <div className="absolute top-20 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                    <EducationalTip lockState={lockState} inputMethod={inputMethod} />
                </div>`;

appCode = appCode.replace(playingStateStart, playingStateReplacement);

// 3. Replace the TENSION button with a Tension Slider hook
// Look for the Tension Level Display. I will replace it with an interactive Tension Slider.
// We are going to replace the Mobile "HOLD TENSION" button and the "Tension Level Display" with a unified, 
// interactive slider that works for all input methods (mouse, touch).

// First, remove the old Tension Level Display
const oldTensionDisplay = `                    {/* Tension Level Display */}
                    <div className="flex flex-col gap-1 w-48 bg-stone-900/90 p-3 rounded-lg border border-stone-800 shadow-sm backdrop-blur">
                        <div className="flex justify-between items-center text-xs text-stone-300 font-bold font-sans">
                           <span className="flex items-center gap-1">
                               <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                               </svg>
                               TENSION
                           </span>
                           <span>{ (lockState.totalTorque * 100).toFixed(0) }%</span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-orange-500 transition-all duration-75"
                                style={{ width: \`\${lockState.totalTorque * 100}%\` }}
                            ></div>
                        </div>
                    </div>`;

// Replace it with an interactive slider
const newTensionSlider = `                    {/* Interactive Tension Slider */}
                    <div 
                        className="flex flex-col gap-2 w-48 bg-stone-900/90 p-4 rounded-xl border border-stone-800 shadow-xl backdrop-blur pointer-events-auto"
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            // Calculate tension from click position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            manualInputRef.current.torque = val;
                        }}
                        onPointerMove={(e) => {
                            if (e.buttons > 0 || e.pressure > 0) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                manualInputRef.current.torque = val;
                            }
                        }}
                        onPointerUp={(e) => {
                            // User can hold it or maybe let go and it robs tension?
                            // Let's release tension when they lift finger.
                            // Actually, let's keep it sticky for mouse/touch until they click 0?
                            // No, lock picking requires continuous hold. Let's make it snap to 0 on release.
                            manualInputRef.current.torque = 0;
                        }}
                        onPointerCancel={(e) => {
                            manualInputRef.current.torque = 0;
                        }}
                    >
                        <div className="flex justify-between items-center text-xs text-stone-300 font-bold font-sans select-none">
                           <span className="flex items-center gap-1">
                               <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                               </svg>
                               TENSION
                           </span>
                           <span>{ (lockState.totalTorque * 100).toFixed(0) }%</span>
                        </div>
                        <div className="h-6 w-full bg-stone-800 rounded-full overflow-hidden relative cursor-crosshair">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-none pointer-events-none"
                                style={{ width: \`\${lockState.totalTorque * 100}%\` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-bold text-white/50 pointer-events-none tracking-widest">
                                Drag to Apply
                            </div>
                        </div>
                        <div className="text-[10px] text-stone-500 text-center leading-tight">
                            Tension is required to bind pins. Too much will trap them.
                        </div>
                    </div>`;

appCode = appCode.replace(oldTensionDisplay, newTensionSlider);

// Now remove the mobile holding button since the slider handles it.
const mobileControlRegex = /<button \n                            className="bg-white\/10 backdrop-blur-md border border-white\/20 text-white w-24 h-24 rounded-full shadow-2xl flex flex-col items-center justify-center pointer-events-auto active:bg-orange-500\/80 active:scale-95 transition-all select-none"\n                            onPointerDown=\{\(e\) => \{ e\.currentTarget\.setPointerCapture\(e\.pointerId\); e\.preventDefault\(\); e\.stopPropagation\(\); manualInputRef\.current\.torque = 1; \}\}\n                            onPointerUp=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); manualInputRef\.current\.torque = 0; \}\}\n                            onPointerCancel=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); manualInputRef\.current\.torque = 0; \}\}\n                            onPointerLeave=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); manualInputRef\.current\.torque = 0; \}\}\n                            onContextMenu=\{\(e\) => e\.preventDefault\(\)\}\n                        >\n                            <span className="text-xs font-bold font-sans tracking-widest opacity-80 mt-1">HOLD<\/span>\n                            <span className="text-sm font-bold font-sans">TENSION<\/span>\n                        <\/button>/g;

appCode = appCode.replace(mobileControlRegex, `<div></div>`);

fs.writeFileSync("src/App.tsx", appCode);
