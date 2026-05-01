import * as fs from "fs";

let code = fs.readFileSync("src/components/GameCanvas.tsx", "utf-8");

// Add drop shadow to the main lock housing
code = code.replace(
  'ctx.fillRect(lockX - 20, lockY - 120, DIMENSIONS.lockWidth + 40, DIMENSIONS.lockHeight + 60);',
  `ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillRect(lockX - 20, lockY - 120, DIMENSIONS.lockWidth + 40, DIMENSIONS.lockHeight + 60);
    ctx.shadowColor = 'transparent';`
);

// Add inner shadow or metallic glints to the core
code = code.replace(
  'ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);',
  `ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;`
);

code = code.replace(
  'ctx.fillStyle = \'#EDE9CA\'; // light default from PSD',
  `ctx.fillStyle = COLORS.lockChamber;`
);

fs.writeFileSync("src/components/GameCanvas.tsx", code);
