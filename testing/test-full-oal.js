/**
 * Test Full OAL from model-oal-complete.json - State Cuti
 */

import { OALTransformer } from "./src/features/translations/utils/transformers/oal-transformer.js";

// Mock external entities
const mockExternalEntities = new Map([
  [
    "LOG",
    {
      key_letter: "LOG",
      bridges: [
        { name: "LogInfo", parameters: [{ name: "message", type: "string" }] },
        { name: "LogError", parameters: [{ name: "message", type: "string" }] },
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
  ["LGC", { name: "LogCuti", key_letter: "LGC" }],
]);

const transformer = new OALTransformer(mockExternalEntities, mockClassesMap);

// Full OAL from State Cuti
const oalStateCuti = `// OAL Demo: State Cuti - Complete BPAL97 Features
// Parameter: param.alasan (string)

// 1. Create instance (P2.1)
create object instance log_cuti of LogCuti;
log_cuti.MHS_ID = self.MHS_ID;
log_cuti.Alasan = param.alasan;
log_cuti.Tanggal = TIM::current_time();

// 2. Select statements (P2.2)
select one person related by self->PRS[R1];
select many krs_list related by self->KRS[R2];

// 3. Conditional (P4.1)
if (not_empty person AND person.Email != "")
  LOG::LogInfo(message: "Email notif ke: " + person.Email);
elif (empty person)
  LOG::LogError(message: "Person tidak ditemukan!");
else
  LOG::LogInfo(message: "Email kosong, skip notifikasi");
end if;

// 4. Iteration (P4.2)
total_sks = 0;
for each krs in krs_list
  if (krs.Status == "Diambil")
    total_sks = total_sks + krs.SKS;
  end if;
end for;
self.Total_SKS = total_sks;

// 5. Update state
self.Current_State = "Cuti";
LOG::LogInfo(message: "Mahasiswa cuti. Total SKS: " + total_sks);`;

console.log("=".repeat(80));
console.log("FULL OAL TRANSFORMATION TEST - State Cuti");
console.log("=".repeat(80));
console.log("\nOriginal OAL:");
console.log(oalStateCuti);
console.log("\n" + "=".repeat(80));
console.log("TRANSFORMED TYPESCRIPT:");
console.log("=".repeat(80));

try {
  const result = transformer.transform(oalStateCuti);
  console.log(result);

  // Validation checks
  console.log("\n" + "=".repeat(80));
  console.log("VALIDATION CHECKS:");
  console.log("=".repeat(80));

  const checks = {
    "param.alasan → params.alasan": result.includes("params.alasan"),
    "create → new Class()": result.includes("new LogCuti()"),
    "select one → .find() or [0]":
      result.includes("[0]") || result.includes(".find("),
    "select many → filter or array": result.includes("getKRS()"),
    "not_empty → !== null":
      result.includes("!== null") && result.includes("!== undefined"),
    "empty → === null":
      result.includes("=== null") || result.includes("=== undefined"),
    "AND → &&": result.includes("&&"),
    "OR → ||": result.includes("||") || !oalStateCuti.includes(" OR "),
    "!= → !==": result.includes("!=="),
    "== → ===": result.includes("==="),
    "if/elif/else structure":
      result.includes("if (") &&
      result.includes("} else if (") &&
      result.includes("} else {"),
    "for each → for (const": result.includes("for (const"),
    "end for → }": !result.includes("end for"),
    "end if → }": !result.includes("end if"),
    "bridge calls (LOG::)":
      result.includes("LOG.LogInfo(") && result.includes("LOG.LogError("),
    "bridge calls (TIM::)": result.includes("TIM.current_time("),
  };

  let passCount = 0;
  let failCount = 0;

  for (const [check, passed] of Object.entries(checks)) {
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${check}`);
    if (passed) passCount++;
    else failCount++;
  }

  console.log("\n" + "=".repeat(80));
  console.log(`RESULT: ${passCount}/${passCount + failCount} checks passed`);

  if (failCount === 0) {
    console.log("🎉 ALL TRANSFORMATIONS SUCCESSFUL!");
  } else {
    console.log(`⚠️  ${failCount} checks failed`);
  }

  console.log("=".repeat(80));
} catch (error) {
  console.error("❌ TRANSFORMATION FAILED:");
  console.error(error.message);
  console.error(error.stack);
}
