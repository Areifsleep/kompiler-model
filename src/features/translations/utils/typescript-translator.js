import { TypeMapper } from "./transformers/type-mapper.js";
import { OALTransformer } from "./transformers/oal-transformer.js";
import { ExternalEntityDetector } from "./analyzers/external-entity-detector.js";
import { ClassOrderAnalyzer } from "./analyzers/class-order-analyzer.js";
import { HeaderGenerator } from "./generators/header-generator.js";
import { RuntimeShimGenerator } from "./generators/runtime-shim-generator.js";

/**
 * TypeScript Code Generator from xtUML Model
 * Generates clean TypeScript code without unnecessary comments and examples
 */

export class TypeScriptTranslator {
  constructor(modelJson) {
    this.model = modelJson;
    this.classes = new Map();
    this.relationships = new Map();
    this.externalEntities = new Map();
    this.usedExternalEntities = new Set(); // Track which EEs are actually used
    this.subsystems = [];

    // Initialize components
    this.typeMapper = null;
    this.headerGenerator = new HeaderGenerator();
  }

  translate() {
    if (!this.model?.system_model?.subsystems) {
      throw new Error("Invalid model structure");
    }

    this.parseModel();
    return this.generateCode();
  }

  parseModel() {
    this.model.system_model.subsystems.forEach((subsystem) => {
      this.subsystems.push(subsystem);

      // Parse external entities (Rule 20 Shlaer-Mellor)
      if (subsystem.external_entities) {
        subsystem.external_entities.forEach((ee) => {
          this.externalEntities.set(ee.key_letter, ee);
        });
      }

      // Parse classes
      if (subsystem.classes) {
        subsystem.classes.forEach((cls) => {
          this.classes.set(cls.key_letter, cls);
        });
      }

      // Parse relationships
      if (subsystem.relationships) {
        subsystem.relationships.forEach((rel) => {
          this.relationships.set(rel.label, rel);
        });
      }
    });

    // Collect all data_types for domain type preservation
    const allDataTypes = [];
    this.subsystems.forEach((subsystem) => {
      if (subsystem.data_types) {
        allDataTypes.push(...subsystem.data_types);
      }
    });

    // Initialize components after parsing
    this.typeMapper = new TypeMapper(this.classes, allDataTypes);

    // Scan all OAL code to detect which External Entities are used
    const eeDetector = new ExternalEntityDetector(
      this.classes,
      this.externalEntities
    );
    this.usedExternalEntities = eeDetector.detect();
  }

  generateCode() {
    let code = this.headerGenerator.generate(this.model);
    code += this.generateRuntimeShims();
    code += this.generateTypeDefinitions();
    code += this.generateClasses();
    return code;
  }

  generateRuntimeShims() {
    const shimGenerator = new RuntimeShimGenerator(
      this.externalEntities,
      this.usedExternalEntities,
      this.typeMapper
    );
    return shimGenerator.generate();
  }

  generateTypeDefinitions() {
    let code = "// Type Definitions\n";
    code += "type inst_ref<T> = T | null; // Instance reference (nullable)\n";
    code += "type inst_ref_set<T> = T[]; // Instance reference set (array)\n";

    // Collect all custom types from data_types
    const customTypes = new Set();
    this.subsystems.forEach((subsystem) => {
      if (subsystem.data_types) {
        subsystem.data_types.forEach((dt) => {
          if (dt.core_type) {
            // Skip state<X> types - they're generated separately below
            if (dt.name.startsWith("state<")) {
              return;
            }

            // For unique_ID, always define it
            if (dt.name === "unique_ID") {
              customTypes.add(`type unique_ID = string;`);
              return;
            }

            // For other types, only define if name != core_type (it's an alias)
            if (dt.name !== dt.core_type) {
              const tsType = this.mapCoreTypeToTS(dt.core_type);
              customTypes.add(`type ${dt.name} = ${tsType};`);
            }
          }
        });
      }
    });

    customTypes.forEach((typeDef) => {
      code += typeDef + "\n";
    });

    // Generate state types
    this.classes.forEach((cls) => {
      if (cls.state_model && cls.state_model.states) {
        const stateNames = cls.state_model.states
          .map((s) => `"${s.name}"`)
          .join(" | ");
        code += `type ${cls.name}State = ${stateNames};\n`;
      }
    });

    // Generate event parameter interfaces
    this.classes.forEach((cls) => {
      if (cls.state_model && cls.state_model.events) {
        cls.state_model.events.forEach((event) => {
          if (event.parameters && event.parameters.length > 0) {
            code += `\ninterface ${event.label}EventParams {\n`;
            event.parameters.forEach((param) => {
              const tsType = this.mapCoreTypeToTS(param.type);
              code += `  ${param.name}: ${tsType};\n`;
            });
            code += `}\n`;
          }
        });
      }
    });

    code += "\n";
    return code;
  }

