/**
 * Class Order Analyzer
 * Determines the order in which classes should be generated
 */
export class ClassOrderAnalyzer {
  constructor(classes, relationships) {
    this.classes = classes;
    this.relationships = relationships;
  }

  /**
   * Determine class generation order
   * Order: Independent -> Base -> Subtypes -> Others
   */
  determine() {
    const order = [];
    const subtypes = new Set();

    // Find subtypes from R1 (generalization)
    this.relationships.forEach((rel) => {
      if (rel.type === "Subtype" && rel.subclasses) {
        rel.subclasses.forEach((sc) => subtypes.add(sc.key_letter));
      }
    });

    // First: classes without foreign keys (independent)
    this.classes.forEach((cls, kl) => {
      if (!subtypes.has(kl) && !this.hasForeignKeys(cls)) {
        order.push(kl);
      }
    });

    // Second: base classes (supertypes)
    this.relationships.forEach((rel) => {
      if (rel.type === "Subtype" && rel.superclass) {
        if (!order.includes(rel.superclass.key_letter)) {
          order.push(rel.superclass.key_letter);
        }
      }
    });

    // Third: subtypes
    subtypes.forEach((kl) => {
      if (!order.includes(kl)) {
        order.push(kl);
      }
    });

    // Finally: remaining classes
    this.classes.forEach((cls, kl) => {
      if (!order.includes(kl)) {
        order.push(kl);
      }
    });

    return order;
  }

  /**
   * Check if class has foreign keys
   */
  hasForeignKeys(cls) {
    if (!cls.attributes) return false;
    return cls.attributes.some((attr) => attr.referential);
  }
}
