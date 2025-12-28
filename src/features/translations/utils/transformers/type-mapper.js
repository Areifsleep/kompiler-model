/**
 * Type Mapper
 * Maps xtUML types to TypeScript types
 */
export class TypeMapper {
  constructor(classes, dataTypes = []) {
    this.classes = classes;
    this.dataTypes = new Map();
    
    // Build a map of domain types: name -> core_type
    dataTypes.forEach(dt => {
      if (dt.name && dt.core_type) {
        this.dataTypes.set(dt.name, dt.core_type);
      }
    });
  }

  /**
   * Map xtUML type to TypeScript type
   */
  mapToTS(type, cls) {
    if (!type) return "any";

    // Handle inst_ref<T> → T | null
    if (type.startsWith("inst_ref<") && !type.startsWith("inst_ref_set<")) {
      const innerType = type.match(/inst_ref<(.+)>/)?.[1];
      if (innerType) {
        // Recursively map the inner type
        const mappedInner = this.mapToTS(innerType, cls);
        return `${mappedInner} | null`;
      }
    }

    // Handle inst_ref_set<T> → T[]
    if (type.startsWith("inst_ref_set<")) {
      const innerType = type.match(/inst_ref_set<(.+)>/)?.[1];
      if (innerType) {
        const mappedInner = this.mapToTS(innerType, cls);
        return `${mappedInner}[]`;
      }
    }

    // Handle state<KL> → ClassNameState (sanitized)
    if (type.startsWith("state<")) {
      const kl = type.match(/state<(.+)>/)?.[1];
      const stateClass = this.classes.get(kl);
      if (stateClass) {
        // Sanitize class name: capitalize first letter
        const className = stateClass.name.charAt(0).toUpperCase() + stateClass.name.slice(1);
        return `${className}State`;
      }
      return "string";
    }

    return this.mapCoreType(type);
  }

  /**
   * Map core xtUML types to TypeScript
   */
  mapCoreType(type) {
    // IMPORTANT: Check if this is a domain type first (e.g., nama_orang, sks_type, unique_ID)
    // If it exists in dataTypes map, return the domain type name itself (not its core_type)
    // This preserves the alias and avoids "Type declared but never used" warnings
    if (this.dataTypes.has(type)) {
      return type; // Return domain type name as-is (e.g., "unique_ID", "nama_orang")
    }
    
    // Core type mappings (only for types NOT in dataTypes)
    const typeMap = {
      unique_ID: "unique_ID", // Default if not in dataTypes
      string: "string",
      integer: "number",
      boolean: "boolean",
      date: "Date",
      real: "number",
      void: "void",
    };

    return typeMap[type] || type || "any";
  }

  /**
   * Get default value for a TypeScript type
   */
  getDefaultValue(type) {
    const typeMap = {
      string: '""',
      number: "0",
      integer: "0",
      boolean: "false",
      any: "null",
    };
    return typeMap[type] || "null";
  }
}