  generateClasses() {
    let code = "";
    const processedClasses = new Set();
    const classOrderAnalyzer = new ClassOrderAnalyzer(
      this.classes,
      this.relationships
    );
    const classOrder = classOrderAnalyzer.determine();

    classOrder.forEach((keyLetter) => {
      const cls = this.classes.get(keyLetter);
      if (cls && !processedClasses.has(keyLetter)) {
        code += this.generateClass(cls);
        processedClasses.add(keyLetter);
      }
    });

    return code;
  }

  determineClassOrder() {
    const analyzer = new ClassOrderAnalyzer(this.classes, this.relationships);
    return analyzer.determine();
  }

  hasForeignKeys(cls) {
    if (!cls.attributes) return false;
    return cls.attributes.some((attr) => attr.referential);
  }

  generateClass(cls) {
    const superclass = this.findSuperclass(cls.key_letter);
    const extendsClause = superclass ? ` extends ${superclass.name}` : "";
    const isAssociation = cls.type === "Association";

    let code = `export class ${cls.name}${extendsClause} {\n`;

    // Attributes
    code += this.generateAttributes(cls, !!superclass);

    // Constructor
    code += this.generateConstructor(cls, superclass);

    // Getters
    code += this.generateGetters(cls);

    // Setters
    code += this.generateSetters(cls);

    // Navigation methods for relationships
    code += this.generateNavigationMethods(cls);

    // State model methods
    if (cls.state_model) {
      code += this.generateStateMethods(cls);
    }

    code += "}\n\n";
    return code;
  }

  generateAttributes(cls, hasSuper) {
    let code = "";

    if (cls.attributes) {
      cls.attributes.forEach((attr) => {
        // Skip referential attributes that point to supertype (they're inherited)
        if (hasSuper && attr.referential) {
          const rel = Array.from(this.relationships.values()).find(
            (r) => r.label === attr.referential
          );
          if (rel && rel.type === "Subtype") {
            return; // Skip inherited attributes
          }
        }

        const tsType = this.mapTypeToTS(attr.type, cls);
        const nullable =
          !attr.is_identifier && attr.referential ? " | null" : "";
        code += `  public ${attr.name}: ${tsType}${nullable};\n`;
      });
    }

    // Navigation properties
    const navProps = this.getNavigationProperties(cls.key_letter);
    navProps.forEach((prop) => {
      code += `  public ${prop.name}: ${prop.type};\n`;
    });

    if (code) code += "\n";
    return code;
  }

