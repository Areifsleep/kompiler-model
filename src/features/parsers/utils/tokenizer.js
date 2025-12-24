/**
 * Tokenizer for OAL (Object Action Language)
 * Breaks input string into token array
 */
export const tokenizeOAL = (input) => {
  const regex = /(select|generate|create|relate|self|param|::|\.|->|;|=)|([a-zA-Z_]\w*)|(".*?")/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    tokens.push({ value: match[0], index: match.index });
  }
  return tokens;
};

/**
 * Get line offset within OAL code
 */
export const getOALLineOffset = (oal, index) => {
  return oal.substring(0, index).split("\n").length;
};
