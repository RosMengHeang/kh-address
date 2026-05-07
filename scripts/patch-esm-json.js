const fs = require("fs");

const file = "dist/index.mjs";
const source = fs.readFileSync(file, "utf8");
const patched = source.replace(
  'import data from "../data/cambodia.json";',
  'import data from "../data/cambodia.json" with { type: "json" };'
);

if (patched === source) {
  throw new Error("Could not patch ESM JSON import attribute.");
}

fs.writeFileSync(file, patched);
