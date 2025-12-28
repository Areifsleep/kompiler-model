/**
 * Type Mapper
 * Maps xtUML types to TypeScript types
 */
export class TypeMapper {
  constructor(classes) {
    this.classes = classes;
  }

  /**
   * Map xtUML type to TypeScript type
   */
  mapToTS(type, cls) {
    // Handle state types
    if (type?.startsWith("state<")) {
      const kl = type.match(/state<(.+)>/)?.[1];
      const stateClass = this.classes.get(kl);
      return stateClass ? `${stateClass.name}State` : "string";
    }

    return this.mapCoreType(type);
  }

  /**
   * Map core xtUML types to TypeScript
   */
  mapCoreType(type) {
    const typeMap = {
      unique_ID: "UniqueID",
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
