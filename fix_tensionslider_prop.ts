import * as fs from "fs";

let appCode = fs.readFileSync("src/App.tsx", "utf-8");

appCode = appCode.replace(
  /onPointerDown=\{\(e\) => \{\n                            e\.currentTarget\.setPointerCapture\(e\.pointerId\);/,
  `onPointerDown={(e) => {
                            e.stopPropagation();
                            e.currentTarget.setPointerCapture(e.pointerId);`
);

appCode = appCode.replace(
  /onPointerMove=\{\(e\) => \{\n                            if \(e\.buttons > 0 \|\| e\.pressure > 0\) \{/,
  `onPointerMove={(e) => {
                            e.stopPropagation();
                            if ((e.buttons > 0 || e.pressure > 0) && e.currentTarget.hasPointerCapture(e.pointerId)) {`
);

appCode = appCode.replace(
  /onPointerUp=\{\(e\) => \{/,
  `onPointerUp={(e) => {
                            e.stopPropagation();`
);

appCode = appCode.replace(
  /onPointerCancel=\{\(e\) => \{/,
  `onPointerCancel={(e) => {
                            e.stopPropagation();`
);

fs.writeFileSync("src/App.tsx", appCode);
