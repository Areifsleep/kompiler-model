// Test tokenizer functionality
import { tokenizeOAL } from "./src/features/parsers/utils/tokenizer.js";

const testCases = [
  {
    name: 'Self INSIDE string (word "self" in the message)',
    oal: 'LOG::LogInfo(message: "Student self is active");',
  },
  {
    name: "Self in concatenation (OAL from model)",
    oal: 'LOG::LogInfo(message: "Mahasiswa baru aktif dengan NIM: " + self.NIM);',
  },
  {
    name: "Self attribute access (should NOT be in string)",
    oal: 'self.Current_State = "Aktif";',
  },
  {
    name: "Self navigation (should NOT be in string)",
    oal: "select one person related by self->PRS[R1];",
  },
];

console.log("=== TOKENIZER TEST ===\n");

testCases.forEach((test) => {
  console.log(`Test: ${test.name}`);
  console.log(`OAL: ${test.oal}`);

  const tokens = tokenizeOAL(test.oal);

  console.log("\nTokens:");
  tokens.forEach((t, i) => {
    const flag = t.isString ? "[STRING]" : "";
    console.log(`  ${i}: "${t.value}" ${flag}`);
  });

  const selfTokens = tokens.filter(
    (t, i) => t.value === "self" || t.value.includes("self")
  );
  console.log('\nTokens containing "self":');
  selfTokens.forEach((t) => {
    console.log(`  - "${t.value}" (isString: ${t.isString})`);
  });

  console.log("\n" + "=".repeat(60) + "\n");
});
