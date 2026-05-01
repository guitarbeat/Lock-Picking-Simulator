import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

// replace manualInputRef to add pointerId
code = code.replace(
  'const manualInputRef = useRef({ active: false, x: 0.8, y: 0.5, torque: 0, isMouseDown: false, touchStartX: 0, touchStartY: 0, pickStartX: 0, pickStartY: 0 });',
  'const manualInputRef = useRef({ active: false, x: 0.8, y: 0.5, torque: 0, isMouseDown: false, touchStartX: 0, touchStartY: 0, pickStartX: 0, pickStartY: 0, pointerId: -1 });'
);

// replace handleMouseMove with new pointer handlers
const oldHandlers = `  const handleMouseMove = (e: React.MouseEvent) => {
      manualInputRef.current.active = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      let y = (e.clientY - rect.top) / rect.height;
      
      // If mouse is down, map dragging to Y lift and also X movement
      if (manualInputRef.current.isMouseDown) {
         // Y mapped 0 to 1
         manualInputRef.current.x = x;
         manualInputRef.current.y = y;
      } else {
         // Just moving around without lifting
         manualInputRef.current.x = x;
         manualInputRef.current.y = 0.5; // Rest position vertically
      }
  };`;

const newHandlers = `  const handlePointerDown = (e: React.PointerEvent) => {
    manualInputRef.current.active = true;
    manualInputRef.current.pointerId = e.pointerId;
    manualInputRef.current.isMouseDown = true;
    
    if (e.pointerType === 'mouse') {
        const rect = e.currentTarget.getBoundingClientRect();
        manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
        manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
    } else {
        manualInputRef.current.touchStartX = e.clientX;
        manualInputRef.current.touchStartY = e.clientY;
        manualInputRef.current.pickStartX = manualInputRef.current.x;
        manualInputRef.current.pickStartY = 0.5;
        manualInputRef.current.y = 0.5;
    }
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      manualInputRef.current.active = true;
      if (e.pointerType === 'mouse') {
          const rect = e.currentTarget.getBoundingClientRect();
          manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
          if (manualInputRef.current.isMouseDown) {
              manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
          } else {
              manualInputRef.current.y = 0.5;
          }
      } else {
          if (manualInputRef.current.isMouseDown && e.pointerId === manualInputRef.current.pointerId) {
             const rect = e.currentTarget.getBoundingClientRect();
             const dx = (e.clientX - manualInputRef.current.touchStartX) / rect.width;
             const dy = (e.clientY - manualInputRef.current.touchStartY) / rect.height;
             const sensitivityX = 2.0;
             const sensitivityY = 2.0;
             manualInputRef.current.x = Math.max(0, Math.min(1, manualInputRef.current.pickStartX + dx * sensitivityX));
             manualInputRef.current.y = Math.max(0, Math.min(1, manualInputRef.current.pickStartY + dy * sensitivityY));
          }
      }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (e.pointerId === manualInputRef.current.pointerId) {
          manualInputRef.current.isMouseDown = false;
          manualInputRef.current.y = 0.5;
      }
  };`;

code = code.replace(oldHandlers, newHandlers);

const oldDivEvents = `        onMouseMove={handleMouseMove}
        onMouseDown={() => { manualInputRef.current.isMouseDown = true; }}
        onMouseUp={() => { manualInputRef.current.isMouseDown = false; }}
        onMouseLeave={() => { manualInputRef.current.isMouseDown = false; }}
        onTouchMove={(e) => {
            manualInputRef.current.active = true;
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            if (manualInputRef.current.isMouseDown) {
               const dx = (touch.clientX - manualInputRef.current.touchStartX) / rect.width;
               const dy = (touch.clientY - manualInputRef.current.touchStartY) / rect.height;
               const sensitivity = 1.5;
               manualInputRef.current.x = Math.max(0, Math.min(1, manualInputRef.current.pickStartX + dx * sensitivity));
               manualInputRef.current.y = Math.max(0, Math.min(1, manualInputRef.current.pickStartY + dy * sensitivity));
            }
        }}
        onTouchStart={(e) => { 
            manualInputRef.current.active = true; 
            manualInputRef.current.isMouseDown = true;
            const touch = e.touches[0];
            manualInputRef.current.touchStartX = touch.clientX;
            manualInputRef.current.touchStartY = touch.clientY;
            manualInputRef.current.pickStartX = manualInputRef.current.x;
            manualInputRef.current.pickStartY = manualInputRef.current.y;
        }}
        onTouchEnd={() => { 
            manualInputRef.current.isMouseDown = false; 
            manualInputRef.current.y = 0.5; // Rest pick when releasing touch
        }}
        onTouchCancel={() => { 
            manualInputRef.current.isMouseDown = false; 
            manualInputRef.current.y = 0.5; 
        }}`;

const newDivEvents = `        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}`;

code = code.replace(oldDivEvents, newDivEvents);

// Also change Mobile Buttons so they react cleanly without triggering parent pointer events.
// Use onPointerDown instead of onTouchStart / onMouseDown
const oldTension = `onTouchStart={(e) => { e.preventDefault(); manualInputRef.current.torque = 1; }}
                            onTouchEnd={(e) => { e.preventDefault(); manualInputRef.current.torque = 0; }}
                            onMouseDown={(e) => { e.preventDefault(); manualInputRef.current.torque = 1; }}
                            onMouseUp={(e) => { e.preventDefault(); manualInputRef.current.torque = 0; }}`;

const newTension = `onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); manualInputRef.current.torque = 1; }}
                            onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); manualInputRef.current.torque = 0; }}
                            onPointerCancel={(e) => { e.preventDefault(); e.stopPropagation(); manualInputRef.current.torque = 0; }}
                            onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); manualInputRef.current.torque = 0; }}`;

code = code.replace(oldTension, newTension);

// Tool cycle button
const oldTool = `onClick={() => {
                               setCurrentPick(prev => {
                                   const idx = PICK_TOOLS.findIndex(p => p.id === prev.id);
                                   return PICK_TOOLS[(idx + 1) % PICK_TOOLS.length];
                               });
                            }}`;

const newTool = `onPointerDown={(e) => {
                               e.preventDefault(); 
                               e.stopPropagation();
                               setCurrentPick(prev => {
                                   const idx = PICK_TOOLS.findIndex(p => p.id === prev.id);
                                   return PICK_TOOLS[(idx + 1) % PICK_TOOLS.length];
                               });
                            }}`;

code = code.replace(oldTool, newTool);

fs.writeFileSync("src/App.tsx", code);
