/**
 * Helper function to get line number from position in string
 */
export const getLineNumber = (text, position) => {
  const lines = text.substring(0, position).split("\n");
  return lines.length;
};

/**
 * Helper function to get context lines (before and after)
 */
export const getLineContext = (text, lineNumber, contextLines = 2) => {
  const lines = text.split("\n");
  const start = Math.max(0, lineNumber - contextLines - 1);
  const end = Math.min(lines.length, lineNumber + contextLines);

  return lines.slice(start, end).map((line, idx) => ({
    lineNumber: start + idx + 1,
    content: line,
    isError: start + idx + 1 === lineNumber,
  }));
};