  generateConstructor(cls, superclass) {
    let code = "  constructor(";

    const params = [];

    // Superclass params first
    if (superclass && superclass.attributes) {
      superclass.attributes.forEach((attr) => {
        const tsType = this.mapTypeToTS(attr.type, superclass);
        params.push(`${attr.name}: ${tsType}`);
      });
    }

    // Own params - separate required and optional
    const requiredParams = [];
    const optionalParams = [];

    if (cls.attributes) {
      cls.attributes.forEach((attr) => {
        // Skip referential attributes that point to supertype
        if (superclass && attr.referential) {
          const rel = Array.from(this.relationships.values()).find(
            (r) => r.label === attr.referential
          );
          if (rel && rel.type === "Subtype") {
            return; // Skip inherited attributes
          }
        }

        const tsType = this.mapTypeToTS(attr.type, cls);
        // Make non-identifier referential attributes optional
        const isOptional = !attr.is_identifier && attr.referential;

        if (isOptional) {
          optionalParams.push(`${attr.name}?: ${tsType}`);
        } else {
          requiredParams.push(`${attr.name}: ${tsType}`);
        }
      });
    }

    // Add required params first, then optional params
    params.push(...requiredParams);
    params.push(...optionalParams);

    code += params.join(", ");
    code += ") {\n";

    // Super call
    if (superclass && superclass.attributes) {
      const superParams = superclass.attributes.map((a) => a.name).join(", ");
      code += `    super(${superParams});\n`;
    }

    // Initialize own attributes (skip referential to supertype)
    if (cls.attributes) {
      cls.attributes.forEach((attr) => {
        // Skip referential attributes that point to supertype
        if (superclass && attr.referential) {
          const rel = Array.from(this.relationships.values()).find(
            (r) => r.label === attr.referential
          );
          if (rel && rel.type === "Subtype") {
            return; // Skip inherited attributes
          }
        }

        if (!attr.is_identifier && attr.referential) {
          code += `    this.${attr.name} = ${attr.name} || null;\n`;
        } else {
          code += `    this.${attr.name} = ${attr.name};\n`;
        }
      });
    }

    // Initialize navigation properties
    const navProps = this.getNavigationProperties(cls.key_letter);
    navProps.forEach((prop) => {
      // Check for inst_ref_set<T> or T[] patterns
      const isSet =
        prop.type.startsWith("inst_ref_set<") || prop.type.includes("[]");

      // CRITICAL FIX: Check if this is a Subtype relationship navigation to superclass
      let initialValue = isSet ? "[]" : "null";

      // Find if this property represents a subtype-to-superclass relationship
      const subtypeRel = Array.from(this.relationships.values()).find(
        (rel) =>
          rel.type === "Subtype" &&
          rel.subclasses?.some((sub) => sub.key_letter === cls.key_letter) &&
          rel.superclass &&
          this.toCamelCase(
            this.classes.get(rel.superclass.key_letter)?.name
          ) === prop.name
      );

      // If this class is a subtype and this property navigates to superclass,
      // initialize with 'this' because subtype IS-A supertype (inheritance)
      if (subtypeRel) {
        initialValue = "this";
      }

      code += `    this.${prop.name} = ${initialValue};\n`;
    });

    code += "  }\n\n";
    return code;
  }

  generateGetters(cls) {
    let code = "";

    // Find superclass
    const superRel = Array.from(this.relationships.values()).find(
      (r) =>
        r.type === "Subtype" &&
        r.subclasses?.some((sub) => sub.key_letter === cls.key_letter)
    );
    const superclass = superRel
      ? this.classes.get(superRel.superclass?.key_letter)
      : null;

    if (cls.attributes) {
      cls.attributes.forEach((attr) => {
        // Skip referential attributes that point to supertype (getter inherited)
        if (superclass && attr.referential) {
          const rel = Array.from(this.relationships.values()).find(
            (r) => r.label === attr.referential
          );
          if (rel && rel.type === "Subtype") {
            return; // Skip inherited getter
          }
        }

        const tsType = this.mapTypeToTS(attr.type, cls);
        const nullable =
          !attr.is_identifier && attr.referential ? " | null" : "";
        const methodName = `get${this.capitalize(attr.name)}`;
        code += `  ${methodName}(): ${tsType}${nullable} {\n`;
        code += `    return this.${attr.name};\n`;
        code += `  }\n\n`;
      });
    }

    return code;
  }

