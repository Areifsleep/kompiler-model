/**
 * OAL Transformer
 * Transforms OAL (Object Action Language) to TypeScript (BPAL97 compliant)
 */
export class OALTransformer {
  constructor(externalEntities, classesMap = new Map()) {
    this.externalEntities = externalEntities;
    this.classesMap = classesMap;
  }

  /**
   * Transform OAL code to TypeScript
   * Handles: bridge calls, create, select, delete, relate, if/elif/else, for each, operators
   */
  transform(oal) {
    if (!oal) return "";

    let transformed = oal;

    // STEP 1: Pre-scan to detect all variable names that need 'let' (before formatting changes)
    const variablesToDeclare = this.detectVariableAssignments(oal);

    // STEP 2: Apply transformations in order
    transformed = this.transformBridgeCalls(transformed);
    transformed = this.transformCreateInstance(transformed);
    transformed = this.transformSelectStatements(transformed);
    transformed = this.transformDeleteInstance(transformed);
    transformed = this.transformRelateInstances(transformed); // NEW: relate syntax
    transformed = this.transformConditionals(transformed);
    transformed = this.transformLoops(transformed);
    transformed = this.transformOperators(transformed);
    transformed = this.transformEventParameters(transformed);
    transformed = this.transformSelfKeyword(transformed); // NEW: self → this
    
    // STEP 3: Add 'let' declarations based on pre-scanned variables
    transformed = this.addVariableDeclarations(transformed, variablesToDeclare);

    // Format with proper indentation
    return this.formatOutput(transformed);
  }

  /**
   * Transform bridge calls: KEY::Method(...) → KEY.Method({...})
   */
  transformBridgeCalls(oal) {
    const bridgeCallRegex = /([A-Z]+)::(\w+)\s*\((.*?)\)/g;

    return oal.replace(
      bridgeCallRegex,
      (fullMatch, keyLetter, methodName, argsStr) => {
        // Validate external entity exists
        const externalEntity = this.externalEntities.get(keyLetter);
        if (!externalEntity) {
          throw new Error(
            `Unknown External Entity: ${keyLetter}. ` +
              `Available: ${Array.from(this.externalEntities.keys()).join(
                ", "
              )}`
          );
        }

        // Validate bridge exists
        const bridge = externalEntity.bridges.find(
          (b) => b.name === methodName
        );
        if (!bridge) {
          throw new Error(
            `Unknown bridge: ${keyLetter}::${methodName}. ` +
              `Available for ${keyLetter}: ${externalEntity.bridges
                .map((b) => b.name)
                .join(", ")}`
          );
        }

        // Transform arguments: message:"text" → { message:"text" }
        // Special case for TIM: can be called without params
        let transformedArgs;
        if (keyLetter === "TIM" && !argsStr.trim()) {
          transformedArgs = ""; // No params for TIM methods
        } else {
          transformedArgs = argsStr.trim() ? `{ ${argsStr} }` : "";
        }
        return `${keyLetter}.${methodName}(${transformedArgs})`;
      }
    );
  }

  /**
   * Transform create instance: create object instance var of ClassName;
   * → let var = {} as ClassName; // Create empty object, properties set after
   */
  transformCreateInstance(oal) {
    const createPattern =
      /create\s+object\s+instance\s+(\w+)\s+of\s+(\w+)\s*;/gi;

    return oal.replace(createPattern, (match, varName, className) => {
      // Find actual class name (might be KL or name)
      const cls = Array.from(this.classesMap.values()).find(
        (c) => c.name === className || c.key_letter === className
      );
      const actualClassName = cls ? cls.name : className;

      // Create empty object with type assertion
      // Properties will be set using setters in subsequent OAL statements
      return `let ${varName} = {} as ${actualClassName};`;
    });
  }

  /**
   * Transform select statements:
   * select one var related by self->KL[R1]; → let var = this.getRelated()[0];
   * select many vars related by self->KL[R2] where selected.attr == "value";
   * → let vars = this.getRelated().filter(selected => selected.attr === "value");
   */
  transformSelectStatements(oal) {
    // Pattern: select any/many/one var related by navigation [where condition];
    const selectPattern =
      /select\s+(any|many|one)\s+(\w+)\s+related\s+by\s+([\w\->\[\]]+)(?:\s+where\s+(.+?))?;/gi;

    return oal.replace(
      selectPattern,
      (match, selectType, varName, navigation, whereClause) => {
        // Parse navigation: self->KRS[R2] → getKRSList()
        const navParts = navigation.split("->");
        let tsCode = "";

        if (navParts.length >= 2) {
          const targetKL = navParts[1].match(/(\w+)/)[1];
          const cls = this.classesMap.get(targetKL);

          // Build method name: camelCase(ClassName) + capitalize first letter
          // Person → getPerson(), KRS (many) → getKRSList()
          let propName = cls
            ? this.toCamelCase(cls.name)
            : this.toCamelCase(targetKL);

          // For select many, assume List suffix (this is generator convention)
          if (selectType === "many" || selectType === "any") {
            propName += "List";
          }

          const methodName = `get${this.capitalize(propName)}`;

          if (selectType === "one") {
            // select one → direct call (returns single object) or .find()
            if (whereClause) {
              const condition = this.transformCondition(whereClause);
              // With where clause, assume array and use .find()
              tsCode = `let ${varName} = this.${methodName}().find(selected => ${condition});`;
            } else {
              // Without where clause, direct call (could be single object or array[0])
              // Check if method name has "List" suffix to determine if it returns array
              if (propName.endsWith("List")) {
                tsCode = `let ${varName} = this.${methodName}()[0];`;
              } else {
                tsCode = `let ${varName} = this.${methodName}();`;
              }
            }
          } else {
            // select any/many → .filter()
            if (whereClause) {
              const condition = this.transformCondition(whereClause);
              tsCode = `let ${varName} = this.${methodName}().filter(selected => ${condition});`;
            } else {
              tsCode = `let ${varName} = this.${methodName}();`;
            }
          }
        }

        return tsCode;
      }
    );
  }

