/**
 * Direct test of self-reference validator
 * This bypasses browser cache issues
 */

// Simulate the tokenizer
const tokenizeOAL = (input) => {
  const regex =
    /(".*?")|('.*?')|(->|::)|(select|generate|create|relate|related|self|param|where|by)|(\.|\[|\]|;|=)|([a-zA-Z_]\w*)|(\d+)/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    const isStringLiteral = !!(match[1] || match[2]);
    tokens.push({
      value: match[0],
      index: match.index,
      isString: isStringLiteral,
    });
  }

  return tokens;
};

// Test cases from model-oal-complete.json
const testCases = [
  {
    name: "State Aktif - Line with string concat",
    oal: 'LOG::LogInfo(message: "Mahasiswa baru aktif dengan NIM: " + self.NIM);',
    shouldError: false,
  },
  {
    name: "State Cuti - Line with string concat",
    oal: 'LOG::LogInfo(message: "Mahasiswa cuti. Total SKS: " + total_sks);',
    shouldError: false,
  },
  {
    name: "State Lulus - IPK concat",
    oal: 'LOG::LogInfo(message: "Mahasiswa lulus! IPK: " + self.IPK + ", Total SKS: " + total_sks);',
    shouldError: false,
  },
  {
    name: "State Lulus - Name concat",
    oal: 'LOG::LogInfo(message: "Selamat kepada " + person.Nama + " yang telah lulus!");',
    shouldError: false,
  },
  {
    name: "Invalid self usage",
    oal: "LOG::LogInfo(message: self);",
    shouldError: true,
  },
  {
    name: "Valid self.attribute",
    oal: 'self.Current_State = "Aktif";',
    shouldError: false,
  },
  {
    name: "Valid self->navigation",
    oal: "select one person related by self->PRS[R1];",
    shouldError: false,
  },
];

console.log("=".repeat(80));
console.log("SELF-REFERENCE VALIDATOR TEST");
console.log("=".repeat(80));

testCases.forEach((test, idx) => {
  console.log(`\n[Test ${idx + 1}] ${test.name}`);
  console.log(`OAL: ${test.oal}`);

  const tokens = tokenizeOAL(test.oal);
  console.log("\nTokens:");

  let errorCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    console.log(`  [${i}] value="${t.value}" isString=${t.isString}`);

    // Skip string tokens
    if (t.isString) {
      continue;
    }

    // Check 'self' keyword
    if (t.value === "self") {
      const next = tokens[i + 1];
      const isValidAttributeAccess = next && next.value === ".";
      const isValidNavigation = next && next.value === "->"; // FIXED: -> is single token now

      if (!isValidAttributeAccess && !isValidNavigation) {
        console.log(
          `  ❌ ERROR at token [${i}]: 'self' not followed by '.' or '->'`
        );
        errorCount++;
      } else {
        console.log(`  ✅ Valid 'self' usage at token [${i}]`);
      }
    }
  }

  const passed =
    (errorCount === 0 && !test.shouldError) ||
    (errorCount > 0 && test.shouldError);
  console.log(
    `\nResult: ${
      passed ? "✅ PASS" : "❌ FAIL"
    } (errors: ${errorCount}, expected: ${test.shouldError ? ">0" : "0"})`
  );
});

console.log("\n" + "=".repeat(80));
console.log("TEST COMPLETE");
console.log("=".repeat(80));
