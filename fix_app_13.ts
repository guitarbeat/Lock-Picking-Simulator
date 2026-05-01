import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

code = code.replace(
  /setLevelTime\(currentTime => \{[\s\S]*?\}\);/g,
  ""
);

code = code.replace(
  /\/\/ --- HELPERS FOR LEVEL TRANSITION ---[\s\S]*?const startLevel = \(levelIdx: number\) => \{[\s\S]*?setGameState\(GameState\.PLAYING\);\n\s*\};/g,
  ""
);

code = code.replace(
  /\}, \[gameState, tutorialStep, currentPick, gameMode\]\);/g,
  "}, [gameState, currentPick]);"
);

fs.writeFileSync("src/App.tsx", code);
