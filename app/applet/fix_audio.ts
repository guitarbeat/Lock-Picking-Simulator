import * as fs from "fs";
let code = fs.readFileSync("src/services/audioService.ts", "utf-8");
if (!code.includes("public pause()")) {
  code = code.replace(
    /public resume\(\) \{/,
    "public pause() {\n    if (this.ctx && this.ctx.state === 'running') {\n      this.ctx.suspend();\n    }\n  }\n\n  public resume() {"
  );
  fs.writeFileSync("src/services/audioService.ts", code);
}
