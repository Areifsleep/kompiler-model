/**
 * Test TypeScript Translator v4 - Test All Fixes
 * Tests: self→this, let declarations, method naming, navigation, property access
 */

import fs from "fs";
import { TypeScriptTranslator } from "./src/features/translations/utils/typescript-translator.js";

console.log("🧪 Testing TypeScript Translator v4 Fixes...\n");

// Load model
const modelPath = "./models/model-oal-complete.json";
const model = JSON.parse(fs.readFileSync(modelPath, "utf-8"));

// Translate
const translator = new TypeScriptTranslator(model);
const output = translator.translate();

// Write output
const outputPath = "./models/output-translate-v4.ts";
fs.writeFileSync(outputPath, output, "utf-8");

console.log(`✅ Generated: ${outputPath}`);
console.log(`📏 Size: ${(output.length / 1024).toFixed(2)} KB\n`);

// Check critical patterns
const checks = [
  {
    name: "Type inst_ref defined",
    pattern: /type inst_ref<T> = T/,
    expected: true,
  },
  {
    name: "TIM.current_time returns Date",
    pattern: /current_time.*return new Date/s,
    expected: true,
  },
  {
    name: "Method name camelCase (ajukanCuti)",
    pattern: /ajukanCuti\(/,
    expected: true,
  },
  {
    name: "No spaces in method names",
    pattern: /ajukan Cuti/,
    expected: false,
  },
  {
    name: "self transformed to this",
    pattern: /\bthis\.Current_State\b/,
    expected: true,
  },
  {
    name: "No standalone self keyword",
    pattern: /\bself\./,
    expected: false,
  },
  {
    name: "Variable declared with let",
    pattern: /let total_sks =/,
    expected: true,
  },
  {
    name: "Navigation getPerson()",
    pattern: /this\.getPerson\(\)/,
    expected: true,
  },
  {
    name: "Navigation getKRSList()",
    pattern: /this\.getKRSList\(\)/,
    expected: true,
  },
  {
    name: "Create with type assertion",
    pattern: /{} as LogCuti/,
    expected: true,
  },
  {
    name: "No empty constructor calls",
    pattern: /new LogCuti\(\)/,
    expected: false,
  },
];

console.log("🔍 Pattern Checks:\n");
let passed = 0;
let failed = 0;

checks.forEach((check) => {
  const found = check.pattern.test(output);
  const success = found === check.expected;

  if (success) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name}`);
    console.log(`   Expected: ${check.expected}, Found: ${found}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed}/${checks.length} passed`);

if (failed === 0) {
  console.log("\n🎉 All checks passed! Transformer v4 is working correctly!");
} else {
  console.log(`\n⚠️  ${failed} check(s) failed. Review output file.`);
}
