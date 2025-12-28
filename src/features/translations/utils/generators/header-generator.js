/**
 * Header Generator
 * Generates file header with metadata
 */
export class HeaderGenerator {
  generate(model) {
    const systemName = model.system_model.system_name || "System";
    const version = model.system_model.version || "1.0.0";

    return `// ============================================================================
// Generated TypeScript Code
// System: ${systemName}
// Version: ${version}
// Generated: ${new Date().toISOString()}
// ============================================================================

`;
  }
}