  generateSetters(cls) {
    let code = "";

    // Find superclass
    const superRel = Array.from(this.relationships.values()).find(
      (r) =>
        r.type === "Subtype" &&
        r.subclasses?.some((sub) => sub.key_letter === cls.key_letter)
    );
    const superclass = superRel
      ? this.classes.get(superRel.superclass?.key_letter)
      : null;

    if (cls.attributes) {
      cls.attributes.forEach((attr) => {
        // Skip identifiers
        if (attr.is_identifier) return;

        // Skip referential attributes that point to supertype (setter inherited)
        if (superclass && attr.referential) {
          const rel = Array.from(this.relationships.values()).find(
            (r) => r.label === attr.referential
          );
          if (rel && rel.type === "Subtype") {
            return; // Skip inherited setter
          }
        }

        const tsType = this.mapTypeToTS(attr.type, cls);
        const methodName = `set${this.capitalize(attr.name)}`;
        code += `  ${methodName}(${attr.name}: ${tsType}): void {\n`;
        code += `    this.${attr.name} = ${attr.name};\n`;
        code += `  }\n\n`;
      });
    }

    return code;
  }

  generateNavigationMethods(cls) {
    let code = "";
    const rels = this.getRelationshipsForClass(cls.key_letter);

    rels.forEach((rel) => {
      if (rel.type === "Simple") {
        code += this.generateSimpleNavigation(cls, rel);
      } else if (rel.type === "Associative") {
        code += this.generateAssociativeNavigation(cls, rel);
      } else if (rel.type === "Composition" || rel.type === "Aggregation") {
        code += this.generateCompositionAggregationNavigation(cls, rel);
      } else if (rel.type === "Reflexive") {
        code += this.generateReflexiveNavigation(cls, rel);
      } else if (rel.type === "Subtype") {
        code += this.generateSubtypeNavigation(cls, rel);
      }
    });

    return code;
  }

  generateSimpleNavigation(cls, rel) {
    let code = "";
    const isOneSide = rel.one_side?.key_letter === cls.key_letter;
    const targetKL = isOneSide
      ? rel.other_side?.key_letter
      : rel.one_side?.key_letter;
    const targetClass = this.classes.get(targetKL);

    if (!targetClass) return "";

    const mult = isOneSide ? rel.other_side?.mult : rel.one_side?.mult;
    const isMany = mult === "Many";

    const propName =
      this.toCamelCase(targetClass.name) + (isMany ? "List" : "");
    const returnType = isMany
      ? `${targetClass.name}[]`
      : `${targetClass.name} | null`;

    code += `  get${this.capitalize(propName)}(): ${returnType} {\n`;
    code += `    return this.${propName};\n`;
    code += `  }\n\n`;

    if (isMany) {
      code += `  add${targetClass.name}(item: ${targetClass.name}): void {\n`;
      code += `    if (this.${propName}.indexOf(item) === -1) {\n`;
      code += `      this.${propName}.push(item);\n`;
      code += `    }\n`;
      code += `  }\n\n`;

      code += `  remove${targetClass.name}(item: ${targetClass.name}): void {\n`;
      code += `    const index = this.${propName}.indexOf(item);\n`;
      code += `    if (index > -1) {\n`;
      code += `      this.${propName}.splice(index, 1);\n`;
      code += `    }\n`;
      code += `  }\n\n`;
    } else {
      code += `  set${this.capitalize(propName)}(item: ${
        targetClass.name
      } | null): void {\n`;
      code += `    this.${propName} = item;\n`;
      code += `  }\n\n`;
    }

    return code;
  }

