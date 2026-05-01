import * as fs from "fs";

let code = fs.readFileSync("src/components/GameCanvas.tsx", "utf-8");

const oldDrawBurst = `  const drawBurst = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.8, 0.8);
    
    ctx.fillStyle = color;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    const spikes = 12;
    const outerRadius = 25;
    const innerRadius = 15;
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes;
        
        // Add some jitter
        const r = radius + (Math.sin(time * 0.05 + i) * 3);
        
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };`;

const newDrawLabel = `  const drawLabel = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string, pulse: boolean = false) => {
    ctx.save();
    ctx.translate(x, y);
    
    if (pulse) {
        const scale = 1 + Math.sin(time * 0.01) * 0.05;
        ctx.scale(scale, scale);
    }
    
    // Draw pill background
    const padX = 8;
    const padY = 4;
    ctx.font = 'bold 12px "Inter", "JetBrains Mono", sans-serif';
    const metrics = ctx.measureText(text);
    const tw = metrics.width;
    const th = 12;
    
    ctx.fillStyle = color + 'E6'; // 90% opacity
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    
    const rw = tw + padX * 2;
    const rh = th + padY * 2;
    
    ctx.beginPath();
    ctx.roundRect(-rw/2, -rh/2, rw, rh, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Sharp white text
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, 0, 1); // 1px offset for visual center
    
    ctx.restore();
  };`;

code = code.replace(oldDrawBurst, newDrawLabel);

// Change the calls
code = code.replace(
  `drawBurst(ctx, x + w/2, keyY + pin.keyPinHeight + 10, 'SNAP!', '#eab308');`,
  `drawLabel(ctx, x + w/2, y - liftPx + 20, 'SET ✓', '#059669', false);` // emerald-600
);

code = code.replace(
  `drawBurst(ctx, x + w/2, driverY + pin.driverPinHeight/2, 'BIND', '#06b6d4');`,
  `drawLabel(ctx, x + w/2, y - liftPx + 20, 'BINDING', '#d97706', true);` // amber-600
);

code = code.replace(
  `drawBurst(ctx, x + w/2, driverY + pin.driverPinHeight/2, 'CLICK', '#f97316');`,
  `drawLabel(ctx, x + w/2, y - liftPx + 20, 'FALSE SET', '#9333ea', false);` // purple-600
);

// Add Overset label
const oldPinStateRenderEnd = `    } else if (pin.state === PinState.FALSE_SET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'FALSE SET', '#9333ea', false);
    }`;

const newPinStateRenderEnd = `    } else if (pin.state === PinState.FALSE_SET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'FALSE SET', '#9333ea', false);
    } else if (pin.state === PinState.OVERSET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'OVERSET x', '#dc2626', true);
    }`;

code = code.replace(oldPinStateRenderEnd, newPinStateRenderEnd);

fs.writeFileSync("src/components/GameCanvas.tsx", code);