  /**
   * Transform delete instance: delete object instance var;
   * → ClassName._instances.splice(ClassName._instances.indexOf(var), 1);
   */
  transformDeleteInstance(oal) {
    const deletePattern = /delete\s+object\s+instance\s+(\w+)\s*;/gi;

    return oal.replace(deletePattern, (match, varName) => {
      // Generic delete - assumes _instances array exists
      return (
        `// Delete ${varName} from _instances array\n` +
        `const idx = this.constructor._instances.indexOf(${varName});\n` +
        `if (idx !== -1) this.constructor._instances.splice(idx, 1);`
      );
    });
  }

  /**
   * Transform relate instances: relate var1 to var2 across RX;
   * → var1.relateToVar2Class(var2); or var1.linkViaRX(var2);
   */
  transformRelateInstances(oal) {
    const relatePattern = /relate\s+(\w+)\s+to\s+(\w+)\s+across\s+(R\d+)\s*;/gi;

    return oal.replace(
      relatePattern,
      (match, var1, var2, relationshipLabel) => {
        // Generic relate - calls a hypothetical relate method
        // In practice, this would use auto-generated relationship methods
        return `${var1}.relateTo${
          var2.charAt(0).toUpperCase() + var2.slice(1)
        }(${var2}); // ${relationshipLabel}`;
      }
    );
  }