  generateAssociativeNavigation(cls, rel) {
    let code = "";
    const assocClass = this.classes.get(rel.association_class?.key_letter);

    if (!assocClass) return "";

    if (
      rel.one_side?.key_letter === cls.key_letter ||
      rel.other_side?.key_letter === cls.key_letter
    ) {
      const propName = this.toCamelCase(assocClass.name) + "List";
      code += `  get${this.capitalize(propName)}(): ${assocClass.name}[] {\n`;
      code += `    return this.${propName};\n`;
      code += `  }\n\n`;

      code += `  add${assocClass.name}(item: ${assocClass.name}): void {\n`;
      code += `    if (this.${propName}.indexOf(item) === -1) {\n`;
      code += `      this.${propName}.push(item);\n`;
      code += `    }\n`;
      code += `  }\n\n`;

      code += `  remove${assocClass.name}(item: ${assocClass.name}): void {\n`;
      code += `    const index = this.${propName}.indexOf(item);\n`;
      code += `    if (index > -1) {\n`;
      code += `      this.${propName}.splice(index, 1);\n`;
      code += `    }\n`;
      code += `  }\n\n`;
    }

    // For association class itself
    if (rel.association_class?.key_letter === cls.key_letter) {
      // Add navigation to both sides
      const oneSideClass = this.classes.get(rel.one_side?.key_letter);
      const otherSideClass = this.classes.get(rel.other_side?.key_letter);

      if (oneSideClass) {
        const propName = this.toCamelCase(oneSideClass.name);
        code += `  get${this.capitalize(propName)}(): ${
          oneSideClass.name
        } | null {\n`;
        code += `    return this.${propName};\n`;
        code += `  }\n\n`;

        code += `  set${this.capitalize(propName)}(item: ${
          oneSideClass.name
        }): void {\n`;
        code += `    this.${propName} = item;\n`;
        code += `  }\n\n`;
      }

      if (otherSideClass) {
        const propName = this.toCamelCase(otherSideClass.name);
        code += `  get${this.capitalize(propName)}(): ${
          otherSideClass.name
        } | null {\n`;
        code += `    return this.${propName};\n`;
        code += `  }\n\n`;

        code += `  set${this.capitalize(propName)}(item: ${
          otherSideClass.name
        }): void {\n`;
        code += `    this.${propName} = item;\n`;
        code += `  }\n\n`;
      }
    }

    return code;
  }

  generateCompositionAggregationNavigation(cls, rel) {
    // Similar to Simple navigation but with special delete behavior for Composition
    let code = this.generateSimpleNavigation(cls, rel);

    // Add delete method for Composition owner
    if (
      rel.type === "Composition" &&
      rel.one_side?.key_letter === cls.key_letter
    ) {
      const targetClass = this.classes.get(rel.other_side?.key_letter);
      if (targetClass) {
        code += `  delete(): void {\n`;
        const propName = this.toCamelCase(targetClass.name);
        code += `    if (this.${propName}) {\n`;
        code += `      this.${propName} = null;\n`;
        code += `    }\n`;
        code += `  }\n\n`;
      }
    }

    return code;
  }

  generateReflexiveNavigation(cls, rel) {
    let code = "";

    if (rel.one_side?.key_letter !== cls.key_letter) return "";

    const oneSideRole = rel.one_side?.role || "parent";
    const otherSideRole = rel.other_side?.role || "children";

    const oneSideMult = rel.one_side?.mult;
    const otherSideMult = rel.other_side?.mult;

    // Generate navigation for "one side" (e.g., mentor)
    if (oneSideMult === "One") {
      const propName = this.toCamelCase(oneSideRole);
      code += `  get${this.capitalize(propName)}(): ${cls.name} | null {\n`;
      code += `    return this.${propName};\n`;
      code += `  }\n\n`;

      code += `  set${this.capitalize(propName)}(item: ${cls.name}): void {\n`;
      code += `    this.${propName} = item;\n`;
      code += `  }\n\n`;
    }

    // Generate navigation for "other side" (e.g., mentees)
    if (otherSideMult === "Many") {
      const propName = this.toCamelCase(otherSideRole);
      code += `  get${this.capitalize(propName)}(): ${cls.name}[] {\n`;
      code += `    return this.${propName};\n`;
      code += `  }\n\n`;

      code += `  add${this.capitalize(
        otherSideRole.slice(0, -1) || "Item"
      )}(item: ${cls.name}): void {\n`;
      code += `    if (this.${propName}.indexOf(item) === -1) {\n`;
      code += `      this.${propName}.push(item);\n`;
      code += `    }\n`;
      code += `  }\n\n`;

      code += `  remove${this.capitalize(
        otherSideRole.slice(0, -1) || "Item"
      )}(item: ${cls.name}): void {\n`;
      code += `    const index = this.${propName}.indexOf(item);\n`;
      code += `    if (index > -1) {\n`;
      code += `      this.${propName}.splice(index, 1);\n`;
      code += `    }\n`;
      code += `  }\n\n`;
    }

    return code;
  }

