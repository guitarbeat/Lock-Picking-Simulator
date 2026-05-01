import * as fs from "fs";

let appCode = fs.readFileSync("src/App.tsx", "utf-8");

// Move Tension Slider out of the top-left info panel
const infoPanelContent = `                    {/* Interactive Tension Slider */}
                    <div 
                        className="flex flex-col gap-2 w-48 bg-stone-900/90 p-4 rounded-xl border border-stone-800 shadow-xl backdrop-blur pointer-events-auto"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            e.currentTarget.setPointerCapture(e.pointerId);
                            // Calculate tension from click position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            manualInputRef.current.torque = val;
                        }}
                        onPointerMove={(e) => {
                            e.stopPropagation();
                            if ((e.buttons > 0 || e.pressure > 0) && e.currentTarget.hasPointerCapture(e.pointerId)) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                manualInputRef.current.torque = val;
                            }
                        }}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                            // User can hold it or maybe let go and it robs tension?
                            // Let's release tension when they lift finger.
                            // Actually, let's keep it sticky for mouse/touch until they click 0?
                            // No, lock picking requires continuous hold. Let's make it snap to 0 on release.
                            manualInputRef.current.torque = 0;
                        }}
                        onPointerCancel={(e) => {
                            e.stopPropagation();
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

// Replace it with empty in top-left
appCode = appCode.replace(infoPanelContent, "");

// Add to bottom left (we'll replace the <div></div> from the mobile control overlay)
const mobileRegex = /<div><\/div>/;

// Using a slightly adjusted layout for the tension slider so it replaces the mobile div nicely
// Wait, the mobile controls overlay has "md:hidden" so it only shows on mobile!
// We want this slider for both desktop and mobile, so we shouldn't put it in "md:hidden".
appCode = appCode.replace(mobileRegex, "");

// Add to a generic bottom-left container (outside md:hidden)
const newBottomLeft = `                {/* Shared Bottom Left Controls (Desktop + Mobile) */}
                <div className="absolute bottom-8 left-8 z-50 pointer-events-auto">
${infoPanelContent}
                </div>`;

const searchString = `{/* Mobile controls overlay */}`;

appCode = appCode.replace(searchString, `${newBottomLeft}\n\n                ${searchString}`);

fs.writeFileSync("src/App.tsx", appCode);
