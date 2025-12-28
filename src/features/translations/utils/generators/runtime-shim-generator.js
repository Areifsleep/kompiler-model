/**
 * Runtime Shim Generator
 * Generates External Entity runtime implementations
 */
export class RuntimeShimGenerator {
  constructor(externalEntities, usedExternalEntities, typeMapper) {
    this.externalEntities = externalEntities;
    this.usedExternalEntities = usedExternalEntities;
    this.typeMapper = typeMapper;
  }

  /**
   * Generate runtime shims for External Entities
   */
  generate() {
    // Only generate runtime shims for External Entities that are actually used
    if (this.usedExternalEntities.size === 0) {
      return "";
    }

    let code = `// ============================================================================
// RUNTIME STANDARD LIBRARY
// External Entities Implementation (Shlaer-Mellor Rule 20)
// Only includes entities that are actually used in the model
// ============================================================================

`;

    // Only generate code for External Entities that are used
    this.externalEntities.forEach((ee) => {
      // Skip if this External Entity is not used
      if (!this.usedExternalEntities.has(ee.key_letter)) {
        return;
      }

      code += this.generateExternalEntity(ee);
    });

    return code;
  }

  /**
   * Generate code for a single External Entity
   */
  generateExternalEntity(ee) {
    let code = `/**\n`;
    code += ` * External Entity: ${ee.name} (${ee.key_letter})\n`;
    if (ee.description) {
      code += ` * ${ee.description}\n`;
    }
    code += ` */\n`;
    code += `class ${ee.key_letter} {\n`;

    ee.bridges.forEach((bridge) => {
      code += this.generateBridge(bridge, ee.key_letter);
    });

    code += `}\n\n`;
    return code;
  }

  /**
   * Generate code for a single bridge method
   */
  generateBridge(bridge, eeKeyLetter) {
    const params = bridge.parameters
      .map((p) => `${p.name}: ${this.typeMapper.mapToTS(p.type)}`)
      .join(", ");
    const returnType = bridge.return_type
      ? this.typeMapper.mapToTS(bridge.return_type)
      : "void";

    let code = `  /**\n`;
    code += `   * ${bridge.description || bridge.name}\n`;
    bridge.parameters.forEach((p) => {
      code += `   * @param ${p.name} - ${p.type}\n`;
    });
    if (bridge.return_type) {
      code += `   * @returns ${bridge.return_type}\n`;
    }
    code += `   */\n`;

    // Special handling for TIM methods - make params optional with any type
    if (eeKeyLetter === "TIM") {
      code += `  static ${bridge.name}(params?: any)`;
    } else {
      code += `  static ${bridge.name}(params: { ${params} })`;
    }

    code += `: ${returnType} {\n`;

    // Generate implementation
    code += this.generateBridgeImplementation(bridge, eeKeyLetter, returnType);

    code += `  }\n\n`;
    return code;
  }

  /**
   * Generate implementation for bridge method
   */
  generateBridgeImplementation(bridge, eeKeyLetter, returnType) {
    let code = "";

    if (eeKeyLetter === "LOG") {
      if (bridge.name === "LogInfo") {
        code += `    console.log(\`[INFO]: \${params.message}\`);\n`;
      } else if (bridge.name === "LogError") {
        code += `    console.error(\`[ERROR]: \${params.message}\`);\n`;
      } else if (bridge.name === "LogWarning") {
        code += `    console.warn(\`[WARNING]: \${params.message}\`);\n`;
      } else {
        code += `    console.log(\`[${eeKeyLetter}]: \${JSON.stringify(params)}\`);\n`;
      }
    } else if (eeKeyLetter === "TIM") {
      if (bridge.name === "timer_start") {
        code += `    console.log(\`[TIM]: Timer started for \${params.microseconds}μs\`);\n`;
        code += `    const timerId = setTimeout(() => {\n`;
        code += `      console.log("[TIM]: Timer expired, generating event");\n`;
        code += `      // Event generation logic would go here\n`;
        code += `    }, params.microseconds / 1000);\n`;
        code += `    return timerId as unknown as number;\n`;
      } else if (bridge.name === "current_time") {
        code += `    return new Date();\n`;
      } else if (bridge.name === "timer_cancel") {
        code += `    clearTimeout(params.timer_id as any);\n`;
        code += `    console.log(\`[TIM]: Timer \${params.timer_id} cancelled\`);\n`;
        code += `    return true;\n`;
      } else if (bridge.name === "timer_remaining_time") {
        code += `    // Simplified implementation\n`;
        code += `    console.log(\`[TIM]: Getting remaining time for timer \${params.timer_id}\`);\n`;
        code += `    return 0;\n`;
      }
    } else {
      // Generic implementation for other external entities
      code += `    console.log(\`[${eeKeyLetter}]: Bridge ${bridge.name} called\`);\n`;
      if (returnType !== "void") {
        code += `    return ${this.typeMapper.getDefaultValue(returnType)};\n`;
      }
    }

    return code;
  }
}
