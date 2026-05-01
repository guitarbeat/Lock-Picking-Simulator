import * as fs from "fs";

let code = fs.readFileSync("src/components/GameCanvas.tsx", "utf-8");

const oldRenderSideView = `  const renderSideView = (ctx: CanvasRenderingContext2D, time: number) => {
    // Clear transparent so background image can be seen
    ctx.clearRect(0, 0, 800, 600);

    const lockX = 200;
    const lockY = 200;

    // Outer Housing Base - cream
    ctx.fillStyle = '#EDE9CA'; 
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillRect(lockX - 20, lockY - 120, DIMENSIONS.lockWidth + 40, DIMENSIONS.lockHeight + 60);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.strokeRect(lockX - 20, lockY - 120, DIMENSIONS.lockWidth + 40, DIMENSIONS.lockHeight + 60);

    // Plug (Core) - gold
    ctx.save();
    const coreCenterX = lockX + DIMENSIONS.lockWidth/2;
    const coreCenterY = lockY + 25; 
    ctx.translate(coreCenterX, coreCenterY);
    ctx.rotate((gameState.coreRotation) * Math.PI / 180);
    ctx.translate(-coreCenterX, -coreCenterY);

    const goldGrad = ctx.createLinearGradient(0, lockY, 0, lockY + 60);
    goldGrad.addColorStop(0, '#FAEA8C');
    goldGrad.addColorStop(1, '#D8C665');
    
    ctx.fillStyle = goldGrad;
    ctx.fillRect(lockX, lockY, DIMENSIONS.lockWidth, 60);
    ctx.strokeRect(lockX, lockY, DIMENSIONS.lockWidth, 60);
    
    // Keyway hollowed out in the middle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(lockX, lockY + 20, DIMENSIONS.lockWidth, 30);
    ctx.strokeRect(lockX, lockY + 20, DIMENSIONS.lockWidth, 30);

    // Shear line boundary above plug
    ctx.beginPath();
    ctx.moveTo(lockX - 20, lockY);
    ctx.lineTo(lockX + DIMENSIONS.lockWidth + 20, lockY);
    ctx.stroke();

    ctx.restore();

    // Chamber backgrounds
    ctx.fillStyle = '#FFFFFF'; // Chambers are white/empty inside
    gameState.pins.forEach((pin, i) => {
        const pinX = lockX + 30 + (i * DIMENSIONS.pinSpacing);
        ctx.fillRect(pinX - 2, lockY - 110, DIMENSIONS.pinWidth + 4, 110);
        ctx.strokeRect(pinX - 2, lockY - 110, DIMENSIONS.pinWidth + 4, 110);
        
        ctx.save();
        ctx.translate(coreCenterX, coreCenterY);
        ctx.rotate((gameState.coreRotation) * Math.PI / 180);
        ctx.translate(-coreCenterX, -coreCenterY);
        // Chamber extension into plug
        ctx.fillRect(pinX - 2, lockY, DIMENSIONS.pinWidth + 4, 50);
        ctx.strokeRect(pinX - 2, lockY, DIMENSIONS.pinWidth + 4, 50);
        ctx.restore();
    });`;

const newRenderSideView = `  const renderSideView = (ctx: CanvasRenderingContext2D, time: number) => {
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
    });`;

code = code.replace(oldRenderSideView, newRenderSideView);

fs.writeFileSync("src/components/GameCanvas.tsx", code);
