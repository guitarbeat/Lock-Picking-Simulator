import React from "react";

interface GuideOverlayProps {
    onClose: () => void;
}

export const GuideOverlay: React.FC<GuideOverlayProps> = ({ onClose }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-[200] p-4 pointer-events-auto">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            ></div>
            
            {/* Modal */}
            <div className="bg-stone-900 border border-stone-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                    <h2 className="text-xl font-bold text-stone-100 flex items-center gap-3">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Lockpicking Field Guide
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-stone-400 hover:text-white p-2 rounded-lg hover:bg-stone-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 text-stone-300">
                    
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono text-sm">01</span>
                            The Anatomy of a Lock
                        </h3>
                        <p className="leading-relaxed">
                            A standard pin-tumbler lock consists of a <strong>plug</strong> (the part that turns), housed within a <strong>shell</strong>. Interlocking them are pairs of pins:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-stone-600">
                            <li><strong className="text-stone-200">Key Pins (Bottom Pins):</strong> Rest against the key. They come in varying lengths. In this simulator, they are the lower brass pins.</li>
                            <li><strong className="text-stone-200">Driver Pins (Top Pins):</strong> Pressed down by springs. Usually uniform in length. In this simulator, they are the upper steel pins.</li>
                            <li><strong className="text-stone-200">The Shear Line:</strong> The gap between the plug and the shell. The lock turns only when all pin pairs separate exactly at this line.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono text-sm">02</span>
                            Tension & Binding Order
                        </h3>
                        <p className="leading-relaxed">
                            Because manufacturing is never perfect, the holes in the plug don't align perfectly with the shell. When you apply rotational tension to the plug (using a tension wrench), one pin stack will get pinched or <strong>bind</strong> before the others.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-stone-600">
                            <li><strong className="text-emerald-400">Binding Order:</strong> You must find the binding pin first. A binding pin feels stiff and resists being pushed up. Non-binding pins feel springy.</li>
                            <li><strong className="text-emerald-400">Light Tension:</strong> If you use too much tension, the binding pin will be trapped and cannot be lifted. Too little tension, and the pins will just drop back down when you release them.</li>
                            <li><strong>The Click:</strong> When you lift a binding pin to the shear line, the plug rotates slightly, trapping the driver pin above the plug. You will feel a crisp "click" and see <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded text-xs">SET</span>. The next pin in the sequence will now bind.</li>
                        </ul>
                    </section>
                    
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono text-sm">03</span>
                            Oversetting
                        </h3>
                        <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg text-red-200 leading-relaxed">
                            <p>
                                If you push a pin <em>too high</em>, you push the <strong>Key Pin</strong> up exactly into the shear line, locking the plug again. This is called an <strong>Overset</strong>. 
                            </p>
                            <p className="mt-2 text-sm text-red-300">
                                In the real world, you have to release tension slightly to drop the overset pin, which usually drops your set pins too. In this simulator, overset pins are marked <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded text-xs font-bold">OVERSET x</span>. You must release tension entirely to reset all pins if you overset.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono text-sm">04</span>
                            Security Pins (Spool & Serrated)
                        </h3>
                        <p className="leading-relaxed">
                            To make locks harder to pick, manufacturers alter the shape of the Driver Pins.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700/50">
                                <h4 className="font-bold text-stone-200 mb-2">Spool Pins</h4>
                                <p className="text-sm">Shaped like a dumbbell. When they bind, the narrow middle section gets caught in the shear line. This causes the plug to rotate deeply, known as a <span className="bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded text-xs font-bold">FALSE SET</span>. To set a spool, you must gently lift it—you will feel the plug push backwards against your tension wrench (counter-rotation) until it clicks into place.</p>
                            </div>
                            <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700/50">
                                <h4 className="font-bold text-stone-200 mb-2">Serrated Pins</h4>
                                <p className="text-sm">Covered in tiny ridges. Lifting a serrated pin causes a series of tiny clicks that feel exactly like setting a normal pin. You must count the clicks or feel the difference between a serrated click and a true set.</p>
                            </div>
                        </div>
                    </section>
                    
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono text-sm">05</span>
                            How to Play
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 marker:text-stone-600">
                            <li><strong>Apply Tension:</strong> Use the Tension slider (or your left hand tilting your phone if on mobile/accel) to apply gentle torque. <em>Aim for 30-50% for binding.</em></li>
                            <li><strong>Find the Binder:</strong> Move your pick underneath the pins and probe them. Look for the label <span className="bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded text-xs font-bold">BINDING</span>.</li>
                            <li><strong>Lift Carefully:</strong> Push the binding pin up until it <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded text-xs">SET ✓</span>s.</li>
                            <li><strong>Find the Next:</strong> Once a pin is set, probe the remaining pins to find the next one that is binding. Repeat until unlocked.</li>
                            <li><strong>Too High?:</strong> If you hit <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded text-xs font-bold">OVERSET x</span>, you must release all tension to 0% and start over.</li>
                        </ul>
                    </section>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-stone-800 bg-stone-900/80 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-500 transition-colors shadow-lg"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
