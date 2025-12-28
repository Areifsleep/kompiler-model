// Debug tokenizer to find the exact issue

const testOAL = `// OAL Demo: State Aktif
// 1. Basic assignment
self.Current_State = "Aktif";
self.Total_SKS = 0;

// 2. Bridge invocation
LOG::LogInfo(message: "Mahasiswa baru aktif dengan NIM: " + self.NIM);

// 3. Relationship navigation
select one person related by self->PRS[R1];
if (not_empty person)
  LOG::LogInfo(message: "Nama: " + person.Nama);
end if;`;

console.log("=== Testing Tokenizer ===\n");

// Old tokenizer (WRONG)
console.log("--- OLD TOKENIZER (WRONG) ---");
const oldRegex =
  /(select|generate|create|relate|self|param|::|\.|->|;|=)|([a-zA-Z_]\w*)|(".*?")/g;
const oldTokens = [];
let oldMatch;
while ((oldMatch = oldRegex.exec(testOAL)) !== null) {
  oldTokens.push({ value: oldMatch[0], index: oldMatch.index });
}

console.log("Self tokens found:");
oldTokens
  .filter((t) => t.value === "self")
  .forEach((t, i) => {
    const context = testOAL.substring(Math.max(0, t.index - 20), t.index + 40);
    console.log(`  ${i + 1}. Index ${t.index}: ...${context}...`);
  });

console.log("\n--- NEW TOKENIZER (CORRECT) ---");
// New tokenizer (CORRECT)
const newRegex =
  /(".*?")|('.*?')|(select|generate|create|relate|self|param|::|\.|->|;|=)|([a-zA-Z_]\w*)/g;
const newTokens = [];
let newMatch;
while ((newMatch = newRegex.exec(testOAL)) !== null) {
  newTokens.push({
    value: newMatch[0],
    index: newMatch.index,
    isString: !!(newMatch[1] || newMatch[2]),
  });
}

console.log("All tokens:");
newTokens.forEach((t, i) => {
  if (t.value === "self" || t.isString) {
    console.log(
      `  ${i}. "${t.value}" at ${t.index} ${t.isString ? "(STRING)" : ""}`
    );
  }
});

console.log("\nSelf tokens that should be validated:");
newTokens
  .filter((t) => t.value === "self" && !t.isString)
  .forEach((t, i) => {
    const nextToken = newTokens[newTokens.indexOf(t) + 1];
    const context = testOAL.substring(t.index, t.index + 20);
    console.log(
      `  ${i + 1}. "${context}" -> next token: "${nextToken?.value}"`
    );
  });

console.log("\n=== Summary ===");
console.log(
  `Old tokenizer: ${
    oldTokens.filter((t) => t.value === "self").length
  } self tokens`
);
console.log(
  `New tokenizer: ${
    newTokens.filter((t) => t.value === "self" && !t.isString).length
  } self tokens (excluding strings)`
);
