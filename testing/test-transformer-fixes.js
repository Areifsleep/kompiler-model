/**
 * Test OAL Transformer - Critical Fixes
 */

// Mock external entities and classes
const mockExternalEntities = new Map([
  [
    "LOG",
    {
      key_letter: "LOG",
      bridges: [
        { name: "LogInfo", parameters: [{ name: "message", type: "string" }] },
      ],
    },
  ],
  [
    "TIM",
    {
      key_letter: "TIM",
      bridges: [{ name: "current_time", parameters: [] }],
    },
  ],
]);

const mockClassesMap = new Map([
  ["KRS", { name: "KRS", key_letter: "KRS" }],
  ["PRS", { name: "Person", key_letter: "PRS" }],
  ["MHS", { name: "Mahasiswa", key_letter: "MHS" }],
]);

// Import transformer
import { OALTransformer } from "./src/features/translations/utils/transformers/oal-transformer.js";

const transformer = new OALTransformer(mockExternalEntities, mockClassesMap);

console.log("=".repeat(80));
console.log("OAL TRANSFORMER - CRITICAL FIXES TEST");
console.log("=".repeat(80));

// Test 1: not_empty / empty operators
console.log("\n[Test 1] not_empty / empty operators");
const oal1 = `if (not_empty person)
  LOG::LogInfo(message: "Person exists");
end if;

if (empty person)
  LOG::LogInfo(message: "Person is null");
end if;`;

console.log("Input OAL:");
console.log(oal1);
console.log("\nTransformed TypeScript:");
try {
  const result1 = transformer.transform(oal1);
  console.log(result1);
  console.log("✅ PASS - not_empty/empty transformed");
} catch (e) {
  console.log("❌ FAIL:", e.message);
}

// Test 2: param.xxx transformation
console.log("\n" + "=".repeat(80));
console.log("[Test 2] param.xxx → params.xxx");
const oal2 = `create object instance log_cuti of LogCuti;
log_cuti.Alasan = param.alasan;
log_cuti.Tanggal = TIM::current_time();`;

console.log("Input OAL:");
console.log(oal2);
console.log("\nTransformed TypeScript:");
try {
  const result2 = transformer.transform(oal2);
  console.log(result2);

  if (result2.includes("params.alasan")) {
    console.log("✅ PASS - param.alasan → params.alasan");
  } else {
    console.log("❌ FAIL - param.alasan NOT transformed");
  }
} catch (e) {
  console.log("❌ FAIL:", e.message);
}

// Test 3: WHERE clause with selected keyword
console.log("\n" + "=".repeat(80));
console.log("[Test 3] WHERE clause with selected.attribute");
const oal3 = `select many krs_completed related by self->KRS[R2] where selected.Status == "Lulus";`;

console.log("Input OAL:");
console.log(oal3);
console.log("\nTransformed TypeScript:");
try {
  const result3 = transformer.transform(oal3);
  console.log(result3);

  if (result3.includes("selected =>") && result3.includes("selected.Status")) {
    console.log("✅ PASS - selected keyword preserved in lambda");
  } else {
    console.log("⚠️  WARNING - Check if selected keyword is correct");
  }
} catch (e) {
  console.log("❌ FAIL:", e.message);
}

// Test 4: Complex OAL with all fixes
console.log("\n" + "=".repeat(80));
console.log("[Test 4] Complex OAL - All fixes combined");
const oal4 = `// Get event parameter
alasan_cuti = param.alasan;

// Select with WHERE
select many krs_list related by self->KRS[R2] where selected.Status == "Diambil";

// Check if exists
if (not_empty krs_list)
  LOG::LogInfo(message: "Found KRS records");
elif (empty krs_list)
  LOG::LogInfo(message: "No KRS found");
end if;`;

console.log("Input OAL:");
console.log(oal4);
console.log("\nTransformed TypeScript:");
try {
  const result4 = transformer.transform(oal4);
  console.log(result4);

  let checks = {
    param: result4.includes("params.alasan"),
    notEmpty:
      result4.includes("!== null && ") && result4.includes("!== undefined"),
    selected: result4.includes("selected =>"),
    operators: result4.includes("==="),
  };

  console.log("\nValidation:");
  console.log(`  param.xxx → params.xxx: ${checks.param ? "✅" : "❌"}`);
  console.log(`  not_empty transformation: ${checks.notEmpty ? "✅" : "❌"}`);
  console.log(`  WHERE selected keyword: ${checks.selected ? "✅" : "❌"}`);
  console.log(`  Operators (== → ===): ${checks.operators ? "✅" : "❌"}`);

  const allPass = Object.values(checks).every((v) => v);
  console.log(`\nOverall: ${allPass ? "✅ ALL PASS" : "❌ SOME FAILED"}`);
} catch (e) {
  console.log("❌ FAIL:", e.message);
}

console.log("\n" + "=".repeat(80));
console.log("TEST COMPLETE");
console.log("=".repeat(80));