  /**
   * Transform conditionals: if/elif/else/end if → if/else if/else
   */
  transformConditionals(oal) {
    let transformed = oal;

    // Transform conditions with operators first
    transformed = transformed.replace(/if\s*\((.*?)\)/g, (match, condition) => {
      return `if (${this.transformCondition(condition)})`;
    });

    transformed = transformed.replace(
      /elif\s*\((.*?)\)/g,
      (match, condition) => {
        return `} else if (${this.transformCondition(condition)})`;
      }
    );

    // Transform 'end if;' → '}'
    transformed = transformed.replace(/end\s+if\s*;?/gi, "}");

    // Add opening braces after conditions
    transformed = transformed.replace(/if\s*\([^)]+\)\s*$/gm, "$& {");
    transformed = transformed.replace(/else\s+if\s*\([^)]+\)\s*$/gm, "$& {");
    transformed = transformed.replace(/^(\s*)else\s*$/gm, "$1} else {");

    return transformed;
  }

  /**
   * Transform loops: for each item in collection → for (const item of collection)
   */
  transformLoops(oal) {
    const forPattern = /for\s+each\s+(\w+)\s+in\s+(\w+)\s*$/gim;
    let transformed = oal.replace(forPattern, "for (const $1 of $2) {");

    // Transform 'end for;' → '}'
    transformed = transformed.replace(/end\s+for\s*;?/gi, "}");

    return transformed;
  }

  /**
   * Transform operators: AND → &&, OR → ||, NOT → !, == → ===
   */
  transformOperators(oal) {
    let transformed = oal;

    // Boolean operators (case-insensitive, word boundaries)
    transformed = transformed.replace(/\bAND\b/gi, "&&");
    transformed = transformed.replace(/\bOR\b/gi, "||");
    transformed = transformed.replace(/\bNOT\b/gi, "!");

    // Comparison operators
    transformed = transformed.replace(/([^=!<>])={2}([^=])/g, "$1===$2"); // == → ===
    transformed = transformed.replace(/!=([^=])/g, "!==$1"); // != → !==

    // Helper functions
    transformed = transformed.replace(
      /\bnot_empty\s+(\w+)/gi,
      "$1 !== null && $1 !== undefined"
    );
    transformed = transformed.replace(
      /\bempty\s+(\w+)/gi,
      "$1 === null || $1 === undefined"
    );

    return transformed;
  }

  /**
   * Transform event parameters: param.xxx → params.xxx
   * Used in state action OAL to access event parameters
   */
  transformEventParameters(oal) {
    // Transform param.attributeName → params.attributeName
    return oal.replace(/\bparam\.(\w+)/g, "params.$1");
  }

  /**
   * Transform self keyword: self.xxx → this.xxx or just self → this
   * Must be done AFTER other transformations to avoid breaking patterns like "self->CLASS[R1]"
   */
  transformSelfKeyword(oal) {
    let transformed = oal;

    // Transform self.attribute → this.attribute
    transformed = transformed.replace(/\bself\.(\w+)/g, "this.$1");

    // Transform standalone self (but not inside navigation like "self->")
    transformed = transformed.replace(/\bself\b(?!->)/g, "this");

    return transformed;
  }

  /**
   * Pre-scan OAL to detect all variable assignments (before formatting changes)
   * This captures variables like: selisih = TIM::get_days_diff(...)
   * Before they get transformed to multi-line format
   */
  detectVariableAssignments(oal) {
    const variablesToDeclare = new Set();
    const lines = oal.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match: varname = expression (single line, before bridge formatting)
      // Exclude: this.x, obj.x, let x, const x, var x, params.x
      const assignmentMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*.+/);
      
      if (assignmentMatch) {
        const varName = assignmentMatch[1];
        
        // Skip if it's a property access or already declared
        const isPropertyOrDeclared = line.match(/\b(let|const|var|this|params)\b/) || 
                                     trimmed.includes('.') && trimmed.indexOf('.') < trimmed.indexOf('=');
        
        if (!isPropertyOrDeclared) {
          variablesToDeclare.add(varName);
        }
      }
    }
    
    return variablesToDeclare;
  }

  /**
   * Add 'let' declarations to variables that were detected in pre-scan
   * Works with multi-line assignments after bridge call formatting
   */
  addVariableDeclarations(oal, variablesToDeclare) {
    if (variablesToDeclare.size === 0) {
      return oal;
    }
    
    const lines = oal.split('\n');
    const transformed = [];
    const declaredVars = new Set();
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check if this line starts with a variable assignment
      const assignmentMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=/);
      
      if (assignmentMatch) {
        const varName = assignmentMatch[1];
        
        // If this variable needs declaration and hasn't been declared yet
        if (variablesToDeclare.has(varName) && !declaredVars.has(varName)) {
          declaredVars.add(varName);
          // Add 'let' to the line
          transformed.push(line.replace(/^(\s*)([a-zA-Z_]\w*\s*=)/, '$1let $2'));
        } else {
          transformed.push(line);
        }
      } else {
        transformed.push(line);
      }
    }
    
    return transformed.join('\n');
  }

  /**
   * Hoist variable declarations that are used across block scopes
   * Detects variables assigned in if/for blocks and used outside
   */
  /**
   * Transform variable assignments to include 'let' declaration
   * Detects standalone variable assignments: varname = value;
   * But skips: this.xxx, obj.xxx, let xxx, const xxx, var xxx, params.xxx
   * Only adds 'let' on first assignment (tracks declared variables)
   */
  transformVariableDeclarations(oal) {
    const lines = oal.split("\n");
    const transformed = [];
    const declaredVars = new Set();

    for (const line of lines) {
      const trimmed = line.trim();

      // Match pattern: identifier = expression;
      // But exclude: this.x, obj.x, let x, const x, var x, params.x
      const assignmentMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);

      if (assignmentMatch) {
        const varName = assignmentMatch[1];

        // Check if it's not already declared or is property access
        const isNotDeclared = !line.match(/\b(let|const|var|this|params)\b/);

        if (isNotDeclared && !declaredVars.has(varName)) {
          // First assignment - add 'let' declaration
          declaredVars.add(varName);
          transformed.push(
            line.replace(/^(\s*)([a-zA-Z_]\w*\s*=)/, "$1let $2")
          );
        } else {
          // Already declared or is property access - keep as is
          transformed.push(line);
        }
      } else {
        transformed.push(line);
      }
    }

    return transformed.join("\n");
  }

  /**
   * Transform condition expression (used in WHERE clauses and if conditions)
   */
  transformCondition(condition) {
    let transformed = condition;

    // Operators
    transformed = transformed.replace(/\bAND\b/gi, "&&");
    transformed = transformed.replace(/\bOR\b/gi, "||");
    transformed = transformed.replace(/\bNOT\b/gi, "!");

    // Comparison
    transformed = transformed.replace(/([^=!<>])={2}([^=])/g, "$1===$2");
    transformed = transformed.replace(/!=([^=])/g, "!==$1");

    return transformed;
  }

  /**
   * Format output with proper indentation
   */
  formatOutput(code) {
    const lines = code.split("\n");
    let formatted = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        formatted += `      ${line}\n`;
      }
    }

    return formatted;
  }

  /**
   * Helper: toCamelCase - converts "Person" → "person", "MataKuliah" → "mataKuliah"
   */
  toCamelCase(str) {
    if (!str) return "";
    // Handle spaces: "ajukan Cuti" → "ajukanCuti"
    return str
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toLowerCase() + word.slice(1);
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  }

  /**
   * Helper: capitalize - converts "person" → "Person"
   */
  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
