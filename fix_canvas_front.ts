import * as fs from "fs";

let code = fs.readFileSync("src/components/GameCanvas.tsx", "utf-8");

const oldFront = `  const renderFrontView = (ctx: CanvasRenderingContext2D, time: number) => {
    const cx = 400;
    const cy = 300;
    const outerRadius = 150;
    const innerRadius = 80;

    // Housing (Cream border)
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = COLORS.lockChamber;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#292524'; // dark outline for definition
    ctx.stroke();

    // Plug (Gold)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(gameState.coreRotation * Math.PI / 180);

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    const goldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
    goldGrad.addColorStop(0, '#FFF2AD');
    goldGrad.addColorStop(1, '#E6D378');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Keyway
    ctx.fillStyle = '#FFFFFF'; // Bright white/empty space inside keyway
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
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
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
    
    ctx.fillStyle = '#a8a29e'; // light metal
    ctx.fillRect(-2, relativeY, 4, 150); // shaft
    ctx.strokeRect(-2, relativeY, 4, 150);
    
    ctx.restore();
    
    // Highlight first pin in the front
    const firstPin = gameState.pins[0];
    if (firstPin) {
       drawPinStack(ctx, cx - DIMENSIONS.pinWidth/2, cy - innerRadius - 20, firstPin, time);
    }
  };`;

const newFront = `  const renderFrontView = (ctx: CanvasRenderingContext2D, time: number) => {
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
  };`;

code = code.replace(oldFront, newFront);

fs.writeFileSync("src/components/GameCanvas.tsx", code);