  generateSubtypeNavigation(cls, rel) {
    let code = "";

    // Only generate for subtype classes (navigating to supertype)
    if (!rel.subclasses?.some((sub) => sub.key_letter === cls.key_letter)) {
      return code;
    }

    const superClass = this.classes.get(rel.superclass?.key_letter);
    if (!superClass) return code;

    const propName = this.toCamelCase(superClass.name);

    code += `  get${this.capitalize(propName)}(): ${
      superClass.name
    } | null {\n`;
    code += `    return this.${propName};\n`;
    code += `  }\n\n`;

    code += `  set${this.capitalize(propName)}(item: ${
      superClass.name
    } | null): void {\n`;
    code += `    this.${propName} = item;\n`;
    code += `  }\n\n`;

    return code;
  }

  generateStateMethods(cls) {
    let code = "";

    if (!cls.state_model?.events || !cls.state_model?.transitions) {
      return code;
    }

    cls.state_model.events.forEach((event) => {
      const methodName = this.toCamelCase(event.meaning || event.label);
      const transitions = cls.state_model.transitions.filter(
        (t) => t.event === event.label
      );

      if (transitions.length === 0) return;

      // Parameters
      let params = "";
      if (event.parameters && event.parameters.length > 0) {
        params = `params: ${event.label}EventParams`;
      }

      code += `  ${methodName}(${params}): void {\n`;

      transitions.forEach((transition, idx) => {
        const condition = idx === 0 ? "if" : "else if";
        code += `    ${condition} (this.Current_State === "${transition.from_state}") {\n`;

        // Find state action OAL and transform bridge calls
        const state = cls.state_model.states.find(
          (s) => s.name === transition.to_state
        );
        if (state && state.action_oal) {
          const transformedOAL = this.transformOAL(state.action_oal);
          if (transformedOAL) {
            code += transformedOAL;
          }
        }

        code += `      this.Current_State = "${transition.to_state}";\n`;
        code += `    }`;

        if (idx === transitions.length - 1) {
          code += ` else {\n`;
          code += `      throw new Error(\`Invalid state transition from \${this.Current_State}\`);\n`;
          code += `    }\n`;
        } else {
          code += "\n";
        }
      });

      code += `  }\n\n`;
    });

    return code;
  }

  /**
   * Transform OAL (Object Action Language) to TypeScript
   * Validates and transforms bridge calls and BPAL97 features
   */
  transformOAL(oal) {
    const oalTransformer = new OALTransformer(
      this.externalEntities,
      this.classes
    );
    return oalTransformer.transform(oal);
  }

