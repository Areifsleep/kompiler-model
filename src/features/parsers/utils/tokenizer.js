/**
 * Tokenizer for OAL (Object Action Language)
 * Breaks input string into token array
 *
 * @version 3.1.2-HOTFIX - Fixed string literal handling (CACHE_BUST_v2)
 * @date 2025-12-28
 * CRITICAL FIX: String literals must be matched BEFORE keywords
 */
export const tokenizeOAL = (input) => {
  // IMPORTANT: Check strings FIRST before keywords to avoid tokenizing inside strings
  // Pattern order matters: ("...") | ('...') | (operators) | (keywords) | (identifiers)
  // CRITICAL: Multi-char operators (::, ->) must come BEFORE single-char operators
  // CRITICAL: Longer keywords (related) must come BEFORE shorter ones (relate)
  const regex =
    /(".*?")|('.*?')|(->|::)|(select|generate|create|related|relate|self|param|where|by|to|across)|(\.|\[|\]|;|=)|([a-zA-Z_]\w*)|(\d+)/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    const isStringLiteral = !!(match[1] || match[2]);
    tokens.push({
      value: match[0],
      index: match.index,
      isString: isStringLiteral, // TRUE if inside quotes, FALSE otherwise
    });
  }

  return tokens;
};

/**
 * Get line offset within OAL code
 */
export const getOALLineOffset = (oal, index) => {
  return oal.substring(0, index).split("\n").length;
};
