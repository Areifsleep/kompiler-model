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

const oal = "select one person related by self->PRS[R1];";
console.log("Testing OAL:", oal);
console.log("\nTokens:");

const tokens = tokenizeOAL(oal);
tokens.forEach((t, i) => {
  console.log(
    `[${i}] "${t.value}" at index ${t.index}, isString=${t.isString}`
  );
});

console.log("\n--- Checking self keyword ---");
for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  if (t.value === "self") {
    console.log(`Found 'self' at token index ${i}`);
    console.log(`  Current token: "${t.value}"`);
    console.log(`  Next token [${i + 1}]: "${tokens[i + 1]?.value}"`);
    console.log(`  Next+1 token [${i + 2}]: "${tokens[i + 2]?.value}"`);

    const next = tokens[i + 1];
    const isValidAttributeAccess = next && next.value === ".";
    const isValidNavigation =
      (next && next.value === "->") ||
      (next &&
        next.value === "-" &&
        tokens[i + 2] &&
        tokens[i + 2].value === ">");

    console.log(`  isValidAttributeAccess: ${isValidAttributeAccess}`);
    console.log(`  isValidNavigation: ${isValidNavigation}`);
    console.log(
      `  Result: ${
        isValidAttributeAccess || isValidNavigation ? "VALID" : "ERROR"
      }`
    );
  }
}
