
import React, { useRef, useEffect } from 'react';
import { LockState, Pin, PinState, PickTool, PickShape, ViewMode } from '../types';
import { COLORS, DIMENSIONS } from '../constants';

interface GameCanvasProps {
  gameState: LockState;
  currentPick: PickTool;
  viewMode?: ViewMode;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, currentPick, viewMode = ViewMode.SIDE }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper: Draw comic-style burst for BIND/SNAP
  const drawBurst = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) => {
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
        const ptX = Math.cos(angle) * radius;
        const ptY = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(ptX, ptY);
        else ctx.lineTo(ptX, ptY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const drawPickHead = (ctx: CanvasRenderingContext2D, x: number, y: number, type: PickShape) => {
    ctx.save();
    ctx.beginPath();
    
    ctx.moveTo(x, y); 
    ctx.quadraticCurveTo(x, y + 12, x - 15, y + 15);
    ctx.lineTo(x - 300, y + 15);
    ctx.lineTo(x - 300, y + 22);
    ctx.lineTo(x - 20, y + 22);
    ctx.quadraticCurveTo(x - 2, y + 22, x, y + 8);
    ctx.lineTo(x, y);
    ctx.closePath();
    
    // Metallic horizontal gradient for the pick
    const grad = ctx.createLinearGradient(0, y - 5, 0, y + 25);
    grad.addColorStop(0, '#52525b');
    grad.addColorStop(0.3, '#fdfcfb'); // Shiny top edge
    grad.addColorStop(0.6, '#a1a1aa');
    grad.addColorStop(0.8, '#52525b');
    grad.addColorStop(1, '#27272a'); // Dark bottom edge
    
    // Shadow for pick to show depth
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#27272a';
    ctx.stroke();
    
    ctx.restore();
    return { x: x - 20, y: y + 20 };
  };

  const drawPinStack = (ctx: CanvasRenderingContext2D, x: number, y: number, pin: Pin, time: number) => {
    let visualOffsetY = 0;
    if (pin.state === PinState.RESTING && pin.currentLift < 0.05) {
        const t = time * 0.002;
        const phase = pin.id * 1337;
        visualOffsetY = (Math.sin(t + phase) + Math.sin(t * 1.5 + phase)) * 0.5; // subtle breathing
    }

    const liftPx = (pin.currentLift * DIMENSIONS.pinMaxLift) - visualOffsetY;
    const padding = 2;
    const w = DIMENSIONS.pinWidth;
    
    // --- SPRING ---
    const springTopY = y - 100; 
    const driverTopY = y - liftPx - pin.driverPinHeight;
    const springHeight = Math.max(0, driverTopY - springTopY);

    ctx.strokeStyle = '#b87754'; // copper color
    ctx.lineWidth = 1;
    ctx.beginPath();
    const coilSpacing = 4;
    const coils = Math.max(3, Math.floor(springHeight / coilSpacing));
    const coilHeight = springHeight / coils;
    
    ctx.moveTo(x + 2, springTopY);
    if (springHeight > 5) {
        for(let i=0; i<coils; i++) {
            const cy = springTopY + (i * coilHeight);
            ctx.lineTo(x + w - 2, cy + (coilHeight * 0.5));
            ctx.lineTo(x + 2, cy + coilHeight);
        }
    } else {
        ctx.lineTo(x + w - 2, springTopY + springHeight);
    }
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#004890'; // dark blue outline

    // --- DRIVER PIN ---
    const driverY = y - liftPx - pin.driverPinHeight;
    
    // Gradient for driver pin
    const driverGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    driverGrad.addColorStop(0, '#005CE6'); // darker blue
    driverGrad.addColorStop(0.3, '#3399FF'); // highlight
    driverGrad.addColorStop(1, '#005CE6');
    
    ctx.fillStyle = driverGrad;
    
    // Simple flat driver pin with rounded edges
    const cornerRadius = 2;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, driverY);
    ctx.lineTo(x + w - cornerRadius, driverY);
    ctx.quadraticCurveTo(x + w, driverY, x + w, driverY + cornerRadius);
    ctx.lineTo(x + w, driverY + pin.driverPinHeight - cornerRadius);
    ctx.quadraticCurveTo(x + w, driverY + pin.driverPinHeight, x + w - cornerRadius, driverY + pin.driverPinHeight);
    ctx.lineTo(x + cornerRadius, driverY + pin.driverPinHeight);
    ctx.quadraticCurveTo(x, driverY + pin.driverPinHeight, x, driverY + pin.driverPinHeight - cornerRadius);
    ctx.lineTo(x, driverY + cornerRadius);
    ctx.quadraticCurveTo(x, driverY, x + cornerRadius, driverY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- KEY PIN ---
    const keyY = y - liftPx;
    ctx.strokeStyle = '#8A0000'; // dark red outline
    
    const keyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    keyGrad.addColorStop(0, '#E60000');
    keyGrad.addColorStop(0.3, '#FF4D4D');
    keyGrad.addColorStop(1, '#E60000');
    
    ctx.fillStyle = keyGrad;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, keyY); // Top flat
    ctx.lineTo(x + w - cornerRadius, keyY);
    ctx.quadraticCurveTo(x + w, keyY, x + w, keyY + cornerRadius);
    
    // Go down to the tip
    ctx.lineTo(x + w, keyY + pin.keyPinHeight - 8);
    // Tip angle
    ctx.lineTo(x + w/2, keyY + pin.keyPinHeight); // Pointed tip
    ctx.lineTo(x, keyY + pin.keyPinHeight - 8);
    
    ctx.lineTo(x, keyY + cornerRadius);
    ctx.quadraticCurveTo(x, keyY, x + cornerRadius, keyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Feedback Bursts
    if (pin.state === PinState.SET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'SET ✓', '#059669', false);
    } else if (pin.state === PinState.BINDING) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'BINDING', '#d97706', true);
    } else if (pin.state === PinState.FALSE_SET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'FALSE SET', '#9333ea', false);
    } else if (pin.state === PinState.OVERSET) {
        drawLabel(ctx, x + w/2, y - liftPx + 20, 'OVERSET x', '#dc2626', true);
    }
  };

  const drawTorqueWrench = (ctx: CanvasRenderingContext2D, torque: number, lockX: number, lockY: number) => {
    ctx.save();
    // Tension wrench at bottom of plug
    const plugCenterX = lockX + DIMENSIONS.lockWidth/2;
    const plugCenterY = lockY + 25;
    
    ctx.translate(plugCenterX, plugCenterY + 40);
    // Slight visible bend/rotation based on torque
    ctx.rotate(torque * 0.2); 

    const wrenchGrad = ctx.createLinearGradient(-10, 0, 10, 0);
    wrenchGrad.addColorStop(0, '#78716c');
    wrenchGrad.addColorStop(0.5, '#a8a29e');
    wrenchGrad.addColorStop(1, '#78716c');
    
    ctx.fillStyle = wrenchGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.rect(-10, -5, 20, 10); // Inserted part
    ctx.rect(-10, 5, 10, 150); // Handle hanging down
    ctx.fill();
    ctx.stroke();
    
    if (torque > 0) {
        // Draw tension arrow beside the wrench
        const arrowLength = 20 + (torque * 60);
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(15, 80 - arrowLength/2);
        ctx.lineTo(15, 80 + arrowLength/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(10, 80 + arrowLength/2 - 5);
        ctx.lineTo(20, 80 + arrowLength/2 - 5);
        ctx.lineTo(15, 80 + arrowLength/2 + 5);
        ctx.fill();
    }
    
    ctx.restore();
  };

  const renderFrontView = (ctx: CanvasRenderingContext2D, time: number) => {
    const cx = 400;
    const cy = 300;
    const outerRadius = 150;
    const innerRadius = 80;

    // Housing Base - Brushed Steel ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;
    
    const hGrad = ctx.createLinearGradient(cx - outerRadius, cy - outerRadius, cx + outerRadius, cy + outerRadius);
    hGrad.addColorStop(0.0, '#78716c');
    hGrad.addColorStop(0.2, '#d6d3d1');
    hGrad.addColorStop(0.5, '#78716c');
    hGrad.addColorStop(0.9, '#44403c');
    hGrad.addColorStop(1.0, '#292524');
    
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // Inner bevel for housing
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Plug (Brass)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(gameState.coreRotation * Math.PI / 180);

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    
    // Deep dark ring around the plug (shear line)
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    const goldGrad = ctx.createRadialGradient(0, -innerRadius/2, 10, 0, 0, innerRadius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#eab308');
    goldGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Keyway
    ctx.fillStyle = '#0a0a0a'; // Bright white/empty space inside keyway
    ctx.beginPath();
    // Complex keyway shape based on typical PSD representation
    ctx.moveTo(-5, -50);
    ctx.lineTo(5, -50);
    ctx.lineTo(5, -15);
    ctx.lineTo(15, -5);
    ctx.lineTo(15, 10);
    ctx.lineTo(5, 20);
    ctx.lineTo(15, 30);
    ctx.lineTo(5, 50);
    ctx.lineTo(-5, 50);
    ctx.lineTo(-5, 30);
    ctx.lineTo(-15, 20);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-15, -5);
    ctx.lineTo(-5, -15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Show currently active pin if we can see inside keyway (simplified)
    // Draw Tension Wrench if torque > 0
    if (gameState.totalTorque > 0) {
        ctx.fillStyle = '#78716c'; // stone-500
        ctx.beginPath();
        ctx.rect(-8, 30, 16, 20);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        // Handle coming out towards us and down
        ctx.rect(8, 30, 20, 200);
        ctx.fill();
        ctx.stroke();
    }
    
    // Draw Pick Cross-section
    const sideViewY = gameState.pickPosition.y; 
    const relativeY = sideViewY - 200; 
    
    ctx.fillStyle = '#e2e8f0'; // bright metal
    ctx.fillRect(-2, relativeY, 4, 150); // shaft
    
    // Pick shaft highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, relativeY, 1, 150);
    
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(-2, relativeY, 4, 150);
    
    ctx.restore();
    
    // Highlight first pin in the front
    const firstPin = gameState.pins[0];
    if (firstPin) {
       drawPinStack(ctx, cx - DIMENSIONS.pinWidth/2, cy - innerRadius - 20, firstPin, time);
    }
  };

  const renderSideView = (ctx: CanvasRenderingContext2D, time: number) => {
    // Clear transparent so background image can be seen
    ctx.clearRect(0, 0, 800, 600);

    const lockX = 200;
    const lockY = 200;

    // Outer Housing Base - brushed steel
    const hGrad = ctx.createLinearGradient(0, lockY - 120, 0, lockY + 100);
    hGrad.addColorStop(0.0, '#78716c');
    hGrad.addColorStop(0.2, '#d6d3d1');
    hGrad.addColorStop(0.5, '#78716c');
    hGrad.addColorStop(0.9, '#44403c');
    hGrad.addColorStop(1.0, '#292524');

    ctx.fillStyle = hGrad; 
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;
    
    // Draw lock body with rounded corners
    const lockW = DIMENSIONS.lockWidth + 40;
    const lockH = DIMENSIONS.lockHeight + 60;
    ctx.beginPath();
    ctx.roundRect(lockX - 20, lockY - 120, lockW, lockH, 12);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // Inner shadow for lock body edge
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1;
    ctx.strokeRect(lockX - 20, lockY - 120, lockW, lockH);

    // Plug (Core) - brass
    ctx.save();
    const coreCenterX = lockX + DIMENSIONS.lockWidth/2;
    const coreCenterY = lockY + 25; 
    ctx.translate(coreCenterX, coreCenterY);
    ctx.rotate((gameState.coreRotation) * Math.PI / 180);
    ctx.translate(-coreCenterX, -coreCenterY);

    const goldGrad = ctx.createLinearGradient(0, lockY, 0, lockY + 60);
    goldGrad.addColorStop(0, '#854d0e'); 
    goldGrad.addColorStop(0.2, '#fde047'); 
    goldGrad.addColorStop(0.5, '#eab308'); 
    goldGrad.addColorStop(0.8, '#854d0e');
    goldGrad.addColorStop(1, '#422006'); 
    
    ctx.fillStyle = goldGrad;
    ctx.fillRect(lockX, lockY, DIMENSIONS.lockWidth, 60);
    
    // Core drop shadow / inset shadow
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2;
    ctx.strokeRect(lockX, lockY, DIMENSIONS.lockWidth, 60);
    
    // Keyway hollowed out in the middle
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(lockX, lockY + 20, DIMENSIONS.lockWidth, 30);
    // Keyway inner edge reflection
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(lockX, lockY + 20, DIMENSIONS.lockWidth, 30);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lockX, lockY + 21, DIMENSIONS.lockWidth, 28);

    // Shear line boundary above plug
    ctx.beginPath();
    ctx.moveTo(lockX - 20, lockY);
    ctx.lineTo(lockX + DIMENSIONS.lockWidth + 20, lockY);
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Chamber backgrounds
    ctx.fillStyle = '#171717'; // Chambers are dark empty space
    gameState.pins.forEach((pin, i) => {
        const pinX = lockX + 30 + (i * DIMENSIONS.pinSpacing);
        ctx.fillRect(pinX - 2, lockY - 110, DIMENSIONS.pinWidth + 4, 110);
        
        // Chamber inner shadow
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(pinX - 2, lockY - 110, DIMENSIONS.pinWidth + 4, 110);
        
        ctx.save();
        ctx.translate(coreCenterX, coreCenterY);
        ctx.rotate((gameState.coreRotation) * Math.PI / 180);
        ctx.translate(-coreCenterX, -coreCenterY);
        // Chamber extension into plug
        const chamberGrad = ctx.createLinearGradient(pinX - 2, 0, pinX + DIMENSIONS.pinWidth + 2, 0);
        chamberGrad.addColorStop(0, '#111');
        chamberGrad.addColorStop(0.5, '#222');
        chamberGrad.addColorStop(1, '#111');
        ctx.fillStyle = chamberGrad;
        
        ctx.fillRect(pinX - 2, lockY, DIMENSIONS.pinWidth + 4, 50);
        ctx.strokeRect(pinX - 2, lockY, DIMENSIONS.pinWidth + 4, 50);
        ctx.restore();
        ctx.fillStyle = '#171717';
    });

    // Draw Tension Wrench
    if (gameState.totalTorque > 0) {
      drawTorqueWrench(ctx, gameState.totalTorque, lockX, lockY);
    }

    // Pins
    gameState.pins.forEach((pin, i) => {
        const pinX = lockX + 30 + (i * DIMENSIONS.pinSpacing);
        drawPinStack(ctx, pinX, lockY, pin, time);
    });

    // Pick
    drawPickHead(ctx, gameState.pickPosition.x, gameState.pickPosition.y, currentPick.id);
  };

  const sideCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);

  const render = (time: number) => {
    if (viewMode === ViewMode.SPLIT) {
        if (sideCanvasRef.current) {
             const ctx = sideCanvasRef.current.getContext('2d');
             if (ctx) renderSideView(ctx, time);
        }
        if (frontCanvasRef.current) {
             const ctx = frontCanvasRef.current.getContext('2d');
             if (ctx) {
                 ctx.clearRect(0, 0, 800, 600);
                 renderFrontView(ctx, time);
             }
        }
    } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (viewMode === ViewMode.FRONT) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderFrontView(ctx, time);
        } else {
            renderSideView(ctx, time);
        }
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    const loop = (time: number) => {
      render(time);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentPick, viewMode]);

  return (
    <div className="relative w-full h-full bg-stone-50 overflow-hidden">
        {/* SPLIT VIEW RENDER */}
        {viewMode === ViewMode.SPLIT && (
            <div className="absolute inset-0 flex">
               <div className="flex-1 relative border-r border-[#ece8d3] flex flex-col justify-center items-center">
                    <canvas 
                        ref={sideCanvasRef} 
                        width={800} 
                        height={600} 
                        className="w-full h-full object-contain relative z-10" 
                    />
               </div>
               <div className="flex-1 relative flex flex-col justify-center items-center">
                    <canvas 
                        ref={frontCanvasRef} 
                        width={800} 
                        height={600} 
                        className="w-full h-full object-contain relative z-10 flex-shrink-0"
                    />
               </div>
            </div>
        )}

        {/* SINGLE VIEW RENDER */}
        {viewMode !== ViewMode.SPLIT && (
            <canvas 
                ref={canvasRef} 
                width={800} 
                height={600} 
                className="w-full h-full object-contain relative z-10" 
            />
        )}
    </div>
  );
};

export default GameCanvas;