  getNavigationProperties(keyLetter) {
    const props = [];

    this.relationships.forEach((rel) => {
      if (
        rel.type === "Simple" ||
        rel.type === "Composition" ||
        rel.type === "Aggregation"
      ) {
        if (rel.one_side?.key_letter === keyLetter) {
          const targetClass = this.classes.get(rel.other_side?.key_letter);
          if (targetClass) {
            const isMany = rel.other_side?.mult === "Many";
            props.push({
              name: this.toCamelCase(targetClass.name) + (isMany ? "List" : ""),
              type: isMany
                ? `inst_ref_set<${targetClass.name}>`
                : `inst_ref<${targetClass.name}>`,
            });
          }
        } else if (rel.other_side?.key_letter === keyLetter) {
          const targetClass = this.classes.get(rel.one_side?.key_letter);
          if (targetClass) {
            const isMany = rel.one_side?.mult === "Many";
            props.push({
              name: this.toCamelCase(targetClass.name) + (isMany ? "List" : ""),
              type: isMany
                ? `inst_ref_set<${targetClass.name}>`
                : `inst_ref<${targetClass.name}>`,
            });
          }
        }
      } else if (rel.type === "Associative") {
        const assocClass = this.classes.get(rel.association_class?.key_letter);
        if (
          assocClass &&
          (rel.one_side?.key_letter === keyLetter ||
            rel.other_side?.key_letter === keyLetter)
        ) {
          props.push({
            name: this.toCamelCase(assocClass.name) + "List",
            type: `inst_ref_set<${assocClass.name}>`,
          });
        }

        // For association class itself
        if (assocClass && rel.association_class?.key_letter === keyLetter) {
          const oneSideClass = this.classes.get(rel.one_side?.key_letter);
          const otherSideClass = this.classes.get(rel.other_side?.key_letter);

          if (oneSideClass) {
            props.push({
              name: this.toCamelCase(oneSideClass.name),
              type: `inst_ref<${oneSideClass.name}>`,
            });
          }

          if (otherSideClass) {
            props.push({
              name: this.toCamelCase(otherSideClass.name),
              type: `inst_ref<${otherSideClass.name}>`,
            });
          }
        }
      } else if (
        rel.type === "Reflexive" &&
        rel.one_side?.key_letter === keyLetter
      ) {
        const oneSideRole = rel.one_side?.role || "parent";
        const otherSideRole = rel.other_side?.role || "children";
        const oneSideMult = rel.one_side?.mult;
        const otherSideMult = rel.other_side?.mult;

        if (oneSideMult === "One") {
          props.push({
            name: this.toCamelCase(oneSideRole),
            type: `inst_ref<${this.classes.get(keyLetter).name}>`,
          });
        }

        if (otherSideMult === "Many") {
          props.push({
            name: this.toCamelCase(otherSideRole),
            type: `inst_ref_set<${this.classes.get(keyLetter).name}>`,
          });
        }
      } else if (rel.type === "Subtype") {
        // For subtype: navigate to supertype (one-to-one)
        if (rel.subclasses?.some((sub) => sub.key_letter === keyLetter)) {
          const superClass = this.classes.get(rel.superclass?.key_letter);
          if (superClass) {
            props.push({
              name: this.toCamelCase(superClass.name),
              type: `${superClass.name} | null`,
            });
          }
        }
      }
    });

    return props;
  }

  getRelationshipsForClass(keyLetter) {
    const rels = [];

    this.relationships.forEach((rel) => {
      if (
        rel.one_side?.key_letter === keyLetter ||
        rel.other_side?.key_letter === keyLetter ||
        rel.association_class?.key_letter === keyLetter
      ) {
        rels.push(rel);
      } else if (rel.type === "Subtype") {
        // Check if this class is a subtype in this relationship
        if (rel.subclasses?.some((sub) => sub.key_letter === keyLetter)) {
          rels.push(rel);
        }
        // Check if this class is the superclass
        if (rel.superclass?.key_letter === keyLetter) {
          rels.push(rel);
        }
      }
    });

    return rels;
  }

  findSuperclass(keyLetter) {
    let superclass = null;

    this.relationships.forEach((rel) => {
      if (rel.type === "Subtype" && rel.subclasses) {
        const isSubtype = rel.subclasses.some(
          (sc) => sc.key_letter === keyLetter
        );
        if (isSubtype && rel.superclass) {
          superclass = this.classes.get(rel.superclass.key_letter);
        }
      }
    });

    return superclass;
  }

  mapTypeToTS(type, cls) {
    return this.typeMapper.mapToTS(type, cls);
  }

  mapCoreTypeToTS(type) {
    return this.typeMapper.mapCoreType(type);
  }

  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toCamelCase(str) {
    if (!str) return "";
    // Remove spaces and capitalize first letter after space
    // "ajukan Cuti" → "ajukanCuti"
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
}
