// Debug: Check if Subtype navigation is being generated

import fs from "fs";
import { TypeScriptTranslator } from "./src/features/translations/utils/typescript-translator.js";

const model = JSON.parse(
  fs.readFileSync("./models/model-oal-complete.json", "utf-8")
);
const translator = new TypeScriptTranslator(model);

// Parse model
translator.parseModel();

// Check relationships
console.log("=== Relationships ===");
for (const [label, rel] of translator.relationships) {
  console.log(`${label}: ${rel.type}`);
  if (rel.type === "Subtype") {
    console.log(`  Superclass: ${rel.superclass?.key_letter}`);
    console.log(
      `  Subclasses: ${rel.subclasses?.map((s) => s.key_letter).join(", ")}`
    );
  }
}

// Check class MHS
const mhs = translator.classes.get("MHS");
console.log("\n=== MHS Class ===");
console.log(
  "Attributes:",
  mhs.attributes?.map((a) => a.name)
);

// Check getRelationshipsForClass
console.log("\n=== MHS Relationships ===");
const rels = [];
translator.relationships.forEach((rel) => {
  if (
    rel.type === "Subtype" &&
    rel.subclasses?.some((s) => s.key_letter === "MHS")
  ) {
    rels.push(rel);
    console.log(`Found Subtype: ${rel.label}`);
  }
  if (rel.type === "Associative") {
    if (
      rel.one_side?.key_letter === "MHS" ||
      rel.other_side?.key_letter === "MHS"
    ) {
      rels.push(rel);
      console.log(`Found Associative: ${rel.label}`);
    }
  }
});

console.log(`\nTotal relationships for MHS: ${rels.length}`);
